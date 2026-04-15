import { useEffect, useRef, useState } from 'react'
import { udsGetLogs } from './uds'

export function UdsLogs() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const entries = await udsGetLogs()
      setLogs(entries)
    } catch (loadError) {
      console.error('Error loading UDS logs:', loadError)
      setError('Failed to load logs from the UDS backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const intervalId = setInterval(load, 3000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    element.scrollTop = element.scrollHeight
  }, [logs])

  return (
    <div className="mt-6">
      <div className="glass-card overflow-hidden rounded-[1.8rem]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="subtle-label">Live Server Trace</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              CAN and UDS logs from the sandbox session
            </h3>
          </div>

          <span
            className={[
              'tag-pill',
              loading
                ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
                : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
            ].join(' ')}
          >
            {loading ? 'Refreshing...' : 'Auto-refresh every 3s'}
          </span>
        </div>

        <div
          ref={containerRef}
          className="terminal-scrollbar h-72 overflow-y-auto bg-[#020617]/90 px-5 py-4 font-mono text-xs leading-6 md:px-6"
        >
          {loading && logs.length === 0 && !error && (
            <div className="text-slate-500">Loading logs...</div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {logs.length === 0 && !loading && !error && (
            <div className="text-slate-500">
              No logs yet. Trigger a UDS request from the demo above.
            </div>
          )}

          {logs.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className="border-b border-white/5 py-1 text-emerald-200/90 last:border-b-0"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
