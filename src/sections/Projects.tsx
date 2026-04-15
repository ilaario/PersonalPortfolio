import { useEffect, useState } from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlockLike } from '../lib/portableText'
import { hasSanityConfig, sanityClient } from '../lib/sanityClient'
import { projectsQuery } from '../lib/queries'

type ProjectDescription = string | PortableTextBlockLike[]

type Project = {
  _id: string
  title: string
  subtitle?: string
  description?: ProjectDescription
  tech?: string[]
  url?: string
  repo?: string
}

const projectAccents = [
  'from-emerald-400/70 to-sky-400/40',
  'from-sky-400/70 to-indigo-400/40',
  'from-amber-300/70 to-orange-300/40',
]

const fallbackProjects: Project[] = [
  {
    _id: 'fallback-rumantschvivo',
    title: 'RumantschVivo',
    subtitle: 'Language-learning product with backend logic and a cleaner user journey.',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'A full-stack experience designed to make structured learning feel simple and alive.',
          },
        ],
      },
    ],
    tech: ['React', 'TypeScript', 'Sanity', 'UX systems'],
    url: '#',
  },
  {
    _id: 'fallback-uds-lab',
    title: 'UDS Diagnostic Lab',
    subtitle: 'Safe web-facing interface for protocol-heavy automotive diagnostics.',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Built to translate UDS, CAN and DoIP concepts into an interface that is readable even for non-specialists.',
          },
        ],
      },
    ],
    tech: ['Embedded Linux', 'UDS', 'CAN', 'DoIP', 'Frontend'],
  },
  {
    _id: 'fallback-systems',
    title: 'Systems Tooling',
    subtitle: 'Internal services and runtime-focused tooling built close to the metal.',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Projects where reliability, observability and protocol correctness matter more than hype.',
          },
        ],
      },
    ],
    tech: ['Linux', 'Backend', 'Diagnostics', 'Performance'],
  },
]

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-3 text-sm leading-7 text-slate-300">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-3 ml-5 list-disc space-y-2 text-sm text-slate-300">
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

function hasProjectDescription(
  description: ProjectDescription | undefined,
): description is ProjectDescription {
  if (!description) {
    return false
  }

  if (typeof description === 'string') {
    return description.trim().length > 0
  }

  return description.length > 0
}

function ProjectDescriptionContent({
  description,
}: {
  description: ProjectDescription
}) {
  if (typeof description === 'string') {
    return (
      <div className="space-y-3">
        {description
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-slate-300">
              {paragraph}
            </p>
          ))}
      </div>
    )
  }

  return (
    <PortableText
      value={description}
      components={portableTextComponents}
    />
  )
}

function ProjectsLoadingState() {
  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={[
            'glass-card animate-pulse rounded-[1.75rem] p-6 md:p-7',
            index === 0 ? 'xl:col-span-2' : '',
          ].join(' ')}
        >
          <div className="h-4 w-20 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-2/3 rounded-full bg-white/10" />
          <div className="mt-4 space-y-3">
            <div className="h-3 rounded-full bg-white/10" />
            <div className="h-3 rounded-full bg-white/10" />
            <div className="h-3 w-4/5 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(hasSanityConfig ? [] : fallbackProjects)
  const [loading, setLoading] = useState(hasSanityConfig)
  const [error, setError] = useState<string | null>(null)
  const configNotice = hasSanityConfig
    ? null
    : 'Sanity is not configured yet, so showing local placeholder projects.'

  useEffect(() => {
    if (!hasSanityConfig || !sanityClient) {
      return
    }

    let cancelled = false

    sanityClient
      .fetch<Project[]>(projectsQuery)
      .then((data) => {
        if (!cancelled) {
          setProjects(data)
        }
      })
      .catch((err) => {
        console.error('Projects fetch error:', err)
        if (!cancelled) {
          setError('Project data is temporarily unavailable.')
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
      id="projects"
      className="section-shell px-5 py-10 md:px-8 md:py-12 lg:px-10"
    >
      <div className="section-intro">
        <div>
          <span className="section-kicker">Selected Work</span>
          <h2 className="section-title mt-5">
            Projects that mix product taste with low-level rigor.
          </h2>
        </div>

        <p className="section-copy">
          A few builds where backend architecture, system constraints and interface
          quality all mattered at the same time.
        </p>
      </div>

      {(configNotice || error) && (
        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {configNotice ?? error}
        </div>
      )}

      {loading && <ProjectsLoadingState />}

      {!loading && projects.length === 0 && (
        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-8 text-sm text-slate-300">
          Projects will appear here as soon as they are published from Sanity.
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {projects.map((project, index) => (
            <article
              key={project._id}
              className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/72 p-6 transition duration-300 hover:border-white/18 hover:bg-slate-950/80 md:p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
              <div
                className={[
                  'pointer-events-none absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r opacity-80',
                  projectAccents[index % projectAccents.length],
                ].join(' ')}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                        {project.subtitle}
                      </p>
                    )}
                  </div>

                  <span className="hidden text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 sm:inline">
                    Project
                  </span>
                </div>

                {hasProjectDescription(project.description) && (
                  <div className="mt-6 max-w-2xl">
                    <ProjectDescriptionContent description={project.description} />
                  </div>
                )}

                <div className="mt-6 border-t border-white/8 pt-5">
                  <p className="subtle-label">Stack</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech && project.tech.length > 0 ? (
                      project.tech.map((item) => (
                        <span key={item} className="tag-pill">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="tag-pill text-slate-300">
                        Tailored implementation
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="button-primary"
                    >
                      Live experience
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary"
                    >
                      Source code
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
