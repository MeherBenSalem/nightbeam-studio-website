import type { OAuthConfig } from "next-auth/providers";

export interface BuiltByBitProfile {
  user_id: number | string;
  username: string;
  avatar_url?: string | null;
}

/**
 * BuiltByBit OAuth2 (authorization code).
 * Requires Members scope on the API token for /v2/members/self.
 * Set OAuth redirect URI to `{APP_URL}/api/auth/callback/builtbybit`.
 */
export function BuiltByBitProvider(): OAuthConfig<BuiltByBitProfile> {
  return {
    id: "builtbybit",
    name: "BuiltByBit",
    type: "oauth",
    clientId: process.env.BUILTBYBIT_CLIENT_ID ?? process.env.AUTH_BUILTBYBIT_ID ?? "",
    clientSecret: process.env.BUILTBYBIT_CLIENT_SECRET ?? process.env.AUTH_BUILTBYBIT_SECRET ?? "",
    authorization: {
      url: "https://builtbybit.com/account/external/authorize",
      // Scope names as shown in the BBB token UI (space-separated).
      params: { scope: "Members Resources/Buyer" },
    },
    token: "https://api.builtbybit.com/oauth2/token",
    client: {
      token_endpoint_auth_method: "client_secret_basic",
    },
    userinfo: {
      url: "https://api.builtbybit.com/v2/members/self",
      async request({ tokens }: { tokens: { access_token?: string } }) {
        const response = await fetch("https://api.builtbybit.com/v2/members/self", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`BuiltByBit userinfo failed (${response.status})`);
        }
        const payload = (await response.json()) as { data?: BuiltByBitProfile } | BuiltByBitProfile;
        if (payload && typeof payload === "object" && "data" in payload && payload.data) {
          return payload.data;
        }
        return payload as BuiltByBitProfile;
      },
    },
    profile(profile) {
      const id = String(profile.user_id);
      return {
        id,
        name: profile.username,
        // Auth.js / linking works more reliably with an email; BBB does not provide one.
        email: `${id}@users.builtbybit.local`,
        image: profile.avatar_url ?? undefined,
      };
    },
  };
}
