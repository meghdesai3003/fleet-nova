import React from 'react';
import { Inbox } from 'lucide-react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent = 'navy', hint }) {
  const accents = {
    navy: 'bg-navy-900 text-white',
    amber: 'bg-amber-500 text-navy-950',
    teal: 'bg-signal-teal text-white',
    sky: 'bg-signal-sky text-white',
  };
  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-ink-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </div>
      {Icon && (
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-paper-100 text-ink-500">
        <Inbox size={20} />
      </div>
      <p className="font-display text-sm font-semibold text-ink-900">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-500">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-paper-200 border-t-navy-900" />
    </div>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-signal-rust/20 bg-signal-rust/5 px-4 py-2.5 text-sm font-medium text-signal-rust">
      {message}
    </div>
  );
}
