import React, { useState } from 'react';
import { api } from '../api/client';
import { Sparkles, Send, CheckCircle2, ArrowRight, AlertCircle, Bot } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import CategoryBadge from '../components/CategoryBadge';

export default function SubmitRequest({ onTicketCreated, onNavigate }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    complaint: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validations
    if (!formData.customer_name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formData.customer_email.trim() || !formData.customer_email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Please provide a subject line for your inquiry.');
      return;
    }
    if (!formData.complaint.trim() || formData.complaint.trim().length < 10) {
      setError('Please describe your issue in more detail (at least 10 characters).');
      return;
    }

    try {
      setLoading(true);
      setLoadingStage('Connecting to Google Gemini AI...');

      const timer = setTimeout(() => {
        setLoadingStage('Analyzing complaint & detecting urgency...');
      }, 1500);

      const timer2 = setTimeout(() => {
        setLoadingStage('Drafting empathetic support response...');
      }, 3500);

      const response = await api.createRequest(formData);

      clearTimeout(timer);
      clearTimeout(timer2);

      setCreatedTicket(response);
      if (onTicketCreated) {
        onTicketCreated(response);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit support request. Please check server connection.');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleReset = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      subject: '',
      complaint: '',
    });
    setCreatedTicket(null);
    setError(null);
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Submit a Support Request</h1>
        <p className="page-description">
          Describe your issue below. Our AI-assisted support system powered by Google Gemini will
          immediately categorize, summarize, and draft an intelligent resolution.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Submission Error:</strong> {error}
          </div>
        </div>
      )}

      {createdTicket ? (
        <div className="card" style={{ borderColor: 'var(--status-resolved-border)' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--status-resolved-text)' }}>
              <CheckCircle2 size={22} />
              Support Request Processed Successfully!
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StatusBadge status={createdTicket.status} />
              <UrgencyBadge urgency={createdTicket.urgency} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {createdTicket.subject}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Submitted by {createdTicket.customer_name} ({createdTicket.customer_email})
              </p>
            </div>

            <div>
              <span className="metric-label" style={{ marginBottom: '6px', display: 'block' }}>
                AI Analysis & Summary
              </span>
              <div className="ai-summary-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: 700 }}>
                  <Sparkles size={16} />
                  AI Executive Summary:
                </div>
                {createdTicket.ai_summary}
              </div>
            </div>

            <div>
              <span className="metric-label" style={{ marginBottom: '6px', display: 'block' }}>
                AI-Generated Customer Response
              </span>
              <div className="ai-reply-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700 }}>
                  <Bot size={16} />
                  Drafted by Gemini AI:
                </div>
                {createdTicket.ai_reply}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => onNavigate('detail', createdTicket.id)}
                className="btn btn-primary"
              >
                <span>View Full Ticket Details</span>
                <ArrowRight size={16} />
              </button>

              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label" htmlFor="customer_name">
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="customer_name"
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="customer_email">
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="customer_email"
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="e.g. jane.doe@company.com"
              className="form-input"
              required
              disabled={loading}
            />
            <span className="form-hint">We will send automated updates and replies to this email.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject">
              Subject <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Unable to export quarterly report to CSV"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="complaint">
              Detailed Complaint / Issue Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="complaint"
              name="complaint"
              value={formData.complaint}
              onChange={handleChange}
              placeholder="Please provide full details about the issue you encountered, error messages, and steps to reproduce..."
              className="form-textarea"
              required
              disabled={loading}
            />
            <span className="form-hint">The AI triage system analyzes this description to determine urgency, category, and solution.</span>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>{loadingStage || 'Processing with Gemini AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Submit Support Request</span>
                </>
              )}
            </button>

            {loading && (
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gemini API is actively categorizing, evaluating urgency, and authoring a resolution draft...
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
