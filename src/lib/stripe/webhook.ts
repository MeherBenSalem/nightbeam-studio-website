import "server-only";
import { getRepo } from "@/lib/db/repo";
import { isProStatus } from "@/lib/stripe/client";

export function mapSubscriptionToPro(status: string | null | undefined): boolean {
  return isProStatus(status);
}

export async function applySubscriptionToUser(
  userId: string,
  input: { customerId: string; subscriptionId: string | null; status: string | null },
): Promise<void> {
  const repo = await getRepo();
  const isPro = mapSubscriptionToPro(input.status);
  const patch: {
    stripeCustomerId: string;
    stripeSubscriptionId?: string | null;
    stripeSubscriptionStatus: string | null;
    isPro: boolean;
  } = {
    stripeCustomerId: input.customerId,
    stripeSubscriptionStatus: input.status,
    isPro,
  };
  // Preserve existing subscription id when an event omits it (e.g. some invoice.payment_failed shapes).
  if (input.subscriptionId) {
    patch.stripeSubscriptionId = input.subscriptionId;
  }
  await repo.updateUser(userId, patch);
}

export async function applySubscriptionByCustomerId(
  customerId: string,
  input: { subscriptionId: string | null; status: string | null },
): Promise<boolean> {
  const repo = await getRepo();
  const user = await repo.getUserByStripeCustomerId(customerId);
  if (!user) return false;
  await applySubscriptionToUser(user.id, {
    customerId,
    subscriptionId: input.subscriptionId,
    status: input.status,
  });
  return true;
}
