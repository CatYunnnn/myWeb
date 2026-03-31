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
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--mesh-1),transparent_30%),radial-gradient(circle_at_80%_10%,var(--mesh-2),transparent_30%),radial-gradient(circle_at_60%_70%,var(--mesh-1),transparent_28%)] transition-colors duration-500" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-border)_1px,transparent_1px),linear-gradient(210deg,var(--color-border)_1px,transparent_1px)] bg-[length:200px_200px] transition-colors duration-500 opacity-60 dark:opacity-100" />
      </div>

      <main className="relative mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 dark:shadow-[0_25px_70px_-30px_rgba(0,0,0,0.75)]">
              <div className="absolute inset-0 opacity-60 blur-2xl bg-[radial-gradient(circle_at_40%_40%,var(--mesh-1),transparent_40%),radial-gradient(circle_at_80%_30%,var(--mesh-2),transparent_35%)] transition-colors duration-500" />

              <div className="relative grid items-center gap-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-muted">
                    Portfolio.
                  </p>
                  <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                    Building digital products, brands, and experiences.
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/80">
                    <span className="rounded-full bg-black/5 dark:bg-white/5 border border-border px-3 py-1">
                      Next.js
                    </span>
                    <span className="rounded-full bg-black/5 dark:bg-white/5 border border-border px-3 py-1">
                      Kotlin
                    </span>
                    <span className="rounded-full bg-black/5 dark:bg-white/5 border border-border px-3 py-1">
                      Flutter
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white dark:text-slate-950 shadow-[0_10px_30px_-12px_var(--glow-accent)] transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_40px_-14px_var(--glow-accent)]">
                      View Work
                    </button>
                    <button className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent bg-background/50 backdrop-blur">
                      Contact
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center hidden sm:flex">
                  <div className="h-72 w-72 rounded-3xl border border-border bg-[radial-gradient(circle_at_30%_30%,var(--mesh-1),transparent_45%),radial-gradient(circle_at_70%_70%,var(--mesh-2),transparent_40%),linear-gradient(135deg,var(--color-card),var(--color-background))] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 dark:shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)]">
                    <div className="absolute inset-6 rounded-2xl border border-border bg-[linear-gradient(120deg,var(--color-border)_1px,transparent_1px)] bg-[length:32px_32px]" />
                    <div className="absolute inset-10 flex items-center justify-center rounded-2xl border border-border bg-background shadow-[0_0_35px_-18px_var(--mesh-1)]">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#72a3ff] via-[#85d8ff] to-[#99efff] shadow-[0_0_30px_12px_var(--mesh-1)] dark:from-[#5bb6ff] dark:via-[#68d0ff] dark:to-[#7ce6ff]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted">
                <div className="h-[1px] flex-1 bg-border" />
                <span className="text-xs uppercase tracking-[0.4em] text-accent">
                  Tech Stack
                </span>
                <div className="h-[1px] flex-1 bg-border" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {techCards.map((card) => (
                  <div
                    key={card.title}
                    className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500 dark:shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]"
                  >
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,var(--glow-accent),transparent_40%)] transition-colors duration-500" />
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                        <span>◆</span>
                        <span>{card.title}</span>
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {card.subtitle}
                      </div>
                      <p className="text-sm text-muted">{card.description}</p>
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
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500 dark:shadow-[0_18px_50px_-35px_rgba(0,0,0,0.7)]"
                >
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,var(--glow-accent),transparent_40%)] transition-colors duration-500" />
                  <div className="relative space-y-2">
                    <div className="text-sm font-semibold text-accent">
                      {card.title}
                    </div>
                    <div className="text-base font-medium text-foreground">
                      {card.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500 dark:shadow-[0_20px_55px_-38px_rgba(0,0,0,0.8)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Featured Projects
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-accent">
                  Work
                </span>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project.title}
                    className="group overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-accent hover:shadow-[0_10px_30px_-15px_var(--glow-accent)] dark:hover:shadow-[0_15px_45px_-28px_var(--glow-accent)]"
                  >
                    <div className="h-32 bg-[radial-gradient(circle_at_30%_30%,var(--mesh-1),transparent_45%),radial-gradient(circle_at_80%_20%,var(--mesh-2),transparent_40%),linear-gradient(135deg,var(--color-card),var(--color-background))]" />
                    <div className="space-y-2 p-4">
                      <div className="text-base font-semibold text-foreground">
                        {project.title}
                      </div>
                      <p className="text-sm text-muted">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-black/5 px-3 py-1 text-xs font-semibold text-accent dark:bg-white/5"
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
