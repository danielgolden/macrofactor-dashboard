import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { LogInIcon, UtensilsIcon } from "lucide-react";

import { lastik } from "@/lib/fonts";
import landing from "@/components/LandingPage.module.css";
import local from "./SignInPage.module.css";

export default function SignInPage() {
  return (
    <div className={`${landing.root} ${lastik.variable} ${local.page}`}>
      <header className={local.header}>
        <Link href="/" className={landing.brand}>
          <span className={landing.brandMark}>
            <UtensilsIcon size={15} />
          </span>
          <span className={landing.brandName}>MacroFactor Explorer</span>
        </Link>
      </header>

      <main className={local.main}>
        <div className={local.glow} aria-hidden />

        <div className={local.copy}>
          <span className={landing.kicker}>A companion for MacroFactor</span>
          <h1 className={`${landing.display} ${local.h1}`}>
            Your food log has <em>more to tell you.</em>
          </h1>
          <p className={local.sub}>
            Sign in to pick up where MacroFactor leaves off — the patterns
            behind how you eat, in charts and plain language.
          </p>
        </div>

        <div className={local.signin}>
          <SignIn
            forceRedirectUrl="/app"
            appearance={{
              variables: {
                colorPrimary: "rgb(33, 158, 188)",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>

        <p className={local.note}>
          <LogInIcon size={14} />
          One click with Google — no password.
        </p>
      </main>
    </div>
  );
}
