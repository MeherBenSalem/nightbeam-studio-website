import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getServerEnv } from "@/lib/config/env";
import { getStripe } from "@/lib/stripe/client";
import { applySubscriptionByCustomerId, applySubscriptionToUser } from "@/lib/stripe/webhook";

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;
        const customerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : checkoutSession.customer?.id;
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id;
        if (userId && customerId) {
          let status: string | null = null;
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            status = subscription.status;
          }
          await applySubscriptionToUser(userId, {
            customerId,
            subscriptionId: subscriptionId ?? null,
            status,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : subscription.status;
        await applySubscriptionByCustomerId(customerId, {
          subscriptionId: subscription.id,
          status,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const subscriptionRef = invoice.parent?.subscription_details?.subscription;
          const subscriptionId =
            typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id ?? null;
          await applySubscriptionByCustomerId(customerId, {
            subscriptionId,
            status: "past_due",
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe webhook]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
