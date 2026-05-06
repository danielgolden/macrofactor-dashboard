import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);
const ALLOWED_EMAIL = "danielgolden90@gmail.com";

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { userId } = await auth.protect();

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;

  if (email !== ALLOWED_EMAIL) {
    const signOutUrl = new URL("/sign-in", request.url);
    signOutUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(signOutUrl);
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
