# Optimal Blue API Setup Guide

## Current Issues
- ❌ **401 Authentication Error**: Missing API credentials
- ❌ **Mock Data Being Used**: System falls back to demo data
- ❌ **Missing Environment Variables**: No API keys configured

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Optimal Blue API Configuration
OB_BASE_URL=https://marketplace.optimalblue.com/consumer/api
OB_BUSINESS_CHANNEL_ID=64170
OB_ORIGINATOR_ID=749463
OB_API_KEY=your_api_key_here
OB_SECRET_KEY=your_secret_key_here
```

## How to Get Optimal Blue API Credentials

### 1. Contact Optimal Blue Support
- **Email**: support@optimalblue.com
- **Phone**: (800) 866-5626
- **Website**: https://www.optimalblue.com/contact/

### 2. Request API Access
When contacting Optimal Blue, request:
- **API Key** for Best Execution Search
- **Secret Key** for authentication
- **Business Channel ID** (currently using: 64170)
- **Originator ID** (currently using: 749463)

### 3. Verify Your Account
Ensure your Optimal Blue account has:
- ✅ **Active subscription**
- ✅ **API access enabled**
- ✅ **Best Execution Search permissions**

## Current Configuration

```typescript
// Current values in route.ts
const BUSINESS_CHANNEL_ID = "64170";  // ⚠️ Verify this is correct
const ORIGINATOR_ID = "749463";       // ⚠️ Verify this is correct
```

## Testing the API

Once you have the credentials:

1. **Add them to `.env.local`**
2. **Restart the development server**
3. **Check the console logs** for:
   - `=== OPTIMAL BLUE API REQUEST ===`
   - `API Key provided: true`
   - `Secret Key provided: true`

## Expected Behavior

### ✅ With Valid Credentials:
```
✅ Using real API data from: optimal_blue_api
```

### ⚠️ With Invalid/Missing Credentials:
```
⚠️ WARNING: Using mock data due to API authentication failure
⚠️ Data source: mock_fallback
```

## Troubleshooting

### 401 Unauthorized Error
- **Check API Key**: Ensure it's correct and active
- **Check Secret Key**: Verify it matches your account
- **Check Account Status**: Ensure subscription is active
- **Check Permissions**: Verify API access is enabled

### 403 Forbidden Error
- **Check Business Channel ID**: Verify it's correct for your account
- **Check Originator ID**: Ensure it matches your organization
- **Check API Permissions**: Verify Best Execution Search is enabled

### 404 Not Found Error
- **Check URL**: Verify the API endpoint is correct
- **Check Version**: Ensure api-version header is correct (currently "4")

## Alternative: Use Mock Data

If you can't get Optimal Blue API access immediately, the system will:
- ✅ **Continue working** with mock data
- ✅ **Show clear warnings** to users
- ✅ **Display demo rates** for testing
- ✅ **Maintain full functionality**

## Next Steps

1. **Contact Optimal Blue** to get API credentials
2. **Add credentials** to `.env.local`
3. **Restart the server** to load new environment variables
4. **Test the API** by submitting a mortgage search form
5. **Check console logs** to verify authentication is working

## Support

If you need help with Optimal Blue API setup:
- **Optimal Blue Documentation**: https://docs.optimalblue.com/
- **API Support**: support@optimalblue.com
- **Technical Support**: (800) 866-5626
