import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(to: string, streak: number) {
  await resend.emails.send({
    from: "StratOS <noreply@stratos-os.com>",
    to,
    subject: `오늘 아직 액션 안 하셨어요 — 스트릭 ${streak}일째`,
    html: `
      <div style="font-family: monospace; background: #09090b; color: #fff; padding: 32px; max-width: 480px;">
        <p style="color: #a3e635; font-size: 12px; letter-spacing: 4px; margin: 0 0 16px;">STRATOS</p>
        <h1 style="font-size: 20px; margin: 0 0 16px;">오늘 하루가 끝나기 전에<br/>액션 하나만 실행해보세요.</h1>
        <p style="color: #52525b; font-size: 14px; margin: 0 0 24px;">현재 스트릭: ${streak}일</p>
        <a href="https://stratos-os.vercel.app" style="display: inline-block; border: 1px solid #a3e635; color: #a3e635; padding: 12px 24px; font-size: 14px; text-decoration: none;">
          지금 실행하기 →
        </a>
      </div>
    `,
  });
}
