import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/50 p-4 pt-12 backdrop-blur-[2px]">
      <div className={`w-full ${width} card animate-[fadeIn_.15s_ease-out]`}>
        <div className="flex items-center justify-between border-b border-paper-200 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-500 hover:bg-paper-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
