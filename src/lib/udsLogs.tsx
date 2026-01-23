import { useEffect, useRef, useState } from 'react';
import { udsGetLogs } from './uds';

export function UdsLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await udsGetLogs();
      setLogs(entries);
    } catch (e) {
      console.error('Error loading UDS logs:', e);
      setError('Failed to load logs from UDS backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000); // refresh ogni 3 secondi
    return () => clearInterval(id);
  }, []);

  // auto-scroll in fondo quando arrivano nuovi log
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-3">UDS Server logs</h2>
      <p className="text-sm text-slate-400 mb-2">
        Live CAN &amp; UDS trace from your sandbox session.
      </p>

      <div
        ref={containerRef}
        className="bg-black/60 border border-slate-800 rounded-xl p-3 font-mono text-xs h-64 overflow-y-auto"
      >
        {loading && logs.length === 0 && !error && (
          <div className="text-slate-500">Loading logs…</div>
        )}

        {error && (
          <div className="text-red-400 mb-2">
            {error}
          </div>
        )}

        {logs.length === 0 && !loading && !error && (
          <div className="text-slate-500">
            No logs yet. Trigger a UDS request from the demo above.
          </div>
        )}

        {logs.map((line, idx) => (
          <div
            key={idx}
            className="text-emerald-300/90 whitespace-pre-wrap"
          >
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}