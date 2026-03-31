const techCards = [
  {
    title: "Frontend",
    subtitle: "React, Next.js, Tailwind CSS",
    description: "高效打造互動、品牌感與快速上線的前端體驗。",
    accent: "amber",
  },
  {
    title: "Cross-Platform",
    subtitle: "Flutter (Dart)",
    description: "單一程式碼庫同時交付 iOS / Android / Web。",
    accent: "yellow",
  },
  {
    title: "Mobile",
    subtitle: "Kotlin, Jetpack Compose",
    description: "專注 Android 體驗的原生開發與 UI 工程化。",
    accent: "blue",
  },
  {
    title: "Tools",
    subtitle: "Git, Docker, Figma",
    description: "規劃工作流、設計到部署的最佳實踐工具組。",
    accent: "orange",
  },
];

const quickCards = [
  { title: "Frontend", subtitle: "React, Next.js, Tailwind CSS" },
  { title: "Cross-Platform", subtitle: "Flutter (Dart)" },
  { title: "Mobile", subtitle: "Kotlin, Jetpack Compose" },
  { title: "Tools", subtitle: "Git, Docker, Figma" },
];

const projects = [
  {
    title: "Bolting Facte",
    description: "安全系統的即時監控儀表板，打造高辨識度 UI。",
    tags: ["React", "Flutter"],
  },
  {
    title: "Flutter Samz",
    description: "跨平台佈建與雲端後端整合，強化上線速度。",
    tags: ["Flutter", "Firebase"],
  },
  {
    title: "Neon Pulse",
    description: "3D 感光視覺與動態網格的沉浸式品牌體驗。",
    tags: ["Next.js", "Tailwind"],
  },
  {
    title: "Grid Sense",
    description: "資料可視化與互動元件套件化，提升開發效率。",
    tags: ["React", "Design System"],
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0f14]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,111,255,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,187,92,0.08),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(68,192,255,0.06),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(210deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:200px_200px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1c2430] bg-gradient-to-br from-[#111824] via-[#0f1623] to-[#0b1019] p-8 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.75)]">
              <div className="absolute inset-0 opacity-60 blur-2xl" style={{ background: "radial-gradient(circle at 40% 40%, rgba(96, 156, 255, 0.25), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255, 204, 102, 0.2), transparent 35%)" }} />

              <div className="relative grid items-center gap-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                 Portfolio.
                  </p>
                  <h1 className="text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
                    Building digital products, brands, and experiences.
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      Next.js
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      Kotlin
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1">
                      Flutter
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_-12px_rgba(255,193,94,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-14px_rgba(255,193,94,0.8)]">
                      View Work
                    </button>
                    <button className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-200 hover:text-amber-200">
                      Contact
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="h-72 w-72 rounded-3xl border border-white/5 bg-[radial-gradient(circle_at_30%_30%,rgba(76,140,255,0.35),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(255,196,110,0.28),transparent_40%),linear-gradient(135deg,#0e1724,#0a0f17)] shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)]">
                    <div className="absolute inset-6 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:32px_32px]" />
                    <div className="absolute inset-10 flex items-center justify-center rounded-2xl border border-white/5 bg-[#0f1622] shadow-[0_0_35px_-18px_rgba(77,162,255,0.9)]">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#5bb6ff] via-[#68d0ff] to-[#7ce6ff] shadow-[0_0_30px_12px_rgba(88,178,255,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="h-[1px] flex-1 bg-[#1f2a36]" />
                <span className="text-xs uppercase tracking-[0.4em] text-amber-300">
                  Tech Stack
                </span>
                <div className="h-[1px] flex-1 bg-[#1f2a36]" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {techCards.map((card) => (
                  <div
                    key={card.title}
                    className="relative overflow-hidden rounded-2xl border border-[#1f2a36] bg-[#0f141d] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]"
                  >
                    <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,193,94,0.12), transparent 40%)" }} />
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                        <span>◆</span>
                        <span>{card.title}</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-50">
                        {card.subtitle}
                      </div>
                      <p className="text-sm text-slate-400">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {quickCards.map((card) => (
                <div
                  key={card.title}
                  className="relative overflow-hidden rounded-2xl border border-[#1f2a36] bg-gradient-to-br from-[#111722] via-[#0f1622] to-[#0d131d] p-5 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.7)]"
                >
                  <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,193,94,0.18), transparent 40%)" }} />
                  <div className="relative space-y-2">
                    <div className="text-sm font-semibold text-amber-200">
                      {card.title}
                    </div>
                    <div className="text-base font-medium text-slate-50">
                      {card.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#1f2a36] bg-[#0f141c] p-5 shadow-[0_20px_55px_-38px_rgba(0,0,0,0.8)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-50">
                  Featured Projects
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-amber-300">
                  Work
                </span>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project.title}
                    className="group overflow-hidden rounded-xl border border-[#1f2a36] bg-[#0e131b] transition hover:border-amber-200/60 hover:shadow-[0_15px_45px_-28px_rgba(255,193,94,0.6)]"
                  >
                    <div className="h-32 bg-[radial-gradient(circle_at_30%_30%,rgba(86,142,255,0.25),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,193,94,0.18),transparent_40%),linear-gradient(135deg,#0f1724,#0c111a)]" />
                    <div className="space-y-2 p-4">
                      <div className="text-base font-semibold text-slate-50">
                        {project.title}
                      </div>
                      <p className="text-sm text-slate-400">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-amber-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
