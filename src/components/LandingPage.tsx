import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FlameIcon,
  LineChartIcon,
  UploadIcon,
  ShieldCheckIcon,
  UtensilsIcon,
  PieChartIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  TableIcon,
  LayersIcon,
} from "lucide-react";

/* ── Data ── */
const STEPS = [
  {
    n: "01",
    title: "Bring your data with you",
    description:
      "Import your MacroFactor Food Log in one click. Drop in an Excel or CSV export. Your entire food history, ready to go.",
    icon: UploadIcon,
  },
  {
    n: "02",
    title: "Explore your dashboard",
    description:
      "Every food you've logged instantly populates interactive charts. Caloric density, rankings, donuts, trends. Clarity from action one.",
    icon: FlameIcon,
  },
  {
    n: "03",
    title: "Ask your data questions",
    description:
      "Chat with an AI that knows your food log. Which foods give the most protein per calorie? How has my TDEE changed? Instant answers.",
    icon: MessageSquareIcon,
  },
];

const FEATURES = [
  {
    icon: FlameIcon,
    label: "Caloric Density",
    title: "Own Your Insights.",
    subtitle: "Stop Guessing On Portions.",
    description:
      "Every food plotted by weight vs. calories. See which foods pack the most energy per bite — not just raw macros.",
  },
  {
    icon: PieChartIcon,
    label: "Top Foods",
    title: "See What Matters.",
    subtitle: "Stop Losing Track Of Patterns.",
    description:
      "Interactive donut chart breaking down your calorie sources. Click any slice to drill into individual foods.",
  },
  {
    icon: TrendingUpIcon,
    label: "Trends & TDEE",
    title: "Track The Trends.",
    subtitle: "Know Where You're Heading.",
    description:
      "MacroFactor syncs trend weight and adaptive TDEE to Apple Health but never shows you. Now you can see the full picture.",
  },
  {
    icon: MessageSquareIcon,
    label: "AI Chat",
    title: "Ask Anything.",
    subtitle: "No More Manual Analysis.",
    description:
      "An LLM with your actual food data in context. Ask about protein efficiency, calorie trends, or food comparisons.",
  },
];

const FAQS = [
  {
    q: "Do I need a MacroFactor subscription?",
    a: "Yes. MacroFactor Explorer is a companion tool — it reads your MacroFactor Food Log export. You export the file from within the MacroFactor app (Settings → Export Data).",
  },
  {
    q: "Is there a free plan?",
    a: "MacroFactor Explorer is free to use. You sign in with Google via Clerk, and your data lives in your own Supabase instance. No subscription required.",
  },
  {
    q: "How does the import work?",
    a: "Export your Food Log from MacroFactor as an Excel (.xlsx) or CSV file. Drop it into the import button on the dashboard. Your data is parsed instantly — no manual mapping needed.",
  },
  {
    q: "Can I merge multiple imports?",
    a: "Yes. Importing a new file merges with your existing data. Duplicates are automatically detected and handled. You can also delete individual foods or clear all data at any time.",
  },
  {
    q: "What data formats are supported?",
    a: "Excel (.xlsx) and CSV exports from MacroFactor. The import button accepts both formats. Just drop the file and it's parsed automatically.",
  },
  {
    q: "Is my data secure?",
    a: "Your data lives in your own Supabase instance. Authentication is handled by Clerk (Google sign-in). Nothing is shared with third parties. You can delete your data at any time.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The dashboard is fully responsive and works on phone, tablet, and desktop. Charts and tables adapt to smaller screens automatically.",
  },
  {
    q: "What if I need help?",
    a: "Open an issue on GitHub at github.com/danielgolden/macrofactor-dashboard, or reach out directly. The project is actively maintained.",
  },
];

const CAPABILITIES_NOW = [
  { name: "Scatter Plots", icon: FlameIcon },
  { name: "Rankings Table", icon: TableIcon },
  { name: "Donut Chart", icon: PieChartIcon },
  { name: "Trend Lines", icon: TrendingUpIcon },
  { name: "Treemap", icon: LayersIcon },
  { name: "AI Chat", icon: MessageSquareIcon },
  { name: "Compare Mode", icon: LineChartIcon },
  { name: "Date Range Filter", icon: ShieldCheckIcon },
];

