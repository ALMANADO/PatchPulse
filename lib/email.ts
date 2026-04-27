import nodemailer from 'nodemailer';
import { Update } from '@/types';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
});

const C = {
  bg: '#05050a',
  card: '#0f0f17',
  cardHeader: '#13132e',
  cardBorder: '#1a1a24',
  blue: '#2563eb',
  text: '#ffffff',
  white: '#ffffff',
  muted: '#94a3b8',
  dim: '#475569',
  success: '#10b981',
};

function emailWrapper(content: string, unsubscribeUrl?: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family: Arial, sans-serif;">
  <table width="100%" bgcolor="${C.bg}" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 10px;">
      <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:20px;">
          <table width="100%"><tr>
            <td align="left"><span style="font-size:20px;font-weight:bold;color:${C.text};">PatchPulse</span></td>
            <td align="right"><span style="font-size:11px;font-weight:600;color:${C.dim};text-transform:uppercase;letter-spacing:1px;">Oracle Patch Monitor</span></td>
          </tr></table>
        </td></tr>
        <tr><td bgcolor="${C.card}" style="border:1px solid ${C.cardBorder};border-radius:12px;overflow:hidden;">
          ${content}
        </td></tr>
        <tr><td style="padding-top:30px;text-align:center;">
          <p style="font-size:12px;color:${C.dim};margin:0;">You're receiving this because you subscribed to PatchPulse alerts.</p>
          ${unsubscribeUrl ? `<p style="margin:10px 0 0;font-size:12px;"><a href="${unsubscribeUrl}" style="color:${C.dim};text-decoration:underline;">Unsubscribe</a></p>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendWelcomeEmail(userEmail: string, recentUpdates: Update[], domain: string) {
  const dashboardUrl = `${domain}/dashboard`;
  const unsubscribeUrl = `${domain}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  const html = `
    <div style="background-color:${C.cardHeader};padding:40px 30px;text-align:center;">
      <div style="font-size:40px;margin-bottom:16px;">👋</div>
      <h1 style="margin:0;font-size:28px;font-weight:bold;color:${C.text};">Welcome to PatchPulse</h1>
      <p style="margin:12px auto 0;max-width:420px;font-size:15px;color:${C.muted};line-height:1.6;">
        You're all set! We'll send you instant email alerts the moment a new Oracle patch drops — so you never miss a release.
      </p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;font-size:11px;font-weight:bold;color:${C.dim};text-transform:uppercase;letter-spacing:1.5px;">WHAT TO EXPECT</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="30" valign="top" style="font-size:20px;">⚡</td>
          <td style="padding-bottom:24px;padding-left:16px;">
            <strong style="color:${C.text};font-size:15px;display:block;margin-bottom:4px;">Instant alerts</strong>
            <span style="color:${C.muted};font-size:13px;line-height:1.5;">Get notified the moment a new OIC or Fusion patch is detected</span>
          </td>
        </tr>
        <tr>
          <td width="30" valign="top" style="font-size:20px;">📊</td>
          <td style="padding-bottom:24px;padding-left:16px;">
            <strong style="color:${C.text};font-size:15px;display:block;margin-bottom:4px;">Full summaries</strong>
            <span style="color:${C.muted};font-size:13px;line-height:1.5;">Every email links to a detailed summary page with release notes & docs</span>
          </td>
        </tr>
        <tr>
          <td width="30" valign="top" style="font-size:20px;">🎛️</td>
          <td style="padding-bottom:32px;padding-left:16px;">
            <strong style="color:${C.text};font-size:15px;display:block;margin-bottom:4px;">Your preferences</strong>
            <span style="color:${C.muted};font-size:13px;line-height:1.5;">Control which products and update types you receive alerts for</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" bgcolor="${C.blue}" style="border-radius:12px;"><a href="${dashboardUrl}" style="display:inline-block;padding:16px 24px;color:${C.white};text-decoration:none;font-weight:bold;font-size:15px;">→ Go to your dashboard</a></td></tr>
      </table>
    </div>`;

  await transporter.sendMail({
    from: '"PatchPulse" <patchpulsesupport2@gmail.com>',
    to: userEmail,
    subject: '👋 Welcome to PatchPulse!',
    html: emailWrapper(html, unsubscribeUrl),
  });
}

export async function sendUpdateEmail(userEmail: string, update: Update, domain: string) {
  const summaryUrl = `${domain}/updates/${update.id}`;
  const unsubscribeUrl = `${domain}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  const html = `
    <div style="background-color:${C.cardHeader};padding:30px;">
      <span style="display:inline-block;background-color:#1e293b;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:bold;color:${C.success};text-transform:uppercase;">${update.product} Update</span>
      <h1 style="margin:12px 0 0;font-size:22px;color:${C.text};">${update.title}</h1>
    </div>
    <div style="padding:30px;">
      <p style="color:${C.muted};font-size:14px;line-height:1.6;">${update.description}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr><td align="center" bgcolor="${C.blue}" style="border-radius:8px;"><a href="${summaryUrl}" style="display:inline-block;padding:14px 20px;color:${C.white};text-decoration:none;font-weight:bold;">View Summary</a></td></tr>
      </table>
    </div>`;

  await transporter.sendMail({
    from: '"PatchPulse" <patchpulsesupport2@gmail.com>',
    to: userEmail,
    subject: `🔔 New ${update.product} Update: ${update.title}`,
    html: emailWrapper(html, unsubscribeUrl),
  });
}

export async function sendResetEmail(userEmail: string, resetUrl: string) {
  const html = `
    <div style="padding:48px 40px; text-align:center;">
      <h1 style="color:${C.text};font-size:22px;font-weight:bold;">Reset your password</h1>
      <p style="color:${C.muted};font-size:14px;margin-bottom:32px;">This link expires in 1 hour.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" bgcolor="${C.blue}" style="border-radius:8px;"><a href="${resetUrl}" style="display:inline-block;padding:15px 25px;color:${C.white};text-decoration:none;font-weight:bold;">Reset Password</a></td></tr>
      </table>
    </div>`;

  await transporter.sendMail({
    from: '"PatchPulse" <patchpulsesupport2@gmail.com>',
    to: userEmail,
    subject: 'Reset your PatchPulse password',
    html: emailWrapper(html),
  });
}
