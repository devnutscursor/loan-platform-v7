# Local Logic IO Reports API - Setup & Troubleshooting

## 🔐 **Credentials Added**

- ✅ Client ID: `033e02864fa954ad6224aec1d7f53578`
- ✅ Client Secret: Added to `.env.local`
- ✅ Environment variables configured

## ⚠️ **Current Issue: CloudFront 403 Error**

### **Problem**

When attempting to authenticate with Local Logic API, we're receiving a CloudFront 403 error:

```
403 ERROR: The request could not be satisfied.
This distribution is not configured to allow the HTTP request method that was used for this request.
```

### **Root Cause**

The CloudFront distribution in front of `api.locallogic.co` is blocking POST requests. This typically indicates:

1. **IP Whitelisting Required** - Your server IP needs to be whitelisted by Local Logic
2. **API Endpoint Restrictions** - The endpoint may have specific access requirements
3. **Credential Activation** - The credentials may need to be activated by Local Logic support

## 🔧 **What We've Built**

### **API Routes Created**

1. **`/api/locallogic/token`** - Get access token

   - POST endpoint to authenticate and get bearer token
   - Supports optional `agent_id` for personalized tokens
2. **`/api/locallogic/generate-report`** - Generate neighborhood report

   - POST endpoint to create reports
   - Accepts: `lat`, `lng`, `address_label`, `language`, `type` (ni/nmr), `agent_id`

### **Test Script**

- `test-locallogic-api.sh` - Bash script to test API endpoints

## 📋 **Next Steps**

### **1. Contact Local Logic Support**

You need to contact Local Logic support to:

- **Whitelist your server IP address(es)**

  - Production server IP
  - Development server IP (if different)
  - Your local development IP (if testing locally)
- **Verify API access**

  - Confirm the endpoint URL is correct: `https://api.locallogic.co/oauth/token`
  - Verify credentials are activated
  - Check if there are any additional setup steps required

### **2. Test API Routes**

Once IP whitelisting is complete, test the endpoints:

```bash
# Test token endpoint
curl -X POST "http://localhost:3000/api/locallogic/token" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test report generation
curl -X POST "http://localhost:3000/api/locallogic/generate-report" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 39.92422,
    "lng": -75.15548,
    "address_label": "500 Dudley St, Philadelphia, PA 19148",
    "language": "en",
    "type": "ni"
  }'
```

### **3. Alternative: Check for Different Endpoint**

The documentation mentioned a "v3 API". You may need to:

- Check if there's a different base URL for v3 API
- Verify if the credentials are for a different API version
- Ask Local Logic support about the correct endpoint

## 📝 **API Endpoint Details**

### **Token Endpoint**

```
POST https://api.locallogic.co/oauth/token
?client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
&audience=reports-api
&agent_id={AGENT_ID} (optional)
```

### **Report Generation Endpoint**

```
POST https://reports-api.locallogic.co/v1/reports
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "lat": 39.92422,
  "lng": -75.15548,
  "address_label": "500 Dudley St, Philadelphia, PA 19148",
  "language": "en",
  "type": "ni"  // or "nmr"
}
```

## 🔒 **Security Notes**

- ✅ Credentials stored in `.env.local` (not committed to git)
- ✅ API routes handle authentication server-side
- ✅ No credentials exposed to frontend
- ⚠️ Make sure `.env.local` is in `.gitignore`

## 📞 **Contact Information**

- **Local Logic Documentation**: https://docs.locallogic.co/docs/io-reports/io-report-api
- **Support**: Contact Local Logic support team for IP whitelisting

## ✅ **Once Working**

After IP whitelisting is complete:

1. Test token endpoint → Should return `access_token`
2. Test report generation → Should return `report_url`
3. Proceed with tab integration (see implementation details in previous conversation)

   good one!
