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

interface TemplateColors {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
}

/**
 * Send contact form message via email using Supabase SMTP configuration
 * @param recipientEmail - Loan officer email address
 * @param senderName - Name of the person sending the message
 * @param senderEmail - Email of the person sending the message
 * @param senderPhone - Phone number of the person sending the message
 * @param message - Message content
 * @param templateColors - Optional template colors for email styling
 * @returns Promise with success status and message
 */
export async function sendContactEmail(
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  senderPhone: string,
  message: string,
  templateColors?: TemplateColors
): Promise<{ success: boolean; message: string }> {
  try {
    const primaryColor = templateColors?.primary || '#ec4899';
    const secondaryColor = templateColors?.secondary || '#01bcc6';
    const backgroundColor = templateColors?.background || '#ffffff';
    const textColor = templateColors?.text || '#111827';
    const textSecondaryColor = templateColors?.textSecondary || '#6b7280';
    
    const emailSubject = 'New Contact Form Message';
    
    // Create beautiful HTML email template with theme colors
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Message</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${textColor}; background-color: #f3f4f6; margin: 0; padding: 0;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${backgroundColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                        New Contact Form Message
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                        You have received a new message from your profile page
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: ${textColor}; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">
                        Contact Information
                      </h2>
                      
                      <!-- Sender Details -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: ${textColor}; display: inline-block; min-width: 120px;">Email:</strong>
                            <span style="color: ${textSecondaryColor};">
                              <a href="mailto:${senderEmail}" style="color: ${primaryColor}; text-decoration: none;">
                                ${senderEmail}
                              </a>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: ${textColor}; display: inline-block; min-width: 120px;">Phone:</strong>
                            <span style="color: ${textSecondaryColor};">
                              <a href="tel:${senderPhone}" style="color: ${primaryColor}; text-decoration: none;">
                                ${senderPhone}
                              </a>
                            </span>
                          </td>
                        </tr>
                        ${senderName ? `
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: ${textColor}; display: inline-block; min-width: 120px;">Name:</strong>
                            <span style="color: ${textSecondaryColor};">
                              ${senderName}
                            </span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                      
                      <!-- Message -->
                      <h2 style="color: ${textColor}; margin: 30px 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px;">
                        Message
                      </h2>
                      <div style="background-color: #f9fafb; border-left: 4px solid ${primaryColor}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="color: ${textColor}; margin: 0; white-space: pre-wrap; line-height: 1.8;">
                          ${message.replace(/\n/g, '<br>')}
                        </p>
                      </div>
                      
                      <!-- Quick Reply Button -->
                      <table role="presentation" style="width: 100%; margin-top: 30px;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="mailto:${senderEmail}?subject=Re: Contact Form Inquiry" 
                               style="display: inline-block; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Reply to ${senderEmail.split('@')[0]}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: ${textSecondaryColor}; margin: 0; font-size: 12px;">
                        This message was sent through your public profile contact form.<br>
                        Sent at ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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

    if (smtpHost && smtpUser && smtpPass) {
      // Use SMTP (Supabase's configured SMTP)
      console.log('📧 Sending contact email via SMTP to:', recipientEmail);
      
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
        to: recipientEmail,
        replyTo: senderEmail, // Set reply-to so loan officer can reply directly
        subject: emailSubject,
        html: emailBody,
      });

      console.log('✅ Contact email sent successfully via SMTP. Message ID:', info.messageId);
      return {
        success: true,
        message: 'Contact message sent successfully',
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
        console.log(`[DEV MODE] Contact Email for: ${recipientEmail}`);
        console.log(`From: ${senderName} <${senderEmail}>`);
        console.log(`Phone: ${senderPhone}`);
        console.log(`Message: ${message}`);
        console.log(`========================================\n`);
        return {
          success: true,
          message: 'Contact message sent (check console in dev mode)',
        };
      }

      // In production, require SMTP configuration
      throw new Error(
        `Email service not configured. Please set ${missingConfig.join(', ')} environment variables in Supabase Dashboard → Authentication → SMTP Settings, or set them as environment variables.`
      );
    }
  } catch (error) {
    console.error('Error sending contact email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send contact email',
    };
  }
}

