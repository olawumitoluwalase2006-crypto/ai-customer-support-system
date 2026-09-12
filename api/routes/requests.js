import { Router } from 'express';
import { getSupabaseClient } from '../config/supabase.js';
import { analyzeAndDraftReply, regenerateReply } from '../config/gemini.js';

const router = Router();

const VALID_STATUSES = ['Pending', 'AI Responded', 'Resolved'];

/**
 * POST /api/requests
 * Submit a new support request, trigger Gemini AI triage and reply generation,
 * and persist the ticket into Supabase.
 */
router.post('/', async (req, res, next) => {
  try {
    const { customer_name, customer_email, subject, complaint } = req.body;

    // Validation
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }
    if (!customer_email || typeof customer_email !== 'string' || !customer_email.trim() || !customer_email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid customer email is required' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }
    if (!complaint || typeof complaint !== 'string' || complaint.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'A detailed complaint is required (at least 5 characters)' });
    }

    const trimmedName = customer_name.trim();
    const trimmedEmail = customer_email.trim();
    const trimmedSubject = subject.trim();
    const trimmedComplaint = complaint.trim();

    // 1. Invoke Google Gemini AI to analyze, classify, summarize, and draft customer reply
    const aiAnalysis = await analyzeAndDraftReply({
      customer_name: trimmedName,
      customer_email: trimmedEmail,
      subject: trimmedSubject,
      complaint: trimmedComplaint,
    });

    // 2. Persist to Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('support_requests')
      .insert([
        {
          customer_name: trimmedName,
          customer_email: trimmedEmail,
          subject: trimmedSubject,
          complaint: trimmedComplaint,
          category: aiAnalysis.category,
          urgency: aiAnalysis.urgency,
          ai_summary: aiAnalysis.ai_summary,
          ai_reply: aiAnalysis.ai_reply,
          status: 'AI Responded',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({
        success: false,
        error: `Database error while creating support request: ${error.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests
 * List support requests with optional filtering and search
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, urgency, category, search } = req.query;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && VALID_STATUSES.includes(status)) {
      query = query.eq('status', status);
    }

    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(
        `customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,complaint.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase List Error:', error);
      return res.status(500).json({
        success: false,
        error: `Database error while fetching requests: ${error.message}`,
      });
    }

    return res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/requests/:id
 * Retrieve full details of a single support ticket
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Support request not found' });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/requests/:id/status
 * Update the status of a request ('Pending', 'AI Responded', 'Resolved')
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('support_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/requests/:id/regenerate
 * Regenerate an AI customer response for an existing ticket using Gemini API
 */
router.post('/:id/regenerate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // 1. Fetch current ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from('support_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({ success: false, error: 'Support request not found' });
    }

    // 2. Request Gemini API to regenerate customer support response
    const newAiReply = await regenerateReply({
      customer_name: ticket.customer_name,
      subject: ticket.subject,
      complaint: ticket.complaint,
      category: ticket.category,
      urgency: ticket.urgency,
    });

    // 3. Update in Supabase
    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_requests')
      .update({
        ai_reply: newAiReply,
        status: ticket.status === 'Pending' ? 'AI Responded' : ticket.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, error: updateError.message });
    }

    return res.json({
      success: true,
      data: updatedTicket,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
