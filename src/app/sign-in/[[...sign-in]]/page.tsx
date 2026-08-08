import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          MacroFactor Explorer
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Lo que comes,
          <br />
          <em className="italic text-muted-foreground">en números.</em>
        </h1>
      </div>
      <SignIn />
    </div>
  );
}