const CAPABILITIES_SOON = [
  { name: "Smart Insights", icon: TrendingUpIcon },
  { name: "Meal Patterns", icon: PieChartIcon },
  { name: "Weekly Reports", icon: LineChartIcon },
  { name: "Goal Tracking", icon: FlameIcon },
];

const CAPABILITIES_ROADMAP = [
  { name: "Nutrient Breakdown", icon: LayersIcon },
  { name: "Custom Tags", icon: TableIcon },
  { name: "Fasting Timer", icon: ShieldCheckIcon },
  { name: "Recipe Analyzer", icon: UtensilsIcon },
];

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* ── Nav ── */}
      <nav className="lp-nav">
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "var(--billow-ink)",
          }}
        >
          <UtensilsIcon style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
            MacroFactor Explorer
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link
            href="#features"
            style={{ fontSize: 13, fontWeight: 500, color: "var(--billow-slate)", textDecoration: "none" }}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            style={{ fontSize: 13, fontWeight: 500, color: "var(--billow-slate)", textDecoration: "none" }}
          >
            How it works
          </Link>
          <Link
            href="#faq"
            style={{ fontSize: 13, fontWeight: 500, color: "var(--billow-slate)", textDecoration: "none" }}
          >
            FAQ
          </Link>
          <Link href="/sign-in" className="lp-cta-light" style={{ fontSize: 13, padding: "8px 16px 8px 20px" }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-section lp-section-hero-gradient" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <p className="lp-eyebrow" style={{ marginBottom: 16 }}>
            For MacroFactor users who want more
          </p>

          {/* Big display text */}
          <div className="lp-display" style={{ marginBottom: 8 }}>
            Run on data,
          </div>
          <div className="lp-display" style={{ color: "var(--billow-slate)", marginBottom: 24 }}>
            not just macros.
          </div>

          {/* H1 subheading */}
          <h1
            className="lp-body"
            style={{ fontSize: 17, maxWidth: 520, margin: "0 auto 32px", fontWeight: 400 }}
          >
            MacroFactor Explorer connects your food log, caloric density, TDEE
            trends, and AI insights — then shows you what&apos;s actually
            working in your diet. No more guessing.
          </h1>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-in" className="lp-cta">
              Get Started
              <ArrowRightIcon style={{ width: 15, height: 15 }} />
            </Link>
            <Link href="#how-it-works" className="lp-cta-light">
              How to get started
              <ArrowRightIcon style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        </div>

        {/* Hero screenshot in browser frame */}
        <div className="lp-browser-frame" style={{ marginTop: 56, maxWidth: 1080, margin: "56px auto 0" }}>
          <div className="lp-browser-bar" style={{ background: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,28,46,0.06)" }}>
            <div className="lp-browser-dot" style={{ background: "#FF5F57" }} />
            <div className="lp-browser-dot" style={{ background: "#FEBC2E" }} />
            <div className="lp-browser-dot" style={{ background: "#28C840" }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "0 auto",
                padding: "4px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.8)",
                fontSize: 11,
                color: "var(--billow-slate)",
                fontWeight: 400,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "1.5px solid var(--billow-slate)",
                  display: "inline-block",
                }}
              />
              macrofactor-dashboard.vercel.app
            </div>
          </div>
          <div className="lp-screenshot" style={{ aspectRatio: "16 / 15" }}>
            <Image
              src="/showcase/dashboard-1.png"
              alt="MacroFactor Explorer dashboard showing caloric density scatter plot, food rankings, and donut chart"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1200px) 100vw, 1080px"
            />
          </div>
        </div>
      </section>

      {/* ── Getting Started ── */}
      <section className="lp-section lp-section-white" id="how-it-works" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="lp-eyebrow" style={{ marginBottom: 16 }}>Getting started</p>
          <h2 className="lp-display-sm">
            Your first insight is
            <br />
            five minutes away.
          </h2>
          <p className="lp-body" style={{ marginTop: 16, maxWidth: 440, margin: "16px auto 0" }}>
            MacroFactor Explorer is built to get you up and running fast. No
            long onboarding, no complicated setup.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            maxWidth: 1080,
            margin: "0 auto",
          }}
        >
          {STEPS.map((step) => (
            <div key={step.n} className="lp-card" style={{ padding: 32, position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  top: 20,
                  right: 24,
                  fontSize: "48px",
                  fontWeight: 400,
                  color: "rgba(0, 28, 46, 0.06)",
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {step.n}
              </span>
              <div className="lp-icon-badge" style={{ marginBottom: 20 }}>
                <step.icon style={{ width: 20, height: 20, color: "var(--billow-ink)" }} />
              </div>
              <h3 className="lp-h3" style={{ marginBottom: 10 }}>
                {step.title}
              </h3>
              <p className="lp-body-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features / Operations Platform ── */}
      <section className="lp-section lp-section-bg" id="features" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 780, margin: "0 auto 56px" }}>
          <p className="lp-eyebrow" style={{ marginBottom: 16 }}>The Insights Platform</p>
          <h2 className="lp-display-sm">
            From data to insights.
            <br />
            All in one place.
          </h2>
          <p className="lp-body" style={{ marginTop: 16, maxWidth: 440, margin: "16px auto 0" }}>
            Stay on top of caloric density, food rankings, trends, and AI
            insights. Without the spreadsheet mess.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
            maxWidth: 1080,
            margin: "0 auto",
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-card-white" style={{ padding: 28, boxShadow: "0 1px 3px rgba(0,28,46,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div className="lp-icon-badge" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <f.icon style={{ width: 17, height: 17, color: "var(--billow-ink)" }} />
                </div>
                <span className="lp-eyebrow">{f.label}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--billow-ink)", marginBottom: 4 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--billow-slate)", marginBottom: 12 }}>
                {f.subtitle}
              </p>
              <p className="lp-body-sm">{f.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/sign-in" className="lp-cta">
            Get Started
            <ArrowRightIcon style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </section>

      {/* ── Secondary screenshot + CRM-style section ── */}
      <section className="lp-section lp-section-white" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            maxWidth: 1080,
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          {/* Screenshot */}
          <div className="lp-card-white" style={{ overflow: "hidden", boxShadow: "0 4px 24px rgba(0,28,46,0.06)" }}>
            <div className="lp-browser-bar" style={{ borderBottom: "1px solid rgba(0,28,46,0.06)" }}>
              <div className="lp-browser-dot" style={{ background: "#FF5F57", width: 9, height: 9 }} />
              <div className="lp-browser-dot" style={{ background: "#FEBC2E", width: 9, height: 9 }} />
              <div className="lp-browser-dot" style={{ background: "#28C840", width: 9, height: 9 }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--billow-slate)" }}>
                Trends &amp; TDEE
              </span>
            </div>
            <div className="lp-screenshot" style={{ aspectRatio: "16 / 15" }}>
              <Image
                src="/showcase/dashboard-2.png"
                alt="MacroFactor Explorer showing trend weight and TDEE charts"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          </div>

          {/* Feature callouts */}
          <div>
            <p className="lp-eyebrow" style={{ marginBottom: 16 }}>The dashboard</p>
            <h2 className="lp-h3-lg" style={{ marginBottom: 24 }}>
              Your food log,
              <br />
              finally visualized.
            </h2>
            <p className="lp-body" style={{ marginBottom: 28, maxWidth: 440 }}>
              A real dashboard, telling you which foods to keep and which to cut.
              Food history, density plots, and trend lines — without paying for a
              separate tool or switching tabs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { icon: FlameIcon, title: "Caloric density scatter plot", desc: "Every food plotted by weight vs. calories — spot outliers instantly." },
                { icon: TrendingUpIcon, title: "Trend weight & adaptive TDEE", desc: "See the data MacroFactor syncs to Apple Health but never shows you." },
                { icon: PieChartIcon, title: "Top foods by calories", desc: "Interactive donut chart breaking down your calorie sources." },
                { icon: MessageSquareIcon, title: "AI-powered chat", desc: "Ask questions about your data and get instant, context-aware answers." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="lp-icon-badge" style={{ width: 36, height: 36, borderRadius: 10 }}>
                    <item.icon style={{ width: 17, height: 17, color: "var(--billow-ink)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--billow-ink)", marginBottom: 3 }}>
                      {item.title}
                    </p>
                    <p className="lp-body-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-section" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="lp-cta-banner" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 className="lp-display-sm" style={{ color: "#fff", marginBottom: 16 }}>
            Stop running on guesswork.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 420, margin: "0 auto 32px" }}>
            Sign in with Google and upload your MacroFactor export to get started
            in minutes.
          </p>
          <Link
            href="/sign-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 500,
              background: "#fff",
              color: "var(--billow-ink)",
              textDecoration: "none",
            }}
          >
            Get Started
            <ArrowRightIcon style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section lp-section-white" id="faq" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="lp-eyebrow" style={{ marginBottom: 16 }}>FAQs</p>
          <h2 className="lp-display-sm">Totally fair to ask.</h2>
          <p className="lp-body" style={{ marginTop: 12 }}>
            Answers to common questions:
          </p>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => (
            <details key={i} className="lp-faq-item" style={{ background: "var(--billow-bg)" }}>
              <summary className="lp-faq-summary">
                {faq.q}
                <ChevronDownIcon style={{ width: 16, height: 16, color: "var(--billow-slate)", flexShrink: 0 }} />
              </summary>
              <div className="lp-faq-content">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Capabilities checklist ── */}
      <section className="lp-section lp-section-bg" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="lp-eyebrow" style={{ marginBottom: 16 }}>Everything included</p>
          <h2 className="lp-display-sm">
            Every view. One tool.
          </h2>
          <p className="lp-body" style={{ marginTop: 12 }}>
            MacroFactor Explorer keeps your food data organized.
          </p>
        </div>

        {/* Live now */}
        <div style={{ maxWidth: 1080, margin: "0 auto 24px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {CAPABILITIES_NOW.map((cap) => (
              <div key={cap.name} className="lp-pill">
                <cap.icon style={{ width: 14, height: 14, color: "var(--billow-ink)" }} />
                {cap.name}
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div style={{ maxWidth: 1080, margin: "0 auto 24px" }}>
          <p className="lp-eyebrow" style={{ textAlign: "center", marginBottom: 12, fontSize: 11, opacity: 0.6 }}>
            Coming soon
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {CAPABILITIES_SOON.map((cap) => (
              <div
                key={cap.name}
                className="lp-pill"
                style={{ opacity: 0.5 }}
              >
                <cap.icon style={{ width: 14, height: 14 }} />
                {cap.name}
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--billow-slate)", marginLeft: 4 }}>Soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p className="lp-eyebrow" style={{ textAlign: "center", marginBottom: 12, fontSize: 11, opacity: 0.4 }}>
            On roadmap
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {CAPABILITIES_ROADMAP.map((cap) => (
              <div
                key={cap.name}
                className="lp-pill"
                style={{ opacity: 0.3 }}
              >
                <cap.icon style={{ width: 14, height: 14 }} />
                {cap.name}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/sign-in" className="lp-cta">
            Get Started
            <ArrowRightIcon style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(0, 28, 46, 0.06)",
          background: "var(--billow-white)",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                color: "var(--billow-ink)",
                marginBottom: 12,
              }}
            >
              <UtensilsIcon style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>MacroFactor Explorer</span>
            </Link>
            <p style={{ fontSize: 12, color: "var(--billow-slate)", maxWidth: 240 }}>
              Visualize your macro data in new ways.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <h6 style={{ fontSize: 12, fontWeight: 600, color: "var(--billow-ink)", marginBottom: 12 }}>
                Socials
              </h6>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  href="https://github.com/danielgolden/macrofactor-dashboard"
                  style={{ fontSize: 12, color: "var(--billow-slate)", textDecoration: "none" }}
                >
                  GitHub
                </Link>
                <Link
                  href="/sign-in"
                  style={{ fontSize: 12, color: "var(--billow-slate)", textDecoration: "none" }}
                >
                  Sign in
                </Link>
              </div>
            </div>
            <div>
              <h6 style={{ fontSize: 12, fontWeight: 600, color: "var(--billow-ink)", marginBottom: 12 }}>
                Legal
              </h6>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  href="https://github.com/danielgolden/macrofactor-dashboard#readme"
                  style={{ fontSize: 12, color: "var(--billow-slate)", textDecoration: "none" }}
                >
                  Privacy
                </Link>
                <Link
                  href="https://github.com/danielgolden/macrofactor-dashboard#readme"
                  style={{ fontSize: 12, color: "var(--billow-slate)", textDecoration: "none" }}
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>

          {/* Built with */}
          <div>
            <Link
              href="https://github.com/danielgolden/macrofactor-dashboard"
              style={{
                fontSize: 12,
                color: "var(--billow-slate)",
                textDecoration: "none",
              }}
            >
              Built with Next.js 15 · Clerk · Supabase
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
