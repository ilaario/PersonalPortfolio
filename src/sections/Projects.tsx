import { useEffect, useState } from 'react'
import { sanityClient } from '../lib/sanityClient'
import { projectsQuery } from '../lib/queries'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'

type Project = {
  _id: string
  title: string
  subtitle?: string
  description?: any[]   // Portable Text blocks
  tech?: string[]
  url?: string
  repo?: string
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-2 text-slate-300 text-sm leading-relaxed">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-2 ml-4 list-disc text-slate-300 text-sm">
        {children}
      </ul>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-slate-100">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-200">{children}</em>
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

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sanityClient
      .fetch<Project[]>(projectsQuery)
      .then((data) => setProjects(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-4">Projects</h2>
        <p className="text-sm text-slate-400">Loading from Sanity…</p>
      </section>
    )
  }

  console.log(projects)

  return (
    <section id="projects" className="py-16">
      <h2 className="text-3xl font-bold mb-8">Projects</h2>

      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project._id}
            className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
          >
            <h3 className="text-xl font-semibold">{project.title}</h3>

            {project.subtitle && (
              <p className="text-slate-400 text-sm mt-1">
                {project.subtitle}
              </p>
            )}

            {project.description && project.description.length > 0 && (
              <div className="mt-4 text-sm text-slate-300">
                <PortableText
                  value={project.description}
                  components={portableTextComponents}
                />
              </div>
            )}

            {project.tech && project.tech.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 text-xs rounded-md border border-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-4 text-sm">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Live →
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:underline"
                >
                  Code →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}