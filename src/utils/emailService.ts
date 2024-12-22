import nodemailer from 'nodemailer';
import { config } from '../config/config';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: true,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  await transporter.sendMail({
    from: config.SMTP_USER,
    to: email,
    subject: 'Verify your email',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `
  });
};

export const sendResetPasswordEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: config.SMTP_USER,
    to: email,
    subject: 'Reset Password OTP',
    html: `
      <h1>Reset Password</h1>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `
  });
}; 