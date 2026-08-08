"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SignOutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Cerrando sesión…
    </div>
  );
}
