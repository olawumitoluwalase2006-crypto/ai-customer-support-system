import React from 'react';
import { AlertCircle, Flame, ShieldAlert, Info } from 'lucide-react';

export default function UrgencyBadge({ urgency }) {
  const level = urgency || 'Medium';

  if (level === 'Critical') {
    return (
      <span className="badge badge-urgency-critical">
        <Flame size={13} />
        Critical
      </span>
    );
  }

  if (level === 'High') {
    return (
      <span className="badge badge-urgency-high">
        <ShieldAlert size={13} />
        High
      </span>
    );
  }

  if (level === 'Medium') {
    return (
      <span className="badge badge-urgency-medium">
        <AlertCircle size={13} />
        Medium
      </span>
    );
  }

  return (
    <span className="badge badge-urgency-low">
      <Info size={13} />
      Low
    </span>
  );
}
