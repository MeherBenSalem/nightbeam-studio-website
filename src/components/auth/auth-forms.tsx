"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction, verifyEmailAction, type ActionState } from "@/lib/auth/actions";
import { Checkbox, Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/auth/password-strength";
import { Turnstile } from "@/components/auth/turnstile";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-red-400">{errors[0]}</p>;
}

function FormNotice({ state }: { state: ActionState }) {
  if (!state.message && !state.error) return null;
  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${state.error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-green-500/40 bg-green-500/10 text-green-300"}`}>
      {state.error ?? state.message}
    </p>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string; embedded?: boolean }) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <Checkbox name="rememberMe" defaultChecked={false} />
          Remember me for 30 days
        </label>
        <Link href="/auth/forgot" className="text-sm text-pixel-cyan hover:underline">
          Forgot password?
        </Link>
      </div>
      <Turnstile onToken={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <FormNotice state={state} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-400">
        New here?{" "}
        <Link href="/auth/register" className="text-pixel-cyan hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, formAction, pending] = useActionState(registerAction, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="register-name">Display name</Label>
        <Input id="register-name" name="name" autoComplete="nickname" required maxLength={48} />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input id="register-email" name="email" type="email" autoComplete="email" required />
        <p className="mt-1 text-[11px] text-slate-500">We&apos;ll send a verification link — you must verify before signing in.</p>
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthMeter password={password} />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="register-confirm">Confirm password</Label>
        <Input
          id="register-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <FieldError errors={state.fieldErrors?.confirmPassword} />
      </div>
      <div>
        <label className="flex items-start gap-2 text-xs text-slate-300">
          <input type="checkbox" name="acceptTerms" value="on" required className="mt-0.5 accent-pixel-cyan" />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="text-pixel-cyan hover:underline">
              Privacy Policy
            </Link>{" "}
            and the site&apos;s community rules.
          </span>
        </label>
        <FieldError errors={state.fieldErrors?.acceptTerms} />
      </div>
      <Turnstile onToken={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <FormNotice state={state} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-pixel-cyan hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" name="email" type="email" autoComplete="email" required />
      </div>
      <Turnstile onToken={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <FormNotice state={state} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-slate-400">
        <Link href="/auth/login" className="text-pixel-cyan hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <div>
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthMeter password={password} />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <FormNotice state={state} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function VerifyForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useActionState(verifyEmailAction, {});
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <FormNotice state={state} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Verifying…" : "Verify email"}
      </Button>
      {state.ok ? (
        <p className="text-center text-sm text-slate-400">
          <Link href="/auth/login" className="text-pixel-cyan hover:underline">
            Continue to sign in
          </Link>
        </p>
      ) : null}
    </form>
  );
}
