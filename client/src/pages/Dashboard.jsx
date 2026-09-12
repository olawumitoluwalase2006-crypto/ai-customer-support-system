import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import MetricsOverview from '../components/MetricsOverview';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  Search,
  Filter,
  RotateCcw,
  Inbox,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  Calendar,
} from 'lucide-react';

export default function Dashboard({ onSelectTicket, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRequests({
        status: statusFilter,
        urgency: urgencyFilter,
        category: categoryFilter,
        search: searchQuery,
      });
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load support requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, urgencyFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    urgencyFilter && setUrgencyFilter('');
    categoryFilter && setCategoryFilter('');
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Support Request Command Center</h1>
          <p className="page-description">
            Monitor real-time customer tickets, AI triage classifications, urgency alerts, and resolution statuses.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new')}
          className="btn btn-primary"
          style={{ display: 'inline-flex' }}
        >
          <PlusCircle size={17} />
          <span>New Support Request</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview requests={requests} />

      {/* Filters and Search Toolbar */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search tickets by customer, subject, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="AI Responded">AI Responded</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Urgencies</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Billing & Payments">Billing & Payments</option>
          <option value="Account & Security">Account & Security</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Product Defect / Bug">Product Defect / Bug</option>
          <option value="General Inquiry">General Inquiry</option>
        </select>

        <button type="button" onClick={handleResetFilters} className="btn-reset" title="Reset all filters">
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Unable to load support requests:</strong> {error}
            <div style={{ marginTop: '6px', fontSize: '0.85rem' }}>
              Ensure Supabase is configured with the credentials provided in your <code>.env</code> file.
            </div>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="card empty-state">
          <div className="spinner spinner-dark" style={{ margin: '0 auto 16px' }} />
          <p>Loading support requests from Supabase...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card empty-state">
          <Inbox className="empty-state-icon" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Support Requests Found
          </h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {statusFilter || urgencyFilter || categoryFilter || searchQuery
              ? 'No tickets match your active filter criteria. Try resetting your search filters.'
              : 'There are currently no tickets in the database. Submit the first support request to see Gemini AI in action!'}
          </p>
          <button onClick={() => onNavigate('new')} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create Support Request</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Subject & Summary</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <a
                        href={`#ticket-${ticket.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectTicket(ticket.id);
                        }}
                        className="subject-link"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </a>
                      {ticket.ai_summary && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginTop: '3px',
                            maxWidth: '340px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ticket.ai_summary}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{ticket.customer_name}</span>
                        <span className="customer-email">{ticket.customer_email}</span>
                      </div>
                    </td>

                    <td>
                      <CategoryBadge category={ticket.category} />
                    </td>

                    <td>
                      <UrgencyBadge urgency={ticket.urgency} />
                    </td>

                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(ticket.created_at)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectTicket(ticket.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card List */}
          <div className="mobile-ticket-list">
            {requests.map((ticket) => (
              <div
                key={ticket.id}
                className="mobile-ticket-card"
                onClick={() => onSelectTicket(ticket.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {ticket.subject}
                  </h4>
                  <StatusBadge status={ticket.status} />
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  From: <strong>{ticket.customer_name}</strong> ({ticket.customer_email})
                </p>

                {ticket.ai_summary && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{ticket.ai_summary}"
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <UrgencyBadge urgency={ticket.urgency} />
                    <CategoryBadge category={ticket.category} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
