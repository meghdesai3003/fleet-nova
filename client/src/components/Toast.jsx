import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function useToast() {
  const [toast, setToastState] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastState({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToastState(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, showToast };
}

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className="fixed bottom-5 right-5 z-[60] animate-[fadeIn_.15s_ease-out]">
      <div
        className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-panel ${
          isError
            ? 'border-signal-rust/20 bg-white text-signal-rust'
            : 'border-signal-teal/20 bg-white text-signal-teal'
        }`}
      >
        {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        <span className="text-ink-900">{toast.message}</span>
      </div>
    </div>
  );
}
