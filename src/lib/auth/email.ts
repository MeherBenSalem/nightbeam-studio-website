import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv, isSmtpConfigured } from "@/lib/config/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (transporter) return transporter;
  const env = getServerEnv();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

interface MailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(input: MailInput): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const transport = getTransporter();
  const env = getServerEnv();
  if (!transport) {
    console.info(`[email] SMTP not configured — email not sent to ${input.to} (${input.subject})`);
    return { sent: false, mode: "logged" };
  }
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return { sent: true, mode: "smtp" };
}

const emailShell = (title: string, body: string, ctaUrl?: string, ctaLabel?: string) => `
  <div style="background:#05070f;color:#e2e8f0;font-family:Inter,Arial,sans-serif;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#0b1020;border:1px solid #1e293b;border-radius:12px;padding:32px">
      <div style="font-family:'Press Start 2P',monospace;color:#22d3ee;font-size:13px;margin-bottom:24px">NIGHTBEAM STUDIO</div>
      <h1 style="color:#f8fafc;font-size:20px;margin:0 0 12px">${title}</h1>
      <div style="color:#94a3b8;line-height:1.6;font-size:14px;white-space:pre-wrap">${body}</div>
      ${ctaUrl && ctaLabel ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;background:#7c3aed;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px">${ctaLabel}</a>` : ""}
      <p style="color:#475569;font-size:12px;margin-top:28px">If you didn't request this, you can safely ignore it.</p>
    </div>
  </div>
`;

export async function sendVerificationEmail(to: string, token: string): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const env = getServerEnv();
  const url = `${env.APP_URL}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  return sendMail({
    to,
    subject: "Verify your NightBeam Studio account",
    text: `Verify your email address:\n${url}`,
    html: emailShell("Verify your email address", "Welcome to NightBeam Studio. Click below to confirm your email and finish creating your account.", url, "Verify email"),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const env = getServerEnv();
  const url = `${env.APP_URL}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  return sendMail({
    to,
    subject: "Reset your NightBeam Studio password",
    text: `Reset your password:\n${url}`,
    html: emailShell("Reset your password", "Use the link below to choose a new password. The link expires in 1 hour.", url, "Reset password"),
  });
}

export async function sendDigestEmail(to: string, items: { title: string; body: string; link?: string }[]): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const list = items.map((i) => `<li style="margin-bottom:10px"><strong style="color:#e2e8f0">${i.title}</strong><br/><span style="color:#94a3b8">${i.body}</span></li>`).join("");
  return sendMail({
    to,
    subject: "Your NightBeam Studio digest",
    text: items.map((i) => `${i.title}\n${i.body}`).join("\n\n"),
    html: emailShell("Your weekly digest", `<ul style="padding-left:18px;margin:0">${list}</ul>`),
  });
}
