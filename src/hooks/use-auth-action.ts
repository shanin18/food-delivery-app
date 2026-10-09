import { useRef, useState } from 'react';

export function useAuthAction() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>, actionName = 'submit') => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setActiveAction(actionName);
    setError(null);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'); }
    finally { pending.current = false; setBusy(false); setActiveAction(null); }
  };
  return { busy, activeAction, error, run };
}
