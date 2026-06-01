import { Resend } from "resend";

export async function sendReminderEmail(to: string, streak: number) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "StratOS <onboarding@resend.dev>",
    to,
    subject: `No action yet today — streak day ${streak}`,
    html: `
      <div style="font-family: monospace; background: #09090b; color: #fff; padding: 32px; max-width: 480px;">
        <p style="color: #a3e635; font-size: 12px; letter-spacing: 4px; margin: 0 0 16px;">STRATOS</p>
        <h1 style="font-size: 20px; margin: 0 0 16px;">Execute one action before the day ends.</h1>
        <p style="color: #52525b; font-size: 14px; margin: 0 0 24px;">Current streak: ${streak} days</p>
        <a href="https://stratos-os.vercel.app" style="display: inline-block; border: 1px solid #a3e635; color: #a3e635; padding: 12px 24px; font-size: 14px; text-decoration: none;">
          Execute now →
        </a>
      </div>
    `,
  });
}
