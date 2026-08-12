import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { lastik } from "@/lib/fonts";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  LogInIcon,
  PlusIcon,
  SparklesIcon,
  UploadIcon,
  UtensilsIcon,
} from "lucide-react";

import styles from "./LandingPage.module.css";

function Shot({
  light,
  dark,
  alt,
  eager,
  width,
  height,
}: {
  light: string;
  dark: string;
  alt: string;
  eager?: boolean;
  width: number;
  height: number;
}) {
  return (
    <picture>
      <source srcSet={dark} media="(prefers-color-scheme: dark)" />
      <img
        src={light}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </picture>
  );
}

function AuthLink({ nav }: { nav?: boolean }) {
  return (
    <>
      <SignedOut>
        <Link
          href="/sign-in"
          className={nav ? `${styles.btn} ${styles.btnOutline}` : `${styles.btn} ${styles.btnPrimary}`}
        >
          {nav ? "Sign in" : "Get started"}
          {!nav && <ChevronRightIcon size={16} />}
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/app"
          className={nav ? `${styles.btn} ${styles.btnOutline}` : `${styles.btn} ${styles.btnPrimary}`}
        >
          Open app
          {!nav && <ChevronRightIcon size={16} />}
        </Link>
      </SignedIn>
    </>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <span className={styles.kicker}>{children}</span>;
}

export function LandingPage() {
  return (
    <div className={`${styles.root} ${lastik.variable}`}>
      {/* ------------------------------- Nav ------------------------------ */}
      <nav className={`${styles.container} ${styles.nav}`}>
        <span className={styles.brand}>
          <span className={styles.brandMark}>
            <UtensilsIcon size={15} />
          </span>
          <span className={styles.brandName}>MacroFactor Explorer</span>
        </span>
        <AuthLink nav />
      </nav>

      {/* ------------------------------- Hero ------------------------------ */}
      <header className={`${styles.container} ${styles.hero}`}>
        <Kicker>
          A companion for MacroFactor
          <ChevronRightIcon size={13} />
        </Kicker>

        <h1 className={`${styles.display} ${styles.heroH1}`}>
          Your food log has <em>more to tell you.</em>
        </h1>

        <p className={styles.heroSub}>
          MacroFactor Explorer picks up where MacroFactor leaves off, revealing
          the patterns behind your eating habits.
        </p>

        <div className={styles.heroCtas}>
          <AuthLink />
          <Link href="#how-it-works" className={`${styles.btn} ${styles.btnGhost}`}>
            How it works
            <ChevronRightIcon size={16} />
          </Link>
        </div>

        <div className={styles.showcase}>
          <div className={styles.glow} aria-hidden />
          <div className={styles.shot}>
            <div className={`${styles.shotInner} ${styles.shotCrop}`}>
              <Shot
                light="/screenshots/explorer-light.png"
                dark="/screenshots/explorer-dark.png"
                alt="The MacroFactor Explorer dashboard — stat cards, a top-foods calorie donut, and the food explorer table"
                eager
                width={1974}
                height={1900}
              />
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------- How it works -------------------------- */}
      <section id="how-it-works" className={`${styles.container} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <Kicker>How it works</Kicker>
          <h2 className={`${styles.display} ${styles.sectionH2}`}>
            From export to insight,
            <br />
            <em>in five minutes.</em>
          </h2>
          <p className={styles.sectionSub}>
            No API, no sync, no setup. Three steps and your dashboard is alive.
          </p>
        </div>

        <div className={styles.steps}>
          {/* Step 1 — Export */}
          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <div className={styles.mockCard} aria-hidden>
                <div className={styles.mockRow}>
                  <span className={`${styles.chipTiny} ${styles.chipGreen}`}>CSV</span>
                  <div className={styles.bar} style={{ width: "45%" }} />
                </div>
                <div className={styles.mockRow}>
                  <div className={styles.bar} style={{ width: "60%" }} />
                  <div className={styles.bar} style={{ width: "20%" }} />
                </div>
                <div className={styles.mockRow}>
                  <div className={styles.bar} style={{ width: "35%" }} />
                  <div className={styles.bar} style={{ width: "30%" }} />
                </div>
                <div className={styles.mockRow}>
                  <div className={styles.bar} style={{ width: "50%" }} />
                  <div className={styles.bar} style={{ width: "15%" }} />
                </div>
              </div>
              <span className={styles.floatPill} style={{ bottom: 26 }}>
                <FileSpreadsheetIcon size={15} />
                Export .xlsx
              </span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={`${styles.serifSmall} ${styles.stepTitle}`}>Export your food log</h3>
              <p className={styles.stepText}>
                In MacroFactor, export your Food Log as an Excel file. There&apos;s
                no public API, so this file is the bridge — and the only setup step.
              </p>
            </div>
          </div>

          {/* Step 2 — Sign in */}
          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <div className={styles.mockCard} aria-hidden>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={styles.gCircle}>G</span>
                  <div style={{ flex: 1 }}>
                    <div className={styles.bar} style={{ width: "55%", marginBottom: 6 }} />
                    <div className={styles.bar} style={{ width: "35%" }} />
                  </div>
                </div>
                <div className={styles.darkPillMock}>Continue with Google</div>
              </div>
              <span className={styles.floatPill} style={{ bottom: 26 }}>
                <LogInIcon size={15} />
                One click
              </span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={`${styles.serifSmall} ${styles.stepTitle}`}>Sign in, no email needed</h3>
              <p className={styles.stepText}>
                One click with Google, or just a username and password — we
                never ask for an email address. Your data stays private — each
                user only ever sees their own log.
              </p>
            </div>
          </div>

          {/* Step 3 — Import */}
          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <div className={styles.dropzone} aria-hidden>
                <UploadIcon size={22} />
                <span>Drop your export here</span>
              </div>
              <span className={styles.floatPill} style={{ bottom: 26 }}>
                <CheckIcon size={15} />
                44 foods imported
              </span>
            </div>
            <div className={styles.stepBody}>
              <h3 className={`${styles.serifSmall} ${styles.stepTitle}`}>Import and explore</h3>
              <p className={styles.stepText}>
                Drop the .xlsx or .csv into the app and every view fills in
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- Features --------------------------- */}
      <section className={`${styles.container} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <Kicker>What you can explore</Kicker>
          <h2 className={`${styles.display} ${styles.sectionH2}`}>
            Six views.
            <br />
            <em>One food log.</em>
          </h2>
          <p className={styles.sectionSub}>
            Each one answers a different question about how you actually eat.
          </p>
        </div>

        {/* Trends — headline pair + screenshot */}
        <div className={styles.featureRow}>
          <div className={styles.featureRowHead}>
            <h3 className={`${styles.display} ${styles.featurePair}`}>
              Watch your habits shift.
              <span className={styles.l2}>Week over week.</span>
            </h3>
            <p className={styles.featureDesc}>
              Weekly average caloric density and macro split over time, with
              period-over-period comparison to show which direction you&apos;re
              moving.
            </p>
          </div>
          <div className={styles.featureShot}>
            <div className={styles.featureGlow} aria-hidden />
            <div className={styles.shot}>
              <div className={`${styles.shotInner} ${styles.shotCrop}`} style={{ maxHeight: 560 }}>
                <Shot
                  light="/screenshots/trends-light.png"
                  dark="/screenshots/trends-dark.png"
                alt="The Trends view — an average caloric density chart and macro split over time"
                width={1980}
                height={1894}
              />
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat — split panel */}
        <div className={styles.chatPanel}>
          <div className={styles.chatCopy}>
            <Kicker>
              <SparklesIcon size={13} />
              AI Chat
            </Kicker>
            <h3 className={`${styles.display} ${styles.chatPair}`}>
              Ask anything.
              <span className={styles.l2}>Answered in plain language.</span>
            </h3>
            <p className={styles.chatDesc}>
              The chat reads your actual log, so answers are about how{" "}
              <em>you</em> eat — like which swaps would lower your caloric
              density without giving up the foods you love.
            </p>
            <AuthLink />
          </div>
          <div className={styles.chatVisual}>
            <div className={styles.chatCard} aria-hidden>
              <div className={styles.bubbleUser}>
                What drove my calories this week?
              </div>
              <div className={styles.bubbleAi}>
                <SparklesIcon size={13} />
                Butter, sourdough and peanut butter made up 38% of your intake.
                Want lower-density swaps?
              </div>
              <div className={styles.chatInput}>
                Ask about your data…
                <ArrowUpIcon size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Four remaining views */}
        <div className={styles.viewsGrid}>
          <div className={styles.viewCard}>
            <div className={styles.viewVisual} aria-hidden>
              <div className={styles.miniTable}>
                <div className={styles.miniTableRow}>
                  <div className={styles.bar} style={{ width: "34%" }} />
                  <div className={styles.bar} style={{ width: "18%" }} />
                  <span className={`${styles.chipTiny} ${styles.chipGreen}`}>Low</span>
                </div>
                <div className={styles.miniTableRow}>
                  <div className={styles.bar} style={{ width: "42%" }} />
                  <div className={styles.bar} style={{ width: "12%" }} />
                  <span className={`${styles.chipTiny} ${styles.chipAmber}`}>Medium</span>
                </div>
                <div className={styles.miniTableRow}>
                  <div className={styles.bar} style={{ width: "26%" }} />
                  <div className={styles.bar} style={{ width: "22%" }} />
                  <span className={`${styles.chipTiny} ${styles.chipGreen}`}>Low</span>
                </div>
              </div>
            </div>
            <h3 className={`${styles.serifSmall} ${styles.viewTitle}`}>Food Explorer</h3>
            <p className={styles.viewText}>
              Every food you&apos;ve logged, searchable and filterable by
              caloric-density zone (low &lt;1.5, medium 1.5–4, high &gt;4 kcal/g)
              and macro category.
            </p>
          </div>

          <div className={styles.viewCard}>
            <div className={styles.viewVisual} aria-hidden>
              <div className={styles.axisX} />
              <div className={styles.axisY} />
              <div className={styles.dot} style={{ left: "22%", bottom: "30%", width: 10, height: 10 }} />
              <div className={styles.dot} style={{ left: "38%", bottom: "55%", width: 16, height: 16 }} />
              <div className={styles.dot} style={{ left: "55%", bottom: "40%", width: 8, height: 8 }} />
              <div className={styles.dot} style={{ left: "70%", bottom: "68%", width: 20, height: 20, background: "var(--amber)" }} />
              <div className={styles.dot} style={{ left: "84%", bottom: "26%", width: 7, height: 7 }} />
            </div>
            <h3 className={`${styles.serifSmall} ${styles.viewTitle}`}>Density vs. Portion</h3>
            <p className={styles.viewText}>
              kcal/g against the portion you actually eat — bubble size shows
              frequency, so the real calorie drivers stand out.
            </p>
          </div>

          <div className={styles.viewCard}>
            <div className={styles.viewVisual} aria-hidden>
              <div className={styles.miniBars}>
                <div className={styles.miniBar} style={{ width: "88%" }} />
                <div className={styles.miniBar} style={{ width: "66%" }} />
                <div className={styles.miniBar} style={{ width: "47%" }} />
                <div className={styles.miniBar} style={{ width: "31%" }} />
              </div>
            </div>
            <h3 className={`${styles.serifSmall} ${styles.viewTitle}`}>Monthly Ranking</h3>
            <p className={styles.viewText}>
              Your top 30 foods by total calories. What dominates your intake
              isn&apos;t always the densest — it&apos;s what you eat most.
            </p>
          </div>

          <div className={styles.viewCard}>
            <div className={styles.viewVisual} aria-hidden>
              <div className={styles.miniTree}>
                <div style={{ background: "oklch(0.65 0.17 162 / 0.85)", gridRow: "span 2" }} />
                <div style={{ background: "oklch(0.72 0.14 162 / 0.7)" }} />
                <div style={{ background: "oklch(0.82 0.1 162 / 0.6)" }} />
                <div style={{ background: "oklch(0.88 0.06 162 / 0.55)" }} />
                <div style={{ background: "oklch(0.55 0.15 162 / 0.75)" }} />
              </div>
            </div>
            <h3 className={`${styles.serifSmall} ${styles.viewTitle}`}>Calorie Map</h3>
            <p className={styles.viewText}>
              A treemap of where your calories actually go, sized by each
              food&apos;s share of your total intake.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------- Why ------------------------------ */}
      <section className={`${styles.container} ${styles.section}`}>
        <div className={styles.whyCard}>
          <h2 className={`${styles.display} ${styles.whyH2}`}>
            Your data,
            <br />
            finally working
            <br />
            <em>for you.</em>
          </h2>
          <div>
            <div className={styles.whyBody}>
              <p>
                <strong>You already do the hard part</strong> — logging
                everything you eat in MacroFactor. But that data holds answers
                MacroFactor doesn&apos;t surface on its own: which foods quietly
                drive most of your calories, how calorie-dense your diet really
                is, how your habits shift over time.
              </p>
              <p>
                MacroFactor Explorer picks up where MacroFactor leaves off —
                turning the log you&apos;ve already built into{" "}
                <strong>interactive charts, rankings, and plain-language answers</strong>,
                so every entry teaches you something about how you actually eat.
              </p>
            </div>
            <div className={styles.whyFoot}>
              <span>
                <CheckIcon size={13} />
                Works with your MacroFactor export
              </span>
              <span>
                <CheckIcon size={13} />
                .xlsx or .csv
              </span>
              <span>
                <CheckIcon size={13} />
                Private by default
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ FAQ ------------------------------ */}
      <section id="faq" className={`${styles.container} ${styles.section}`}>
        <div className={styles.sectionHead}>
          <Kicker>FAQ</Kicker>
          <h2 className={`${styles.display} ${styles.sectionH2}`}>
            Totally fair to ask.
          </h2>
        </div>

        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary>
              Why do I need to export a file?
              <span className={styles.plusChip}>
                <PlusIcon size={15} />
              </span>
            </summary>
            <p className={styles.faqAnswer}>
              MacroFactor has no public API, and the unofficial workarounds have
              all been shut down. Exporting your Food Log takes ten seconds
              inside MacroFactor — after that, everything here is automatic.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>
              What formats can I import?
              <span className={styles.plusChip}>
                <PlusIcon size={15} />
              </span>
            </summary>
            <p className={styles.faqAnswer}>
              An Excel (.xlsx) or CSV export of your MacroFactor Food Log. Drop
              it in once and every view fills in.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>
              Is my data private?
              <span className={styles.plusChip}>
                <PlusIcon size={15} />
              </span>
            </summary>
            <p className={styles.faqAnswer}>
              Yes. Your log lives in your own account, protected by row-level
              security — nobody else can see it, and you can delete it any time.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>
              What does it cost?
              <span className={styles.plusChip}>
                <PlusIcon size={15} />
              </span>
            </summary>
            <p className={styles.faqAnswer}>
              Nothing. MacroFactor Explorer is a personal project, free for
              anyone who wants more out of their data.
            </p>
          </details>
        </div>
      </section>

      {/* ----------------------------- Footer ---------------------------- */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerCta}>
            <h2 className={`${styles.display} ${styles.footerH2}`}>
              Ready to see what <em>your log has to say?</em>
            </h2>
            <div className={styles.footerCtas}>
              <AuthLink />
            </div>
          </div>

          <div className={styles.checkGrid}>
            {[
              "Food Explorer",
              "Density vs. Portion",
              "Monthly Ranking",
              "Calorie Map",
              "Trends",
              "AI Chat",
            ].map((label) => (
              <div key={label} className={styles.checkItem}>
                <span className={styles.checkCircle}>
                  <CheckIcon size={11} strokeWidth={3} />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className={styles.footerCols}>
            <span className={styles.brand}>
              <span className={styles.brandMark}>
                <UtensilsIcon size={15} />
              </span>
              <span className={styles.brandName}>MacroFactor Explorer</span>
            </span>
            <div className={styles.footerCol}>
              <h4>Product</h4>
              <SignedOut>
                <Link href="/sign-in">Sign in</Link>
              </SignedOut>
              <SignedIn>
                <Link href="/app">Open app</Link>
              </SignedIn>
              <Link href="#how-it-works">How it works</Link>
              <Link href="#faq">FAQ</Link>
            </div>
            <p className={styles.footerNote}>
              A personal project for people who log. Not affiliated with
              MacroFactor or Stronger By Science.
            </p>
          </div>

          <div className={styles.footerBar}>
            <span>© 2026 MacroFactor Explorer</span>
            <span>Built for people who log.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
