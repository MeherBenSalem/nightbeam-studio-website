import "server-only";
import Stripe from "stripe";
import { getServerEnv, isStripeConfigured } from "@/lib/config/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!stripeClient) {
    const env = getServerEnv();
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export function isProStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
