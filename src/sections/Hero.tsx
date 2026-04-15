const capabilityCards = [
  {
    title: 'Embedded Linux',
    description: 'Services, tooling and runtime decisions that stay close to the system.',
  },
  {
    title: 'UDS / CAN / DoIP',
    description: 'Protocol-aware diagnostics shaped into safe, legible developer workflows.',
  },
  {
    title: 'Full-stack delivery',
    description: 'Interfaces that feel polished without hiding the engineering underneath.',
  },
]

const workingPrinciples = [
  {
    title: 'Start from the constraints',
    description: 'Protocol, reliability and performance shape the design before the UI does.',
  },
  {
    title: 'Keep complex things legible',
    description: 'Even technical tooling should feel calm, explain itself and stay easy to operate.',
  },
  {
    title: 'Ship the whole experience',
    description: 'I like owning the path from backend behavior to the interface people actually touch.',
  },
]

const signalCards = [
  { label: 'Primary stack', value: 'React + TS + Sanity' },
  { label: 'Protocol focus', value: 'UDS / CAN / DoIP' },
  { label: 'Delivery style', value: 'Reliable and clear' },
]

export function HeroSection() {
  return (
    <section
      id="hero"
      className="section-shell px-5 py-12 md:px-8 md:py-14 lg:px-10 lg:py-16"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.08),transparent_24%)]" />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.04fr)_minmax(21rem,0.96fr)] xl:items-start">
        <div className="relative">
          <span className="section-kicker">Software Engineer</span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.34em] text-slate-400 sm:text-sm">
            Embedded Linux · Automotive Diagnostics · Full-stack Web
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.97] text-white sm:text-5xl lg:text-[4.35rem]">
            Systems-first engineering
            <span className="block text-slate-300">with a cleaner product eye.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            I build backend platforms, embedded tooling and automotive diagnostic
            flows, then turn them into interfaces that feel composed instead of
            improvised.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="button-primary">
              Explore projects
            </a>
            <a href="#uds-demo" className="button-secondary">
              See the UDS lab
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card-strong relative rounded-[1.8rem] p-6 md:p-7">
            <div className="relative">
              <p className="subtle-label">How I Work</p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-[2rem]">
                Structured engineering,
                <span className="block text-slate-300">from protocol to product layer.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                The goal is software that feels technically trustworthy and visually
                organized at the same time.
              </p>

              <ol className="mt-7 space-y-3">
                {workingPrinciples.map((item, index) => (
                  <li
                    key={item.title}
                    className="outline-card grid gap-3 px-4 py-4 sm:grid-cols-[2.4rem_minmax(0,1fr)] sm:items-start"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-200">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {signalCards.map((card) => (
                  <div key={card.label} className="outline-card px-4 py-4">
                    <p className="subtle-label">{card.label}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-100">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {capabilityCards.map((card) => (
          <div key={card.title} className="metric-card p-5">
            <p className="subtle-label">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
