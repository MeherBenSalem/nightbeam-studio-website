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

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface EmailShellInput {
  title: string;
  paragraphs: string[]; // raw text; rendered as <p> blocks
  extraHtml?: string; // raw HTML appended after the paragraphs (digest list)
  ctaUrl?: string;
  ctaLabel?: string;
  footnote?: string;
  fallbackNote?: string;
}

/**
 * NightBeam pixel theme — monochrome, sharp, table-based for mail clients.
 * No external images, no webfonts, no rounded "AI template" styling.
 */
export const emailShell = ({ title, paragraphs, extraHtml, ctaUrl, ctaLabel, footnote, fallbackNote }: EmailShellInput) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070f;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0d0d0d;border:2px solid #2e2e2e;border-collapse:collapse;">

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px 0;">
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:bold;color:#ffffff;letter-spacing:3px;">NIGHTBEAM<span style="color:#4a4a4a;">//</span>STUDIO</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#4a4a4a;letter-spacing:2px;margin-top:5px;">MINECRAFT MODS &amp; WORLDS</div>
          </td>
        </tr>

        <!-- Rule -->
        <tr>
          <td style="padding:18px 28px 0;"><div style="border-top:1px dashed #2e2e2e;"></div></td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:22px 28px 0;">
            <h1 style="margin:0;font-family:'Courier New',Courier,monospace;font-size:19px;font-weight:bold;color:#ffffff;letter-spacing:2px;line-height:1.35;">${escapeHtml(title)}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:14px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#a3a3a3;">
            ${paragraphs.map((paragraph) => `<p style="margin:0 0 10px 0;">${escapeHtml(paragraph)}</p>`).join("")}
            ${extraHtml ?? ""}
          </td>
        </tr>

        ${ctaUrl && ctaLabel
          ? `
        <!-- CTA -->
        <tr>
          <td style="padding:20px 28px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border:2px solid #ffffff;box-shadow:4px 4px 0 #2e2e2e;">
              <tr>
                <td style="background:#ffffff;">
                  <a href="${ctaUrl}" style="display:inline-block;padding:12px 22px;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:bold;letter-spacing:2px;color:#000000;text-decoration:none;">&gt; ${escapeHtml(ctaLabel)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Fallback link -->
        <tr>
          <td style="padding:14px 28px 0;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.7;color:#4a4a4a;">
            Button not working? Open this link:<br/>
            <a href="${ctaUrl}" style="color:#6b6b6b;word-break:break-all;">${ctaUrl}</a>
          </td>
        </tr>`
          : ""}

        <!-- Footnotes -->
        ${footnote
          ? `
        <tr>
          <td style="padding:18px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5a5a5a;">
            ${escapeHtml(footnote)}
          </td>
        </tr>`
          : ""}

        <!-- Footer -->
        <tr>
          <td style="padding:24px 28px;">
            <div style="border-top:1px dashed #2e2e2e;padding-top:14px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:1px;line-height:1.8;color:#3d3d3d;">
              NIGHTBEAM STUDIO &middot; NIGHTBEAM.DEV<br/>
              ${escapeHtml(fallbackNote ?? "You received this email because an action was requested with this address on nightbeam.dev.")}
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

export async function sendVerificationEmail(to: string, token: string): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const env = getServerEnv();
  const url = `${env.APP_URL}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  return sendMail({
    to,
    subject: "Verify your NightBeam Studio account",
    text: `Verify your email address:\n${url}`,
    html: emailShell({
      title: "VERIFY YOUR EMAIL",
      paragraphs: [
        "Welcome to NightBeam Studio. One click and your account is ready — favorites, follows, downloads and notifications, all in one place.",
      ],
      ctaUrl: url,
      ctaLabel: "VERIFY EMAIL",
      footnote: "The verification link expires in 24 hours. If you didn't create an account with NightBeam, you can ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const env = getServerEnv();
  const url = `${env.APP_URL}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  return sendMail({
    to,
    subject: "Reset your NightBeam Studio password",
    text: `Reset your password:\n${url}`,
    html: emailShell({
      title: "RESET YOUR PASSWORD",
      paragraphs: [
        "You asked to reset your NightBeam Studio password. Pick a new one with the button below.",
      ],
      ctaUrl: url,
      ctaLabel: "RESET PASSWORD",
      footnote: "The link expires in 1 hour. If you didn't request this, ignore the email — your password stays unchanged.",
    }),
  });
}

export async function sendDigestEmail(to: string, items: { title: string; body: string; link?: string }[]): Promise<{ sent: boolean; mode: "smtp" | "logged" }> {
  const list = items
    .map(
      (item) =>
        `<li style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#a3a3a3;"><strong style="display:block;font-family:'Courier New',Courier,monospace;font-size:12px;color:#ffffff;letter-spacing:1px;margin-bottom:3px;">${escapeHtml(item.title)}</strong>${escapeHtml(item.body)}</li>`,
    )
    .join("");
  const listHtml = list ? `<ul style="margin:14px 0 0 0;padding-left:18px;">${list}</ul>` : "";
  return sendMail({
    to,
    subject: "Your NightBeam Studio digest",
    text: items.map((i) => `${i.title}\n${i.body}`).join("\n\n"),
    html: emailShell({
      title: "YOUR DIGEST",
      paragraphs: [`What's been happening while you were away:`],
      footnote: `You're getting this digest because you have updates on nightbeam.dev.`,
      extraHtml: listHtml,
    }),
  });
}
