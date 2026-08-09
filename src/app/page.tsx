import { auth } from "@clerk/nextjs/server";
import { Explorer } from "@/components/Explorer";
import { LandingPage } from "@/components/LandingPage";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return <Explorer />;
  }

  return <LandingPage />;
}
