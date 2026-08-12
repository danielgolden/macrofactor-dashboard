import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AtSignIcon, UtensilsIcon } from "lucide-react";

import { lastik } from "@/lib/fonts";
import landing from "@/components/LandingPage.module.css";
import local from "@/components/AuthPage.module.css";

export default function SignUpPage() {
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
            Pick a username. <em>That&rsquo;s it.</em>
          </h1>
          <p className={local.sub}>
            No email, no phone number. Choose a username and a password and your
            log is yours — or continue with Google if you prefer one click.
          </p>
        </div>

        <div className={local.signin}>
          <SignUp
            signInUrl="/sign-in"
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
          <AtSignIcon size={14} />
          We never ask for an email address.
        </p>
      </main>
    </div>
  );
}
