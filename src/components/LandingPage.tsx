import Link from "next/link";
import {
  ArrowRightIcon,
  FlameIcon,
  LineChartIcon,
  UploadIcon,
  ShieldCheckIcon,
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
