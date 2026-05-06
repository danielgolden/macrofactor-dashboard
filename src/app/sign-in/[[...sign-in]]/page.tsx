import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#faf6ed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      padding: 24,
    }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, color: "#a8702c", textTransform: "uppercase", marginBottom: 12 }}>
          MacroFactor Explorer
        </p>
        <h1 style={{ fontFamily: '"Fraunces", serif', fontWeight: 800, fontSize: "clamp(32px, 6vw, 56px)", color: "#2a1f1a", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
          Lo que comes,<br />
          <em style={{ color: "#a83c2a", fontStyle: "italic" }}>en números.</em>
        </h1>
      </div>
      <SignIn />
    </div>
  );
}
