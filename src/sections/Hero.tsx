export function HeroSection() {
    return (
      <section
        id="hero"
        className="relative py-16 md:py-24"
      >
        {/* Glow di sfondo */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="mx-auto h-64 w-64 md:h-80 md:w-80 rounded-full bg-emerald-500/20 blur-3xl opacity-40 translate-x-10 translate-y-10 md:translate-x-40" />
        </div>
  
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-emerald-400">
              Software Engineer
            </p>
  
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              Dario&nbsp;Bonfiglio
            </h1>
  
            <p className="mt-4 text-slate-300 text-base md:text-lg">
              Backend &amp; systems engineer working with embedded Linux, automotive
              diagnostics (UDS/CAN/DoIP) and full-stack web development.
            </p>
  
            <p className="mt-3 text-sm text-slate-400 max-w-md">
              I like building things that sit close to the system and don&apos;t fall
              apart under load: from UDS servers on ARM boards to full-stack tools
              like RumantschVivo.
            </p>
  
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
              >
                View projects
              </a>
              <a
                href="mailto:tuamail@qualcosa.dev"
                className="inline-flex items-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                Get in touch
              </a>
            </div>
          </div>
  
          <div className="mt-12 md:mt-0 flex flex-col gap-3 md:items-end">
                <span className="px-4 py-2 text-xs rounded-full border border-emerald-400/20 text-emerald-300 bg-emerald-400/5">
                    Embedded Linux
                </span>
                <span className="px-4 py-2 text-xs rounded-full border border-emerald-400/20 text-emerald-300 bg-emerald-400/5">
                    Automotive (UDS/CAN/DoIP)
                </span>
                <span className="px-4 py-2 text-xs rounded-full border border-emerald-400/20 text-emerald-300 bg-emerald-400/5">
                    Full-stack Development
                </span>
            </div>
        </div>
      </section>
    )
  }