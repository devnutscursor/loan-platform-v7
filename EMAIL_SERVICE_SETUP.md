# Email Service Setup Guide

This guide explains how to set up the email service for OTP verification codes using Resend.

## Overview

The email service uses Resend API directly from Next.js API routes. This is the simplest approach and doesn't require Supabase Edge Functions.

## Step 1: Sign Up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create an API Key

1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Loan Platform Production")
4. Copy the API key (starts with `re_`)

## Step 3: Add and Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow the DNS setup instructions to verify your domain:
   - Add the SPF record
   - Add the DKIM records
   - Add the DMARC record (optional but recommended)
5. Wait for domain verification (usually takes a few minutes)

## Step 4: Set Environment Variables

Add these to your `.env.local` file (for local development) and your production environment (Vercel, etc.):

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- `RESEND_FROM_EMAIL` must be from a verified domain in Resend
- For development, you can use Resend's test domain: `onboarding@resend.dev` (no verification needed)
- Never commit these values to git - they should only be in environment variables

## Step 5: Test the Email Service

1. Start your development server: `npm run dev`
2. Try to search for mortgage rates (as an unauthenticated user)
3. Enter your email when prompted
4. Check your email inbox for the verification code

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` is from a verified domain
3. **Check Resend Dashboard**: Look at the Resend dashboard for any errors or rate limits
4. **Check Console**: Look for error messages in your Next.js console

### Development Mode

If you don't have Resend configured in development, the service will log the OTP code to the console instead of sending an email. This allows you to test the flow without setting up Resend.

### Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For production, consider upgrading if you expect higher volumes.

## Alternative Email Providers

If you prefer a different email service, you can modify `src/lib/mortech/email-service.ts` to use:

- **SendGrid**: Replace Resend API calls with SendGrid API
- **Mailgun**: Replace Resend API calls with Mailgun API
- **AWS SES**: Use AWS SDK for SES
- **Postmark**: Replace Resend API calls with Postmark API

The function signature remains the same, so you only need to update the API call logic.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** periodically
4. **Monitor usage** in your email provider dashboard
5. **Set up alerts** for unusual activity

## Production Checklist

- [ ] Resend account created and verified
- [ ] Domain added and verified in Resend
- [ ] API key created
- [ ] Environment variables set in production
- [ ] Test email sent successfully
- [ ] Rate limits understood and monitored
- [ ] Error handling tested

