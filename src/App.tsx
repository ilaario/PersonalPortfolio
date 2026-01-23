import { HeroSection } from './sections/Hero'
import { ProjectsSection } from './sections/Projects'
import { TimelineSection } from './sections/Timeline'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="flex items-center justify-between py-6 md:py-8">
          <a
            href="#hero"
            className="text-sm font-semibold tracking-[0.25em] uppercase text-slate-300"
          >
            DARIO
          </a>
          <nav className="flex gap-6 text-sm text-slate-400">
            <a href="#projects" className="hover:text-emerald-400 transition">
              Projects
            </a>
            <a href="#timeline" className="hover:text-emerald-400 transition">
              Timeline
            </a>
          </nav>
        </header>

        <main>
          <HeroSection />
          <ProjectsSection />
          <TimelineSection />
        </main>

        <footer className="py-10 text-xs text-slate-600">
          <p>
            © {new Date().getFullYear()} Dario Bonfiglio. Built with React, Vite,
            Tailwind &amp; Sanity.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App