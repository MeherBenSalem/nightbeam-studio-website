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
    if (!user) return jsonError("User not found", 404);

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      line_items: [{ price: env.STRIPE_PRICE_ID_PRO!, quantity: 1 }],
      metadata: { userId: user.id },
      client_reference_id: user.id,
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${env.APP_URL}/community/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/community?checkout=cancelled`,
    };

    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create(sessionParams);
      if (!checkoutSession.url) return jsonError("Checkout session unavailable", 500);
      return NextResponse.json({ url: checkoutSession.url });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      // Surface Stripe config/auth failures clearly (invalid key, live/test mismatch).
      if (/invalid api key|no such price|authentication/i.test(message)) {
        console.error("[stripe checkout]", message);
        return jsonError(
          "Stripe is misconfigured (API key or price). Check STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO.",
          503,
        );
      }
      throw error;
    }
  }, "/api/stripe/checkout", "POST");
}
