import { HeroSection } from './sections/Hero'
import { ProjectsSection } from './sections/Projects'
import { TimelineSection } from './sections/Timeline'
import { UdsDemoSection } from './sections/UdsDemo'

const navItems = [
  { href: '#projects', label: 'Projects' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#uds-demo', label: 'Lab' },
]

function App() {
  return (
    <div className="site-shell min-h-screen text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-glow-slow absolute left-[-7rem] top-20 h-64 w-64 rounded-full bg-emerald-400/[0.12] blur-3xl" />
        <div className="animate-float-slow absolute right-[-7rem] top-24 h-[20rem] w-[20rem] rounded-full bg-sky-400/[0.1] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <header className="relative z-40 py-5">
          <div className="glass-card mx-auto flex items-center justify-between gap-3 rounded-[1.6rem] px-4 py-3 shadow-[0_16px_60px_rgba(2,6,23,0.28)] sm:px-5 md:rounded-full">
            <a href="#hero" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.15] bg-white/10 text-sm font-semibold text-white">
                DB
              </span>
              <span className="hidden sm:block">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-slate-200">
                  Dario
                </span>
                <span className="block text-xs text-slate-400">
                  systems + full-stack engineer
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a href="mailto:tuamail@qualcosa.dev" className="button-secondary text-sm">
              Let&apos;s build
            </a>
          </div>
        </header>

        <main className="space-y-6 md:space-y-8">
          <HeroSection />
          <ProjectsSection />
          <TimelineSection />
          <UdsDemoSection />
        </main>

        <footer className="mt-10">
          <div className="glass-card flex flex-col gap-6 rounded-[1.8rem] px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
            <div className="max-w-xl">
              <p className="text-lg font-medium text-white">
                Backend platforms, protocol-heavy tooling and product-minded interfaces,
                arranged with the same care as the systems behind them.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                © {new Date().getFullYear()} Dario Bonfiglio. Built with React, Vite,
                Tailwind and Sanity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <a href="#projects" className="button-secondary">
                Selected work
              </a>
              <a href="#uds-demo" className="button-secondary">
                UDS lab
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
