/**
 * API client for interacting with the backend Express server
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = json?.error?.message || json?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  /**
   * Check backend health and environment readiness
   */
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  /**
   * Fetch support requests list with optional filters
   */
  async getRequests({ status, urgency, category, search } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (urgency) params.append('urgency', urgency);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/requests${queryString}`);
    return handleResponse(res);
  },

  /**
   * Fetch a single support ticket by UUID
   */
  async getRequestById(id) {
    const res = await fetch(`${BASE_URL}/requests/${id}`);
    return handleResponse(res);
  },

  /**
   * Submit a new support request (Triggers Gemini AI triage + Supabase insert)
   */
  async createRequest({ customer_name, customer_email, subject, complaint }) {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name,
        customer_email,
        subject,
        complaint,
      }),
    });
    return handleResponse(res);
  },

  /**
   * Update the status of a ticket ('Pending', 'AI Responded', 'Resolved')
   */
  async updateStatus(id, status) {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  /**
   * Regenerate the AI customer support reply using Gemini
   */
  async regenerateReply(id) {
    const res = await fetch(`${BASE_URL}/requests/${id}/regenerate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
