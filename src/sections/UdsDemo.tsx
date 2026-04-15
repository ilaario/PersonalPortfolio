import { useState, type FormEvent } from 'react'
import { UdsLogs } from '../lib/udsLogs'
import { udsGet, udsPost } from '../lib/uds'

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

const sessionTypes = [
  { value: 'default', label: 'Default session (0x01)' },
  { value: 'extended', label: 'Extended session (0x03)' },
]

const safeDids = [
  { value: 'F190', label: 'F190 - VIN (simulated)' },
  { value: 'F187', label: 'F187 - Software version' },
  { value: 'F123', label: 'F123 - ECU name' },
]

const serviceOptions: Array<{
  value: UdsService
  title: string
  code: string
  description: string
}> = [
  {
    value: 'session',
    title: 'Diagnostic Session Control',
    code: '0x10',
    description: 'Move into a safe diagnostic session before deeper requests.',
  },
  {
    value: 'readDid',
    title: 'Read Data By Identifier',
    code: '0x22',
    description: 'Request whitelisted DIDs and inspect the returned payload.',
  },
  {
    value: 'readDtc',
    title: 'Read DTC Information',
    code: '0x19',
    description: 'Use a safe read-only subfunction to inspect stored faults.',
  },
]

const guardrails = ['Read-only subset', 'Max 50 req/min per IP', 'No flashing or security access']

export function UdsDemoSection() {
  const [service, setService] = useState<UdsService>('session')
  const [sessionType, setSessionType] = useState<string>('extended')
  const [selectedDids, setSelectedDids] = useState<string[]>(['F190'])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<UdsResponseState | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const activeService =
    serviceOptions.find((option) => option.value === service) ?? serviceOptions[0]

  function toggleDid(did: string) {
    setSelectedDids((prev) =>
      prev.includes(did) ? prev.filter((item) => item !== did) : [...prev, did],
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (service === 'readDid' && selectedDids.length === 0) {
      setError('Select at least one DID before sending the request.')
      return
    }

    setIsLoading(true)

    const requestState = buildRequestState()

    try {
      const result = await sendToBackend(requestState)
      setResponse(result)

      const historyItem: HistoryItem = {
        id: result.traceId,
        request: requestState,
        response: result,
        timestamp: new Date().toISOString(),
      }

      setHistory((prev) => [historyItem, ...prev].slice(0, 10))
    } catch (requestError) {
      console.error(requestError)
      setError('Something went wrong while talking to the UDS backend.')
    } finally {
      setIsLoading(false)
    }
  }

  function renderServiceFields() {
    if (service === 'session') {
      return (
        <div className="space-y-4">
          <div>
            <p className="subtle-label">Diagnostic Session</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Choose the target session for service <code>0x10</code>.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-200">
            Session type
          </label>
          <select
            className="panel-input"
            value={sessionType}
            onChange={(event) => setSessionType(event.target.value)}
          >
            {sessionTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (service === 'readDid') {
      return (
        <div className="space-y-4">
          <div>
            <p className="subtle-label">Read Data Identifiers</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Pick one or more safe DIDs for service <code>0x22</code>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {safeDids.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleDid(item.value)}
                className={[
                  'rounded-full border px-4 py-2 text-xs font-semibold md:text-sm',
                  selectedDids.includes(item.value)
                    ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div>
          <p className="subtle-label">Read DTC Information</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Service <code>0x19</code> is configured to use a safe read-only
            subfunction and return parsed fault information.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
          No additional parameters are required for this request.
        </div>
      </div>
    )
  }

  return (
    <section
      id="uds-demo"
      className="section-shell px-5 py-10 md:px-8 md:py-12 lg:px-10"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="section-intro">
        <div>
          <span className="section-kicker">Interactive Lab</span>
          <h2 className="section-title mt-5">
            A diagnostic demo that feels like a product, not a raw test bench.
          </h2>
        </div>

        <div>
          <p className="section-copy">
            Safe, read-only web interface for an ISO 14229 diagnostic stack over
            DoIP. The goal is to expose real protocol thinking through a UI that
            stays calm, clear and demo-ready.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guardrails.map((item) => (
              <span key={item} className="tag-pill">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="glass-card-strong rounded-[1.8rem] p-5 md:p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="subtle-label">Service Picker</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {activeService.title}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                    {activeService.description}
                  </p>
                </div>
                <span className="tag-pill">{activeService.code}</span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {serviceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setService(option.value)}
                    className={[
                      'rounded-[1.2rem] border px-4 py-3 text-left',
                      service === option.value
                        ? 'border-emerald-300/40 bg-emerald-400/10 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.15)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {option.code}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{option.title}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 md:p-5">
              {renderServiceFields()}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="subtle-label">Execution Mode</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Send one sandbox-safe request and inspect both the raw PDU and
                  parsed payload.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || (service === 'readDid' && selectedDids.length === 0)}
                className="button-primary min-w-[15rem]"
              >
                {isLoading ? 'Sending request...' : 'Send diagnostic request'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[1.8rem] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="subtle-label">Response Console</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Inspect raw traffic and decoded output.
                </h3>
              </div>

              {response && (
                <span
                  className={[
                    'tag-pill',
                    response.positive
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                      : 'border-rose-400/20 bg-rose-400/10 text-rose-100',
                  ].join(' ')}
                >
                  {response.positive ? 'Positive response' : 'Negative response'}
                </span>
              )}
            </div>

            {!response ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-sm leading-7 text-slate-400">
                No requests sent yet. Configure a service and fire a sandbox-safe
                diagnostic request to see the traffic here.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                  <span className="tag-pill">Service: {response.udsService}</span>
                  <span className="tag-pill text-slate-300">
                    Trace: {response.traceId}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="subtle-label">Request PDU</p>
                  <pre className="overflow-x-auto rounded-[1.3rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-emerald-200">
                    {response.requestPdu}
                  </pre>
                </div>

                <div className="space-y-2">
                  <p className="subtle-label">Response PDU</p>
                  <pre className="overflow-x-auto rounded-[1.3rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-slate-100">
                    {response.responsePdu}
                  </pre>
                </div>

                {response.parsed && (
                  <div className="space-y-2">
                    <p className="subtle-label">Parsed Payload</p>
                    <pre className="overflow-x-auto rounded-[1.3rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-slate-100">
                      {JSON.stringify(response.parsed, null, 2)}
                    </pre>
                  </div>
                )}

                {response.error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {response.error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card rounded-[1.8rem] p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="subtle-label">Recent Requests</p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Last {history.length} of 10 requests
                </h3>
              </div>
              <span className="tag-pill">Rolling buffer</span>
            </div>

            {history.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-slate-400">
                No history yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {history.map((item) => (
                  <div
                    key={`${item.id}-${item.timestamp}`}
                    className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.request.service}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Trace {item.response.traceId} · Service {item.response.udsService}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={[
                            'inline-flex rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em]',
                            item.response.positive
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : 'border-rose-400/20 bg-rose-400/10 text-rose-100',
                          ].join(' ')}
                        >
                          {item.response.positive ? 'Positive' : 'Negative'}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UdsLogs />
    </section>
  )
}
