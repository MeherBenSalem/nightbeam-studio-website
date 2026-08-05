import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { isBuiltByBitOAuthConfigured, isOAuthConfigured } from "@/lib/config/env";

export function LoginOAuthButtons({ callbackUrl }: { callbackUrl?: string }) {
  const providers: string[] = [];
  if (isBuiltByBitOAuthConfigured()) providers.push("builtbybit");
  if (isOAuthConfigured("google")) providers.push("google");
  if (isOAuthConfigured("discord")) providers.push("discord");
  if (isOAuthConfigured("github")) providers.push("github");
  return <OAuthButtons providers={providers} callbackUrl={callbackUrl} />;
}
