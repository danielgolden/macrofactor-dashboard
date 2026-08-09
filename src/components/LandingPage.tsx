import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  FlameIcon,
  LineChartIcon,
  MonitorIcon,
  ShieldCheckIcon,
  UploadIcon,
  UtensilsIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: FlameIcon,
    title: "Caloric Density Visualization",
    description:
      "See calorie-per-gram density of the foods you log — not just raw macros. Spot which foods pack the most energy per bite.",
  },
  {
    icon: LineChartIcon,
    title: "Trend Weight & TDEE",
    description:
      "Track adaptive TDEE and trend weight data that MacroFactor syncs to Apple Health but never visualizes for you.",
  },
  {
    icon: UploadIcon,
    title: "Import Your Data",
    description:
      "Upload your MacroFactor Food Log export (Excel/CSV) and get instant, interactive visualizations of your history.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Auth",
    description:
      "Sign in with Google via Clerk. Your data stays in your own Supabase instance — never shared, always yours.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Export",
    description:
      "Open MacroFactor and export your Food Log as an Excel file from the in-app menu.",
  },
  {
    n: "02",
    title: "Upload",
    description:
      "Drop the file into the dashboard import button and your data is parsed instantly.",
  },
  {
    n: "03",
    title: "Explore",
    description:
      "Dive into interactive charts — density scatter plots, rankings, treemaps, and trends.",
  },
];

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <UtensilsIcon className="size-5" />
          <span className="text-base font-semibold">MacroFactor Explorer</span>
        </div>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          MacroFactor Explorer
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Visualize your macro data
          <br />
          <em className="italic text-muted-foreground">in new ways.</em>
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          A companion dashboard for MacroFactor users. Import your food log and
          unlock insights MacroFactor&apos;s own UI doesn&apos;t show — caloric
          density, TDEE trends, and more.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get Started
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>

      {/* UI Showcase */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <MonitorIcon className="size-3.5" />
            See it in action
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A dashboard that actually shows you what matters
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Every view is built to surface insights the MacroFactor app
            doesn&apos;t — from caloric density scatter plots to top-foods
            breakdowns and trend lines.
          </p>
        </div>

        {/* Browser-frame mockup with screenshot */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-400/80" />
              <div className="size-3 rounded-full bg-yellow-400/80" />
              <div className="size-3 rounded-full bg-green-400/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="size-3 rounded-full border border-muted-foreground/40" />
              macrofactor-dashboard.vercel.app
            </div>
          </div>
          {/* Screenshot */}
          <div className="relative aspect-[16/15] w-full bg-muted/20">
            <Image
              src="/showcase/dashboard-1.png"
              alt="MacroFactor Explorer dashboard showing caloric density scatter plot, food rankings, and donut chart"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>
        </div>

        {/* Secondary screenshots row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400/80" />
                <div className="size-2.5 rounded-full bg-yellow-400/80" />
                <div className="size-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                Trends &amp; TDEE
              </span>
            </div>
            <div className="relative aspect-[16/15] w-full bg-muted/20">
              <Image
                src="/showcase/dashboard-2.png"
                alt="MacroFactor Explorer showing trend weight and TDEE charts with green data visualization"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          </div>

          {/* Feature callouts card */}
          <div className="flex flex-col justify-center gap-5 rounded-xl border border-border bg-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold">
              Everything at a glance
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <FlameIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Caloric density scatter plot</p>
                  <p className="text-sm text-muted-foreground">
                    Every food plotted by weight vs. calories — spot outliers instantly.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <LineChartIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Trend weight &amp; adaptive TDEE</p>
                  <p className="text-sm text-muted-foreground">
                    See the data MacroFactor syncs to Apple Health but never shows you.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <UtensilsIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Top foods by calories</p>
                  <p className="text-sm text-muted-foreground">
                    Interactive donut chart breaking down your calorie sources.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          What you get
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="size-5 text-foreground" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-3">
              <span className="text-3xl font-bold tracking-tight text-muted-foreground/40">
                {step.n}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to see your data differently?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sign in with Google and upload your MacroFactor export to get started.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get Started
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl border-t border-border px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <UtensilsIcon className="size-4" />
            <span>MacroFactor Explorer</span>
          </div>
          <p className="text-xs">
            Built with Next.js 15 · Clerk · Supabase · Tailwind CSS
          </p>
        </div>
      </footer>
    </main>
  );
}
