import React from 'react';
import { Clock, Bot, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status }) {
  if (status === 'Resolved') {
    return (
      <span className="badge badge-status-resolved">
        <CheckCircle2 size={13} />
        Resolved
      </span>
    );
  }

  if (status === 'AI Responded') {
    return (
      <span className="badge badge-status-ai">
        <Bot size={13} />
        AI Responded
      </span>
    );
  }

  return (
    <span className="badge badge-status-pending">
      <Clock size={13} />
      Pending
    </span>
  );
}
