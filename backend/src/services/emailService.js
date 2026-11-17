import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export async function sendPasswordResetEmail(email, resetUrl) {
  await transporter.sendMail({
    from: `"Candidate Profile Agent" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    text: `You requested a password reset. Open this link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 15 minutes and can only be used once.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}
