import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = () => {
  return Boolean(apiKey && apiKey.trim().length > 0 && !apiKey.includes('your-gemini-api-key'));
};

function getGeminiClient() {
  if (!isGeminiConfigured()) {
    throw new Error(
      'Missing or unconfigured GEMINI_API_KEY. Please set GEMINI_API_KEY in your environment variables.'
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

// Allowed categories and urgencies
export const ALLOWED_CATEGORIES = [
  'Technical Support',
  'Billing & Payments',
  'Account & Security',
  'Feature Request',
  'Product Defect / Bug',
  'General Inquiry',
];

export const ALLOWED_URGENCIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Call Gemini model with automatic fallback to ensure resilience across API model versions
 */
async function callGeminiModel(prompt, options = {}) {
  const genAI = getGeminiClient();
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: options.generationConfig || {},
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      // If 404/not found, continue to fallback model
      if (err.status === 404 || (err.message && err.message.includes('not found'))) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to generate content with Gemini API');
}

/**
 * Analyze a support request:
 * 1. Categorize request
 * 2. Detect urgency (Low, Medium, High, Critical)
 * 3. Generate concise AI summary
 * 4. Generate professional, empathetic customer support reply
 */
export async function analyzeAndDraftReply({ customer_name, customer_email, subject, complaint }) {
  const prompt = `You are an elite, highly responsive Customer Support AI specialist for an enterprise platform.
A customer has submitted the following support request:

Customer Name: ${customer_name}
Customer Email: ${customer_email}
Subject: ${subject}
Complaint / Issue:
${complaint}

Analyze this customer request and output a STRICT, VALID JSON object with exactly these 4 keys:
1. "category": Must be one of: "Technical Support", "Billing & Payments", "Account & Security", "Feature Request", "Product Defect / Bug", "General Inquiry".
2. "urgency": Must be one of: "Low", "Medium", "High", "Critical".
   - Critical: Complete service outage, data loss, security compromise, or critical payment blocking operations.
   - High: Major feature broken, financial dispute, unable to access account.
   - Medium: Degraded performance, confusing behavior, non-critical issue with workaround.
   - Low: General question, minor UI bug, general feature feedback.
3. "ai_summary": A concise, factual 1-2 sentence executive summary of the customer's problem.
4. "ai_reply": A genuinely helpful, empathetic, polished customer support response addressed directly to ${customer_name}.
   - Address them politely by name (e.g. "Dear ${customer_name}," or "Hi ${customer_name},").
   - Acknowledge their issue with genuine empathy and professionalism.
   - Provide concrete initial troubleshooting steps, reassurance, or clear expectations on the resolution timeline.
   - Keep the tone courteous, authoritative, and helpful.
   - End with a professional sign-off (e.g. "Best regards,\\nSupport Engineering Team").

CRITICAL: Return ONLY valid, raw JSON. Do not include markdown code block syntax like \`\`\`json or \`\`\`. Output raw JSON directly.`;

  const rawResponse = await callGeminiModel(prompt, {
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  try {
    const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate category and urgency fallbacks
    const category = ALLOWED_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'General Inquiry';

    const urgency = ALLOWED_URGENCIES.includes(parsed.urgency)
      ? parsed.urgency
      : 'Medium';

    return {
      category,
      urgency,
      ai_summary: parsed.ai_summary || `Customer inquiry regarding: ${subject}`,
      ai_reply: parsed.ai_reply || 'Thank you for reaching out to our support team. We are currently investigating your inquiry.',
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', rawResponse, err);
    throw new Error('Gemini API returned an unparseable response structure: ' + err.message);
  }
}

/**
 * Regenerate an AI reply for an existing ticket
 */
export async function regenerateReply({ customer_name, subject, complaint, category, urgency }) {
  const prompt = `You are an elite Customer Support AI specialist.
A support request was previously submitted with the following details:

Customer Name: ${customer_name}
Subject: ${subject}
Category: ${category}
Urgency Level: ${urgency}
Customer Complaint:
${complaint}

Please regenerate a fresh, alternative, high-quality, empathetic, and solution-focused customer support response to ${customer_name}.
- Make it polite, clear, and proactive.
- Address ${customer_name} by name.
- Provide clear next steps or resolution details.
- Sign off professionally from the Support Team.

Provide ONLY the text of the reply, without JSON wrapping or markdown code blocks.`;

  const replyText = await callGeminiModel(prompt, {
    generationConfig: {
      temperature: 0.7,
    },
  });

  return replyText.trim();
}
