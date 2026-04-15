import { useEffect, useState } from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlockLike } from '../lib/portableText'
import { hasSanityConfig, sanityClient } from '../lib/sanityClient'
import { timelineQuery } from '../lib/queries'

type TimelineItem = {
  _id: string
  title: string
  subtitle?: string
  organisation?: string
  location?: string
  kind?: 'work' | 'education' | 'award' | 'other'
  startMonth?: string
  endMonth?: string
  isCurrent?: boolean
  description?: PortableTextBlockLike[]
}

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
})

const kindLabels: Record<NonNullable<TimelineItem['kind']>, string> = {
  work: 'Work',
  education: 'Education',
  award: 'Award',
  other: 'Other',
}

const kindStyles: Record<NonNullable<TimelineItem['kind']>, string> = {
  work: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  education: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
  award: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  other: 'border-white/10 bg-white/5 text-slate-200',
}

const kindGlows: Record<NonNullable<TimelineItem['kind']>, string> = {
  work: 'from-emerald-400/20 via-emerald-400/[0.08] to-transparent',
  education: 'from-sky-400/[0.18] via-sky-400/[0.08] to-transparent',
  award: 'from-amber-300/20 via-orange-300/[0.08] to-transparent',
  other: 'from-white/10 via-transparent to-transparent',
}

const fallbackTimeline: TimelineItem[] = [
  {
    _id: 'fallback-now',
    title: 'Systems & full-stack engineering',
    subtitle: 'Building protocol-heavy tools and interfaces that stay clear under pressure.',
    organisation: 'Independent / portfolio work',
    location: 'Europe',
    kind: 'work',
    startMonth: '2024-01',
    isCurrent: true,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Focused on embedded Linux, UDS diagnostic workflows and product-minded frontend delivery.',
          },
        ],
      },
    ],
  },
  {
    _id: 'fallback-study',
    title: 'Engineering foundation',
    subtitle: 'Growing through projects that mix systems reasoning with real interface decisions.',
    organisation: 'Technical path',
    location: 'Italy / Europe',
    kind: 'education',
    startMonth: '2021-09',
    endMonth: '2024-12',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Hands-on work across backend services, diagnostics concepts and modern web tooling.',
          },
        ],
      },
    ],
  },
]

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-2 text-sm leading-7 text-slate-300">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-2 ml-5 list-disc space-y-2 text-sm text-slate-300">
        {children}
      </ul>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-slate-100">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-sky-300 hover:text-sky-200"
      >
        {children}
      </a>
    ),
  },
}

function parseMonthValue(value?: string) {
  if (!value) {
    return null
  }

  const [yearString, monthString] = value.split('-')
  const year = Number(yearString)
  const month = Number(monthString)

  if (!year || !month) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, 1))
}

function formatMonthRange(
  startMonth?: string,
  endMonth?: string,
  isCurrent?: boolean,
) {
  const startDate = parseMonthValue(startMonth)

  if (!startDate) {
    return ''
  }

  const startLabel = monthFormatter.format(startDate)

  if (isCurrent) {
    return `${startLabel} - Present`
  }

  const endDate = parseMonthValue(endMonth)

  if (!endDate) {
    return startLabel
  }

  return `${startLabel} - ${monthFormatter.format(endDate)}`
}

function TimelineLoadingState() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="h-5 w-28 rounded-full bg-white/10" />
        <div className="h-12 w-3/4 rounded-3xl bg-white/10" />
        <div className="h-4 w-full rounded-full bg-white/10" />
        <div className="h-4 w-2/3 rounded-full bg-white/10" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card animate-pulse rounded-[1.5rem] p-6">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="mt-4 h-6 w-1/2 rounded-full bg-white/10" />
            <div className="mt-4 h-3 rounded-full bg-white/10" />
            <div className="mt-3 h-3 w-4/5 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimelineSection() {
  const [items, setItems] = useState<TimelineItem[]>(hasSanityConfig ? [] : fallbackTimeline)
  const [loading, setLoading] = useState(hasSanityConfig)
  const [error, setError] = useState<string | null>(null)
  const configNotice = hasSanityConfig
    ? null
    : 'Sanity is not configured yet, so showing a local placeholder timeline.'

  useEffect(() => {
    if (!hasSanityConfig || !sanityClient) {
      return
    }

    let cancelled = false

    sanityClient
      .fetch<TimelineItem[]>(timelineQuery)
      .then((data) => {
        if (!cancelled) {
          setItems(data)
        }
      })
      .catch((err) => {
        console.error('Timeline fetch error:', err)
        if (!cancelled) {
          setError('Timeline data is temporarily unavailable.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="timeline"
      className="section-shell px-5 py-10 md:px-8 md:py-12 lg:px-10"
    >
      {loading ? (
        <TimelineLoadingState />
      ) : (
        <>
          <div className="section-intro">
            <div>
              <span className="section-kicker">Timeline</span>
              <h2 className="section-title mt-5">
                The path behind the systems, products and diagnostics work.
              </h2>
            </div>

            <div>
              <p className="section-copy">
                Experience, education and milestones arranged as a clear sequence
                instead of a split layout that competes with itself.
              </p>

              {(configNotice || error) && (
                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  {configNotice ?? error}
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-10">
            <div className="absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-emerald-400/0 via-slate-500/60 to-sky-400/0 md:left-4" />

            {items.length === 0 ? (
              <div className="glass-card rounded-[1.5rem] px-6 py-8 text-sm text-slate-300">
                Timeline entries will appear here once they are published from Sanity.
              </div>
            ) : (
              <ol className="space-y-5">
                {items.map((item) => {
                  const kind = item.kind ?? 'other'
                  const dateLabel = formatMonthRange(
                    item.startMonth,
                    item.endMonth,
                    item.isCurrent,
                  )

                  return (
                    <li key={item._id} className="relative pl-10 md:pl-12">
                      <span className="absolute left-0 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-slate-950 md:left-1">
                        <span
                          className={[
                            'h-2.5 w-2.5 rounded-full',
                            kind === 'work'
                              ? 'bg-emerald-300'
                              : kind === 'education'
                                ? 'bg-sky-300'
                                : kind === 'award'
                                  ? 'bg-amber-200'
                                  : 'bg-slate-300',
                          ].join(' ')}
                        />
                      </span>

                      <article className="glass-card relative overflow-hidden rounded-[1.55rem] px-5 py-5 md:px-6">
                        <div
                          className={[
                            'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-55',
                            kindGlows[kind],
                          ].join(' ')}
                        />

                        <div className="relative">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={[
                                    'inline-flex rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em]',
                                    kindStyles[kind],
                                  ].join(' ')}
                                >
                                  {kindLabels[kind]}
                                </span>
                                {dateLabel && (
                                  <span className="text-sm text-slate-400">
                                    {dateLabel}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-4 text-2xl font-semibold text-white">
                                {item.title}
                              </h3>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                                {item.organisation && <span>{item.organisation}</span>}
                                {item.location && <span>{item.location}</span>}
                              </div>

                              {item.subtitle && (
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.description && item.description.length > 0 && (
                            <div className="mt-5 max-w-3xl border-t border-white/8 pt-4">
                              <PortableText
                                value={item.description}
                                components={portableTextComponents}
                              />
                            </div>
                          )}
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </>
      )}
    </section>
  )
}
