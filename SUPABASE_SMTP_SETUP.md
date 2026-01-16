# Supabase SMTP Setup Guide for OTP Emails

This guide explains how to configure SMTP in Supabase and use it for sending OTP verification emails.

## Overview

The email service now uses Supabase's SMTP configuration (via nodemailer) instead of Resend API. This means you can use the same email provider that Supabase uses for authentication emails.

## Step 1: Configure SMTP in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Authentication** → **SMTP Settings**
4. Enable **Custom SMTP**
5. Fill in your SMTP provider details:

### For Resend (if using Resend as SMTP provider):
- **Host**: `smtp.resend.com`
- **Port**: `465` (SSL) or `587` (TLS)
- **Username**: `resend` (or your Resend API key)
- **Password**: Your Resend API key (starts with `re_`)
- **Sender Email**: `noreply@yourdomain.com` (must be verified in Resend)
- **Sender Name**: `Mortgage Rate Search` (optional)

### For SendGrid:
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **Username**: `apikey`
- **Password**: Your SendGrid API key (starts with `SG.`)
- **Sender Email**: `noreply@yourdomain.com`
- **Sender Name**: `Mortgage Rate Search`

### For Postmark:
- **Host**: `smtp.postmarkapp.com`
- **Port**: `587`
- **Username**: Your Postmark Server API token
- **Password**: Your Postmark Server API token
- **Sender Email**: `noreply@yourdomain.com` (must be verified in Postmark)
- **Sender Name**: `Mortgage Rate Search`

### For Gmail (not recommended for production):
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Username**: Your Gmail address
- **Password**: App-specific password (not your regular password)
- **Sender Email**: Your Gmail address
- **Sender Name**: `Mortgage Rate Search`

## Step 2: Set Environment Variables

After configuring SMTP in Supabase, you need to set the same values as environment variables in your Next.js app:

Add these to your `.env.local` file:

```env
# SMTP Configuration (from Supabase Dashboard → Authentication → SMTP Settings)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_resend_api_key_here
SMTP_SENDER_NAME=Mortgage Rate Search
SMTP_SENDER_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- These values should match exactly what you configured in Supabase Dashboard
- `SMTP_SENDER_EMAIL` must be from a verified domain in your email provider
- `SMTP_PORT` should be `587` for TLS or `465` for SSL
- Never commit these values to git

## Step 3: Verify Configuration

1. Restart your Next.js dev server after adding environment variables
2. Try sending an OTP email
3. Check the server console logs - you should see:
   ```
   📧 Email service configuration check: { hasHost: true, hasUser: true, ... }
   📧 Sending email via SMTP to: user@example.com
   ✅ Email sent successfully via SMTP. Message ID: ...
   ```

## Step 4: Test Email Delivery

1. Request an OTP code from the questionnaire
2. Check your email inbox (and spam folder)
3. Verify the email contains the 6-digit code
4. Check the email provider's dashboard for delivery status

## Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration**:
   - Verify all SMTP environment variables are set correctly
   - Ensure values match Supabase Dashboard settings
   - Check that port number is correct (587 for TLS, 465 for SSL)

2. **Check Email Provider**:
   - Verify your sender email domain is verified
   - Check SPF, DKIM, and DMARC records are set up
   - Review email provider dashboard for errors or rate limits

3. **Check Server Logs**:
   - Look for SMTP connection errors
   - Check for authentication failures
   - Verify the email is being sent (check Message ID in logs)

### Common SMTP Errors

- **"Invalid login"**: Check `SMTP_USER` and `SMTP_PASS` are correct
- **"Connection timeout"**: Verify `SMTP_HOST` and `SMTP_PORT` are correct
- **"Sender address rejected"**: Ensure `SMTP_SENDER_EMAIL` is verified in your email provider
- **"TLS/SSL error"**: Try changing port from 587 to 465 (or vice versa)

### Development Mode

If SMTP is not configured in development, the service will log the OTP code to the console instead of sending an email. This allows you to test the flow without email setup.

## Benefits of Using Supabase SMTP

1. **Unified Configuration**: Same email provider for auth emails and OTP emails
2. **No Additional API Keys**: Use the same SMTP credentials Supabase uses
3. **Consistent Branding**: All emails come from the same sender
4. **Centralized Management**: Manage email settings in one place (Supabase Dashboard)

## Alternative: Keep Resend API (Optional)

If you prefer to keep using Resend API directly (instead of SMTP), you can still set:
```env
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

However, using Supabase SMTP is recommended for consistency.

## Production Deployment

When deploying to production (Vercel, etc.):

1. Add all SMTP environment variables to your production environment
2. Ensure values match your Supabase Dashboard configuration
3. Test email delivery in production
4. Monitor email provider dashboard for delivery issues

## Additional Resources

- [Supabase SMTP Documentation](https://supabase.com/docs/guides/auth/auth-smtp)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Resend SMTP Setup](https://resend.com/docs/send-with-smtp)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)

