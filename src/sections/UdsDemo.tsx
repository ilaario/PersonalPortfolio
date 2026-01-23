import { useState } from 'react'
import { udsPost, udsGet } from '../lib/uds'
import { UdsLogs } from '../lib/udsLogs'

type UdsService = 'session' | 'readDid' | 'readDtc'

type UdsRequestState = {
  service: UdsService
  payload: Record<string, unknown>
}

type UdsResponseState = {
  requestPdu: string
  responsePdu: string
  positive: boolean
  udsService: string
  parsed?: Record<string, unknown>
  error?: string
  traceId: string
}

type HistoryItem = {
  id: string
  request: UdsRequestState
  response: UdsResponseState
  timestamp: string
}

const SESSION_TYPES = [
  { value: 'default', label: 'Default session (0x01)' },
  { value: 'extended', label: 'Extended session (0x03)' },
]

const SAFE_DIDS = [
  { value: 'F190', label: 'F190 – VIN (simulated)' },
  { value: 'F187', label: 'F187 – Software version' },
  { value: 'F123', label: 'F123 – ECU name' },
]

export function UdsDemoSection() {
  const [service, setService] = useState<UdsService>('session')
  const [sessionType, setSessionType] = useState<string>('extended')
  const [selectedDids, setSelectedDids] = useState<string[]>(['F190'])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<UdsResponseState | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  function toggleDid(did: string) {
    setSelectedDids((prev) =>
      prev.includes(did) ? prev.filter((d) => d !== did) : [...prev, did],
    )
  }

  function buildRequestState(): UdsRequestState {
    switch (service) {
      case 'session':
        return {
          service,
          payload: { sessionType },
        }
      case 'readDid':
        return {
          service,
          payload: { dids: selectedDids },
        }
      case 'readDtc':
        return {
          service,
          payload: {},
        }
      default:
        return { service, payload: {} }
    }
  }

  async function sendToBackend(req: UdsRequestState): Promise<UdsResponseState> {
    if (req.service === 'session') {
      return udsPost('/api/uds/session', req.payload)
    }
  
    if (req.service === 'readDid') {
      return udsPost('/api/uds/read-did', req.payload)
    }
  
    if (req.service === 'readDtc') {
      return udsGet('/api/uds/dtc')
    }
  
    throw new Error('Unknown service')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const reqState = buildRequestState()

    try {
      // qui in futuro sostituirai mockSendToBackend con la vera fetch verso Oracle
      const res = await sendToBackend(reqState)
      setResponse(res)

      const historyItem: HistoryItem = {
        id: res.traceId,
        request: reqState,
        response: res,
        timestamp: new Date().toISOString(),
      }

      setHistory((prev) => [historyItem, ...prev].slice(0, 10))
    } catch (err) {
      console.error(err)
      setError('Something went wrong while talking to the UDS backend.')
    } finally {
      setIsLoading(false)
    }
  }

  function renderServiceFields() {
    if (service === 'session') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Session type
          </label>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          >
            {SESSION_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            Maps to UDS service <code className="text-[0.7rem]">0x10</code> (Diagnostic Session
            Control).
          </p>
        </div>
      )
    }

    if (service === 'readDid') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Data Identifiers (DID)
          </label>
          <div className="flex flex-wrap gap-2">
            {SAFE_DIDS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDid(d.value)}
                className={[
                  'rounded-full border px-3 py-1 text-xs',
                  selectedDids.includes(d.value)
                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                    : 'border-slate-700 text-slate-200 hover:border-slate-500',
                ].join(' ')}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Uses UDS service <code className="text-[0.7rem]">0x22</code> (ReadDataByIdentifier).
          </p>
        </div>
      )
    }

    // readDtc
    return (
      <div className="space-y-1">
        <p className="text-sm text-slate-200">Read DTC information</p>
        <p className="text-xs text-slate-400">
          Uses UDS service <code className="text-[0.7rem]">0x19</code> with a safe, read-only
          subfunction.
        </p>
      </div>
    )
  }

  return (
    <section id="uds-demo" className="py-16 md:py-24">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold">UDS Diagnostic Demo</h2>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-300">
            Safe, read-only web demo of an ISO 14229 diagnostic stack over DoIP (ISO 13400).
            The frontend talks to a backend on a Linux VM that exposes a whitelisted subset of UDS
            services.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Max 50 requests/min per IP · Read-only subset (no programming, no security access)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Form / controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                UDS service
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setService('session')}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs md:text-sm',
                    service === 'session'
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                      : 'border-slate-700 text-slate-200 hover:border-slate-500',
                  ].join(' ')}
                >
                  Diagnostic Session Control (0x10)
                </button>
                <button
                  type="button"
                  onClick={() => setService('readDid')}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs md:text-sm',
                    service === 'readDid'
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                      : 'border-slate-700 text-slate-200 hover:border-slate-500',
                  ].join(' ')}
                >
                  ReadDataByIdentifier (0x22)
                </button>
                <button
                  type="button"
                  onClick={() => setService('readDtc')}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs md:text-sm',
                    service === 'readDtc'
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                      : 'border-slate-700 text-slate-200 hover:border-slate-500',
                  ].join(' ')}
                >
                  ReadDTCInformation (0x19)
                </button>
              </div>
            </div>

            {renderServiceFields()}

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Sending request…' : 'Send diagnostic request'}
            </button>
          </form>
        </div>

        {/* Response / details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">
            Response
          </h3>

          {!response && (
            <p className="text-sm text-slate-400">
              No requests sent yet. Configure a service and send a diagnostic request to see the
              UDS traffic here.
            </p>
          )}

          {response && (
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex flex-wrap gap-3 text-slate-300">
                <span className="rounded-full border border-slate-700 px-2 py-0.5">
                  Service: {response.udsService}
                </span>
                <span
                  className={[
                    'rounded-full border px-2 py-0.5',
                    response.positive
                      ? 'border-emerald-400 text-emerald-300'
                      : 'border-red-400 text-red-300',
                  ].join(' ')}
                >
                  {response.positive ? 'Positive response' : 'Negative response'}
                </span>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                  Trace: {response.traceId}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">
                  Request PDU
                </p>
                <pre className="rounded-md bg-slate-950/60 px-3 py-2 text-xs text-emerald-300 overflow-x-auto">
                  {response.requestPdu}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">
                  Response PDU
                </p>
                <pre className="rounded-md bg-slate-950/60 px-3 py-2 text-xs text-slate-200 overflow-x-auto">
                  {response.responsePdu}
                </pre>
              </div>

              {response.parsed && (
                <div className="space-y-2">
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">
                    Parsed payload
                  </p>
                  <pre className="rounded-md bg-slate-950/60 px-3 py-2 text-xs text-slate-200 overflow-x-auto">
{JSON.stringify(response.parsed, null, 2)}
                  </pre>
                </div>
              )}

              {response.error && (
                <p className="text-xs text-red-400">
                  {response.error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <UdsLogs />

      {/* History */}
      <div className="mt-8 rounded-xl border border-slate-900 bg-slate-950/40 p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Recent requests
          </h3>
          <p className="text-xs text-slate-500">
            Showing last {history.length} / 10
          </p>
        </div>

        {history.length === 0 && (
          <p className="text-xs text-slate-500">
            No history yet.
          </p>
        )}

        {history.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
            {history.map((h) => (
              <div
                key={h.id + h.timestamp}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">
                    {h.request.service}
                  </span>
                  <span className="text-[0.7rem] text-slate-500">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  Trace: {h.response.traceId} · Service {h.response.udsService}{' '}
                  · {h.response.positive ? 'Positive' : 'Negative'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}