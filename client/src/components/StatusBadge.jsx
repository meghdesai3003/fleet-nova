import React from 'react';

// Every status string used across vehicles, drivers, trips, and maintenance
// maps to one semantic color so the meaning stays consistent app-wide.
const STATUS_STYLES = {
  Available: 'bg-signal-teal/10 text-signal-teal',
  Active: 'bg-amber-500/15 text-amber-600',
  'On Trip': 'bg-signal-sky/10 text-signal-sky',
  Dispatched: 'bg-signal-sky/10 text-signal-sky',
  'In Shop': 'bg-amber-500/15 text-amber-600',
  Draft: 'bg-signal-slate/10 text-signal-slate',
  'Off Duty': 'bg-signal-slate/10 text-signal-slate',
  Retired: 'bg-signal-slate/15 text-ink-700',
  Suspended: 'bg-signal-rust/10 text-signal-rust',
  Cancelled: 'bg-signal-rust/10 text-signal-rust',
  Completed: 'bg-signal-teal/10 text-signal-teal',
  Closed: 'bg-signal-slate/10 text-signal-slate',
};

const DOT_STYLES = {
  Available: 'bg-signal-teal',
  Active: 'bg-amber-500',
  'On Trip': 'bg-signal-sky',
  Dispatched: 'bg-signal-sky',
  'In Shop': 'bg-amber-500',
  Draft: 'bg-signal-slate',
  'Off Duty': 'bg-signal-slate',
  Retired: 'bg-ink-700',
  Suspended: 'bg-signal-rust',
  Cancelled: 'bg-signal-rust',
  Completed: 'bg-signal-teal',
  Closed: 'bg-signal-slate',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-signal-slate/10 text-signal-slate';
  const dot = DOT_STYLES[status] || 'bg-signal-slate';
  return (
    <span className={`badge ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
