import nodemailer from 'nodemailer';

/**
 * Send OTP verification code via email using Supabase SMTP configuration
 * @param email - Recipient email address
 * @param code - 6-digit verification code
 * @returns Promise with success status and message
 */
export async function sendOTPEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const emailSubject = 'Your Mortgage Rate Search Verification Code';
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
            <h1 style="color: #005b7c; margin-bottom: 20px;">Verification Code</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Thank you for using our mortgage rate search. Please use the verification code below to continue:
            </p>
            <div style="background-color: #ffffff; border: 2px solid #01bcc6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #005b7c; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Get SMTP configuration (matching Supabase SMTP settings)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSenderName = process.env.SMTP_SENDER_NAME || 'Mortgage Rate Search';
    const smtpSenderEmail = process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER;

    console.log('📧 Email service configuration check:', {
      hasHost: !!smtpHost,
      hasUser: !!smtpUser,
      hasPass: !!smtpPass,
      port: smtpPort,
      senderEmail: smtpSenderEmail,
      nodeEnv: process.env.NODE_ENV
    });

    if (smtpHost && smtpUser && smtpPass) {
      // Use SMTP (Supabase's configured SMTP)
      console.log('📧 Sending email via SMTP to:', email);
      
      // Create transporter using Supabase SMTP settings
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: smtpSenderName ? `"${smtpSenderName}" <${smtpSenderEmail}>` : smtpSenderEmail,
        to: email,
        subject: emailSubject,
        html: emailBody,
      });

      console.log('✅ Email sent successfully via SMTP. Message ID:', info.messageId);
      return {
        success: true,
        message: 'Verification code sent successfully',
      };
    } else {
      // Fallback for development mode when SMTP is not configured
      const missingConfig = [];
      if (!smtpHost) missingConfig.push('SMTP_HOST');
      if (!smtpUser) missingConfig.push('SMTP_USER');
      if (!smtpPass) missingConfig.push('SMTP_PASS');
      
      console.warn(`⚠️ Email service not fully configured. Missing: ${missingConfig.join(', ')}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n========================================`);
        console.log(`[DEV MODE] OTP Email for: ${email}`);
        console.log(`Verification Code: ${code}`);
        console.log(`Code expires in: 5 minutes`);
        console.log(`========================================\n`);
        return {
          success: true,
          message: 'Verification code sent (check console in dev mode)',
        };
      }

      // In production, require SMTP configuration
      throw new Error(
        `Email service not configured. Please set ${missingConfig.join(', ')} environment variables in Supabase Dashboard → Authentication → SMTP Settings, or set them as environment variables.`
      );
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send verification email',
    };
  }
}

