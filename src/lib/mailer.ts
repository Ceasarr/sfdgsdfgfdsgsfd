import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOtpEmail(to: string, code: string): Promise<void> {
    const from = process.env.SMTP_FROM || "Enotik.net <noreply@enotik.net>";

    await transporter.sendMail({
        from,
        to,
        subject: `${code} — код подтверждения Enotik.net`,
        html: `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Enotik.net</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Подтверждение регистрации</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
              Здравствуйте! Для завершения регистрации введите код:
            </p>
            <!-- OTP Code -->
            <div style="margin:24px 0;text-align:center;">
              <div style="display:inline-block;background:#f3f0ff;border:2px solid #7c3aed;border-radius:12px;padding:16px 32px;letter-spacing:8px;font-size:32px;font-weight:800;color:#7c3aed;">
                ${code}
              </div>
            </div>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-align:center;">
              Код действителен <strong>15 минут</strong>.
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
              Если вы не запрашивали этот код — просто проигнорируйте письмо.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              &copy; Enotik.net — Магазин Robux и игровых предметов
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
        `.trim(),
    });
}
