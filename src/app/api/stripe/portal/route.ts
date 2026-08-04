import { NextResponse } from "next/server";
import { jsonError, withErrorHandling } from "@/lib/api/helpers";
import { auth } from "@/lib/auth/auth";
import { getServerEnv, isStripeConfigured } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
  return withErrorHandling(async () => {
    const session = await auth();
    if (!session?.user?.id) return jsonError("Sign in required", 401);
    if (!isStripeConfigured()) return jsonError("Stripe is not configured", 503);

    const stripe = getStripe();
    if (!stripe) return jsonError("Stripe is not configured", 503);

    const env = getServerEnv();
    const repo = await getRepo();
    const user = await repo.getUserById(session.user.id);
    if (!user?.stripeCustomerId) return jsonError("No billing account", 400);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.APP_URL}/community`,
    });
    if (!portalSession.url) return jsonError("Portal session unavailable", 500);
    return NextResponse.json({ url: portalSession.url });
  }, "/api/stripe/portal", "POST");
}
