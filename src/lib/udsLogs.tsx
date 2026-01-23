import { useEffect, useState } from 'react';
import { udsGetLogs } from './uds';

export function UdsLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const entries = await udsGetLogs();
      setLogs(entries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000); // refresh ogni 3 secondi
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-3">UDS Server logs</h2>
      <p className="text-sm text-slate-400 mb-2">
        Live CAN &amp; UDS trace from the backend.
      </p>

      <div className="bg-black/60 border border-slate-800 rounded-xl p-3 font-mono text-xs h-64 overflow-y-auto">
        {loading && logs.length === 0 && (
          <div className="text-slate-500">Loading logs…</div>
        )}

        {logs.map((line, idx) => (
          <div key={idx} className="text-emerald-300/90">
            {line}
          </div>
        ))}

        {logs.length === 0 && !loading && (
          <div className="text-slate-500">No logs yet. Trigger a request from the demo above.</div>
        )}
      </div>
    </section>
  );
}