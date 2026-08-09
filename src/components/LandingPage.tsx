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
  TableIcon,
  MessageSquareIcon,
} from "lucide-react";

/* ── color tokens (billow.so palette adapted for MFE) ── */
const C = {
  bg: "#FCFDFF",
  ink: "#001C2E",
  slate: "#446278",
  border: "#E4E9EF",
  card: "#FFFFFF",
  accent: "#2855D9",
};

/* ── pill CTA ── */
function PillCTA({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "999px",
    padding: "12px 22px 12px 28px",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    transition: "all 0.2s ease",
    textDecoration: "none",
  };
  if (variant === "dark") {
    return (
      <Link
        href={href}
        style={{
          ...base,
          background: C.ink,
          color: "#fff",
        }}
        className="hover:opacity-85"
      >
        {children}
        <ArrowRightIcon style={{ width: 15, height: 15 }} />
      </Link>
    );
  }
  return (
    <Link
      href={href}
      style={{
        ...base,
        background: "transparent",
        color: C.ink,
        border: `1px solid ${C.border}`,
      }}
      className="hover:bg-gray-50"
    >
      {children}
      <ArrowRightIcon style={{ width: 15, height: 15 }} />
    </Link>
  );
}

/* ── eyebrow label ── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: C.slate,
        letterSpacing: "-0.01em",
        marginBottom: "16px",
      }}
    >
      {children}
    </p>
  );
}

/* ── section wrapper ── */
function Section({
  children,
  bg = C.bg,
  py = 96,
}: {
  children: React.ReactNode;
  bg?: string;
  py?: number;
}) {
  return (
    <section style={{ background: bg, padding: `${py}px 24px` }}>
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ── data ── */
const STEPS = [
  {
    n: "01",
    title: "Export your Food Log",
    description:
      "Open MacroFactor, go to Settings → Export Data, and save your Food Log as an Excel file.",
    icon: UploadIcon,
    mock: "excel",
  },
  {
    n: "02",
    title: "Upload to the dashboard",
    description:
      "Drop the file into the import button. Your data is parsed instantly — no manual entry, no mapping.",
    icon: UtensilsIcon,
    mock: "upload",
  },
  {
    n: "03",
    title: "Explore your insights",
    description:
      "Dive into caloric density scatter plots, food rankings, treemaps, trend lines, and an AI chat that knows your data.",
    icon: FlameIcon,
    mock: "explore",
  },
];

const FEATURES = [
  {
    icon: FlameIcon,
    label: "Caloric Density",
    title: "See which foods pack the most energy per bite.",
    description:
      "Every food plotted by weight vs. calories. Spot outliers, find high-density staples, and understand your diet in a way MacroFactor never shows you.",
  },
  {
    icon: PieChartIcon,
    label: "Top Foods Breakdown",
    title: "Interactive donut of your calorie sources.",
    description:
      "Click any slice to drill into individual foods. See exactly what percentage of your calories come from each food item in any date range.",
  },
  {
    icon: TrendingUpIcon,
    label: "Trends & TDEE",
    title: "Track adaptive TDEE and trend weight over time.",
    description:
      "MacroFactor syncs this data to Apple Health but never visualizes it. Now you can see the full picture — weekly, monthly, or all-time.",
  },
  {
    icon: MessageSquareIcon,
    label: "AI Chat",
    title: "Ask questions about your food data.",
    description:
      "\"Which foods give me the most protein per calorie?\" \"How has my TDEE changed?\" Get instant answers from an LLM that has your actual data in context.",
  },
];

const FAQS = [
  {
    q: "Do I need a MacroFactor subscription?",
    a: "Yes. MacroFactor Explorer is a companion tool — it reads your MacroFactor Food Log export. You export the file from within the MacroFactor app.",
  },
  {
    q: "Is my data secure?",
    a: "Your data lives in your own Supabase instance. Authentication is handled by Clerk (Google sign-in). Nothing is shared with third parties.",
  },
  {
    q: "What file formats are supported?",
    a: "Excel (.xlsx) and CSV exports from MacroFactor. The import button accepts both — just drop the file and it's parsed automatically.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The dashboard is fully responsive and works on phone, tablet, and desktop. Charts adapt to smaller screens automatically.",
  },
  {
    q: "Can I merge multiple imports?",
    a: "Yes. Importing a new file merges with your existing data. Duplicates are automatically detected and handled — no manual cleanup needed.",
  },
  {
    q: "What if I need to delete my data?",
    a: "You can delete individual foods or clear all data from the dashboard at any time. Your Supabase instance is yours to control.",
  },
];

const CAPABILITIES = [
  { name: "Scatter Plots", status: "live" },
  { name: "Rankings Table", status: "live" },
  { name: "Donut Chart", status: "live" },
  { name: "Trend Lines", status: "live" },
  { name: "Treemap", status: "live" },
  { name: "AI Chat", status: "live" },
  { name: "Compare Mode", status: "live" },
  { name: "Date Range Filter", status: "live" },
  { name: "Detail Modal", status: "live" },
  { name: "Responsive Layout", status: "live" },
  { name: "Data Merge", status: "live" },
  { name: "Search & Filter", status: "live" },
];

export function LandingPage() {
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UtensilsIcon style={{ width: 18, height: 18, color: C.ink }} />
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
            MacroFactor Explorer
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="#features"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: C.slate,
              textDecoration: "none",
            }}
            className="hover:opacity-70"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: C.slate,
              textDecoration: "none",
            }}
            className="hover:opacity-70"
          >
            How it works
          </Link>
          <Link
            href="#faq"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: C.slate,
              textDecoration: "none",
            }}
            className="hover:opacity-70"
          >
            FAQ
          </Link>
          <PillCTA href="/sign-in" variant="light">
            Sign in
          </PillCTA>
        </div>
      </nav>

      {/* ── Hero ── */}
      <Section py={80}>
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto" }}>
          <Eyebrow>A companion dashboard for MacroFactor users</Eyebrow>
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 400,
              letterSpacing: "-0.05em",
              lineHeight: 1.05,
              color: C.ink,
              marginBottom: "24px",
            }}
          >
            Run on data,
            <br />
            <span style={{ color: C.slate }}>not just macros.</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.55,
              color: C.slate,
              maxWidth: "560px",
              margin: "0 auto 36px",
            }}
          >
            MacroFactor Explorer connects your food log, caloric density, TDEE
            trends, and AI insights — then shows you what&apos;s actually
            working in your diet. No more guessing.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <PillCTA href="/sign-in">Get Started</PillCTA>
            <PillCTA href="#how-it-works" variant="light">
              How it works
            </PillCTA>
          </div>
        </div>

        {/* ── Hero screenshot in browser frame ── */}
        <div
          style={{
            marginTop: "56px",
            borderRadius: "16px",
            border: `1px solid ${C.border}`,
            background: C.card,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0, 28, 46, 0.06)",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              background: "#F8FAFC",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#FF5F57",
                }}
              />
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#FEBC2E",
                }}
              />
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#28C840",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "0 auto",
                padding: "4px 14px",
                borderRadius: "6px",
                border: `1px solid ${C.border}`,
                background: "#fff",
                fontSize: 11,
                color: C.slate,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: `1.5px solid ${C.slate}`,
                  display: "inline-block",
                }}
              />
              macrofactor-dashboard.vercel.app
            </div>
          </div>
          {/* Screenshot */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 15",
              background: "#FAFBFC",
            }}
          >
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
      </Section>

      {/* ── Getting Started / 3 Steps ── */}
      <Section py={96} bg="#F8FAFC">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <Eyebrow>Getting started</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            Your first insight is
            <br />
            five minutes away.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: C.slate,
              marginTop: "16px",
              maxWidth: "440px",
              margin: "16px auto 0",
            }}
          >
            No complicated setup. No manual data entry. Export, upload, explore.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "16px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Number watermark */}
              <span
                style={{
                  position: "absolute",
                  top: 16,
                  right: 20,
                  fontSize: "48px",
                  fontWeight: 400,
                  color: C.border,
                  letterSpacing: "-0.03em",
                }}
              >
                {step.n}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  background: "#F1F5F9",
                  marginBottom: "20px",
                }}
              >
                <step.icon
                  style={{ width: 20, height: 20, color: C.ink }}
                />
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  marginBottom: "10px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.55,
                  color: C.slate,
                }}
              >
                {step.description}
              </p>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: C.slate,
                    opacity: 0.6,
                  }}
                >
                  <span style={{ fontSize: 11 }}>Next step</span>
                  <ArrowRightIcon style={{ width: 12, height: 12 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Secondary screenshot + feature callouts ── */}
      <Section py={96}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          {/* Screenshot in frame */}
          <div
            style={{
              borderRadius: "16px",
              border: `1px solid ${C.border}`,
              background: C.card,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0, 28, 46, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderBottom: `1px solid ${C.border}`,
                background: "#F8FAFC",
              }}
            >
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: C.slate }}>
                Trends &amp; TDEE
              </span>
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 15",
                background: "#FAFBFC",
              }}
            >
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
          <div style={{ padding: "8px 0" }}>
            <Eyebrow>The dashboard</Eyebrow>
            <h3
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 400,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: C.ink,
                marginBottom: "24px",
              }}
            >
              Everything at a glance.
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  icon: FlameIcon,
                  title: "Caloric density scatter plot",
                  desc: "Every food plotted by weight vs. calories — spot outliers instantly.",
                },
                {
                  icon: TrendingUpIcon,
                  title: "Trend weight & adaptive TDEE",
                  desc: "See the data MacroFactor syncs to Apple Health but never shows you.",
                },
                {
                  icon: PieChartIcon,
                  title: "Top foods by calories",
                  desc: "Interactive donut chart breaking down your calorie sources.",
                },
                {
                  icon: MessageSquareIcon,
                  title: "AI-powered chat",
                  desc: "Ask questions about your data and get instant, context-aware answers.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      background: "#F1F5F9",
                      flexShrink: 0,
                    }}
                  >
                    <item.icon style={{ width: 17, height: 17, color: C.ink }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: C.ink,
                        marginBottom: 3,
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features grid ── */}
      <Section py={96} bg="#F8FAFC" >
        <div id="features" style={{ textAlign: "center", marginBottom: "56px" }}>
          <Eyebrow>The platform</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            From data to insights.
            <br />
            All in one place.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "16px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "#F1F5F9",
                  }}
                >
                  <f.icon style={{ width: 17, height: 17, color: C.ink }} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: C.slate,
                  }}
                >
                  {f.label}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: C.ink,
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.55,
                  color: C.slate,
                }}
              >
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA banner ── */}
      <Section py={80}>
        <div
          style={{
            textAlign: "center",
            borderRadius: "24px",
            background: `linear-gradient(135deg, ${C.ink} 0%, #0A2540 100%)`,
            padding: "64px 32px",
            color: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Stop guessing. Start exploring.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "420px",
              margin: "0 auto 32px",
            }}
          >
            Sign in with Google and upload your MacroFactor export to get
            started in minutes.
          </p>
          <Link
            href="/sign-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: "999px",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              background: "#fff",
              color: C.ink,
              textDecoration: "none",
            }}
            className="hover:opacity-90"
          >
            Get Started
            <ArrowRightIcon style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section py={96} bg="#F8FAFC">
        <div id="faq" style={{ textAlign: "center", marginBottom: "48px" }}>
          <Eyebrow>FAQs</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            Totally fair to ask.
          </h2>
        </div>
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {FAQS.map((faq, i) => (
            <details
              key={i}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: "18px 24px",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: C.ink,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  listStyle: "none",
                }}
              >
                {faq.q}
                <ChevronDownIcon
                  style={{ width: 16, height: 16, color: C.slate, flexShrink: 0 }}
                />
              </summary>
              <div
                style={{
                  padding: "0 24px 18px",
                  fontSize: "14px",
                  lineHeight: 1.55,
                  color: C.slate,
                }}
              >
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </Section>

      {/* ── Capability checklist ── */}
      <Section py={80}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Eyebrow>Everything included</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            Every view, one tool.
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: "999px",
                border: `1px solid ${C.border}`,
                background: C.card,
                fontSize: 13,
                fontWeight: 500,
                color: C.ink,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#28C840",
                }}
              />
              {cap.name}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UtensilsIcon style={{ width: 15, height: 15, color: C.slate }} />
            <span style={{ fontSize: 13, color: C.slate, fontWeight: 500 }}>
              MacroFactor Explorer
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.slate }}>
            Built with Next.js 15 · Clerk · Supabase · Tailwind CSS
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link
              href="/sign-in"
              style={{ fontSize: 12, color: C.slate, textDecoration: "none" }}
            >
              Sign in
            </Link>
            <Link
              href="https://github.com/danielgolden/macrofactor-dashboard"
              style={{ fontSize: 12, color: C.slate, textDecoration: "none" }}
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
