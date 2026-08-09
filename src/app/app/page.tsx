"use client";
import dynamic from "next/dynamic";

const Explorer = dynamic(
  () => import("@/components/Explorer").then((m) => ({ default: m.Explorer })),
  { ssr: false },
);

export default function Home() {
  return <Explorer />;
}
