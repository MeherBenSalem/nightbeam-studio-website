import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withErrorHandling } from "@/lib/api/helpers";
import { auth } from "@/lib/auth/auth";
import { getServerEnv, isDonationsConfigured } from "@/lib/config/env";
import { getStripe } from "@/lib/stripe/client";

const bodySchema = z.object({
  amount: z.number().min(1).max(10000).optional(),
  mode: z.enum(["payment", "subscription"]),
  priceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    if (!isDonationsConfigured()) return jsonError("Donations are not configured", 503);

    const stripe = getStripe();
    if (!stripe) return jsonError("Stripe is not configured", 503);

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request body", 400);

    const { amount, mode, priceId } = parsed.data;
    const env = getServerEnv();

    if (mode === "payment" && !amount) {
      return jsonError("Amount is required for one-time donations", 400);
    }
    if (mode === "subscription" && !priceId) {
      return jsonError("Price ID is required for recurring donations", 400);
    }

    const allowedPriceIds = [
      env.STRIPE_PRICE_ID_DONATE_3,
      env.STRIPE_PRICE_ID_DONATE_5,
      env.STRIPE_PRICE_ID_DONATE_10,
    ].filter(Boolean);

    if (mode === "subscription" && !allowedPriceIds.includes(priceId!)) {
      return jsonError("Invalid price ID", 400);
    }

    const session = await auth();

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      success_url: `${env.APP_URL}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/support?checkout=cancelled`,
      line_items:
        mode === "payment"
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: "NightBeam Studio Donation" },
                  unit_amount: amount! * 100,
                },
                quantity: 1,
              },
            ]
          : [{ price: priceId!, quantity: 1 }],
    };

    if (session?.user?.email) {
      sessionParams.customer_email = session.user.email;
    }

    try {
      const checkoutSession = await stripe.checkout.sessions.create(sessionParams);
      if (!checkoutSession.url) return jsonError("Checkout session unavailable", 500);
      return NextResponse.json({ url: checkoutSession.url });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      if (/invalid api key|no such price|authentication/i.test(message)) {
        console.error("[stripe donate]", message);
        return jsonError("Stripe is misconfigured. Check your API keys.", 503);
      }
      throw error;
    }
  }, "/api/stripe/donate", "POST");
}
