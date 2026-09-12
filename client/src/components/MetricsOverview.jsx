import React from 'react';
import { Inbox, Clock, Bot, CheckCircle2, Flame } from 'lucide-react';

export default function MetricsOverview({ requests = [] }) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const aiResponded = requests.filter((r) => r.status === 'AI Responded').length;
  const resolved = requests.filter((r) => r.status === 'Resolved').length;
  const urgentCount = requests.filter(
    (r) => (r.urgency === 'Critical' || r.urgency === 'High') && r.status !== 'Resolved'
  ).length;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Total Tickets</span>
          <span className="metric-value">{total}</span>
        </div>
        <div className="metric-icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
          <Inbox size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Pending</span>
          <span className="metric-value">{pending}</span>
        </div>
        <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
          <Clock size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">AI Responded</span>
          <span className="metric-value">{aiResponded}</span>
        </div>
        <div className="metric-icon-box" style={{ background: '#ede9fe', color: '#6d28d9' }}>
          <Bot size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Resolved</span>
          <span className="metric-value">{resolved}</span>
        </div>
        <div className="metric-icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>
          <CheckCircle2 size={22} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">High / Critical</span>
          <span className="metric-value">{urgentCount}</span>
        </div>
        <div className="metric-icon-box" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          <Flame size={22} />
        </div>
      </div>
    </div>
  );
}
