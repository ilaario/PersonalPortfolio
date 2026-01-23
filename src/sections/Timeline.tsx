import { useEffect, useState } from 'react'
import { sanityClient } from '../lib/sanityClient'
import { timelineQuery } from '../lib/queries'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'

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
  description?: any[]   // Portable Text blocks
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-1 text-sm text-slate-400 leading-relaxed">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-1 ml-4 list-disc text-sm text-slate-400">
        {children}
      </ul>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-slate-200">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-200">
        {children}
      </em>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="text-emerald-400 hover:underline"
      >
        {children}
      </a>
    ),
  },
}

function formatMonthRange(start?: string, end?: string, isCurrent?: boolean) {
  if (!start) return ''

  const [startYear, startMonth] = start.split('-')

  let endLabel = ''

  if (isCurrent) {
    endLabel = 'Present'
  } else if (end) {
    const [endYear, endMonth] = end.split('-')
    endLabel = `${endMonth}/${endYear}`
  }

  const startLabel = `${startMonth}/${startYear}`
  return endLabel ? `${startLabel} – ${endLabel}` : startLabel
}

function kindLabel(kind?: string) {
  switch (kind) {
    case 'work':
      return 'Work'
    case 'education':
      return 'Education'
    case 'award':
      return 'Award'
    default:
      return undefined
  }
}

export function TimelineSection() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sanityClient
      .fetch<TimelineItem[]>(timelineQuery)
      .then((data) => setItems(data))
      .catch((err) => console.error('Timeline fetch error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="timeline" className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Timeline
        </h2>
        <p className="text-sm text-slate-400">Loading timeline…</p>
      </section>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section id="timeline" className="py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-semibold mb-10">
        Timeline
      </h2>

      <div className="relative">
        {/* linea verticale */}
        <div className="absolute left-3 md:left-4 top-0 bottom-0 w-px bg-slate-800" />

        <ol className="space-y-8 md:space-y-10">
          {items.map((item) => {
            const dateLabel = formatMonthRange(
              item.startMonth,
              item.endMonth,
              item.isCurrent
            )
            const typeLabel = kindLabel(item.kind)

            return (
              <li key={item._id} className="relative pl-10 md:pl-12">
                {/* pallino */}
                <div className="absolute left-1.5 md:left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-emerald-400 bg-slate-950" />

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-lg md:text-xl font-semibold">
                      {item.title}
                    </h3>
                    {item.organisation && (
                      <span className="text-sm text-slate-400">
                        · {item.organisation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs md:text-sm text-slate-400">
                    {dateLabel && <span>{dateLabel}</span>}
                    {item.location && <span>· {item.location}</span>}
                    {typeLabel && (
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[0.7rem] uppercase tracking-wide">
                        {typeLabel}
                      </span>
                    )}
                  </div>

                  {item.subtitle && (
                    <p className="text-sm text-slate-300 mt-1">
                      {item.subtitle}
                    </p>
                  )}

                  {item.description && item.description.length > 0 && (
                    <div className="mt-2 text-sm text-slate-400 max-w-2xl">
                      <PortableText
                        value={item.description}
                        components={portableTextComponents}
                      />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}