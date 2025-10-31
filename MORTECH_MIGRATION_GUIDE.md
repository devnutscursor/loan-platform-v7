# 🔄 Mortech Integration Migration Guide

## 📋 **Overview**

This guide helps you migrate from Optimal Blue to Mortech API for loan rate management in your loan officer platform.

## 🚀 **What's Been Implemented**

### ✅ **Core Integration**
- **Mortech API Client** (`src/lib/mortech/api.ts`)
- **API Route** (`src/app/api/mortech/search/route.ts`)
- **XML Response Parser** (using `xml2js`)
- **TypeScript Types** for Mortech requests/responses

### ✅ **Key Features**
- **Best Offer Strategy** support
- **Mortgage Insurance** integration
- **Multiple Loan Products** (30yr fixed, 15yr fixed, ARM, etc.)
- **Comprehensive Fee Structure**
- **Eligibility Checking**

## 🔧 **Setup Instructions**

### 1. **Get Mortech Credentials**
Contact Mortech to obtain:
- `MORTECH_CUSTOMER_ID` - Your Marksman Customer ID
- `MORTECH_THIRD_PARTY_NAME` - Authentication identifier
- `MORTECH_LICENSE_KEY` - Authentication key
- `MORTECH_EMAIL_ADDRESS` - Email for pricing requests

### 2. **Update Environment Variables**
Add to your `.env.local` and production environment:

```bash
# Mortech API Configuration
MORTECH_CUSTOMER_ID=your_mortech_customer_id
MORTECH_THIRD_PARTY_NAME=your_third_party_name
MORTECH_LICENSE_KEY=your_license_key
MORTECH_EMAIL_ADDRESS=your_email@company.com
MORTECH_BASE_URL=https://thirdparty.mortech-inc.com/mpg/servlet/mpgThirdPartyServlet
```

### 3. **Configure Best Offer Strategy**
In your Mortech Marksman account:
1. Go to **Settings > Best Offer Strategy > Best Offer Strategy Packages**
2. Create packages for different loan types (Conventional, FHA, VA)
3. Assign `filterId` values (e.g., "CONV", "FHA", "VA")
4. Configure products and pricing strategies

## 🔄 **Migration Steps**

### **Step 1: Update Frontend Components**

Replace Optimal Blue API calls with Mortech:

```typescript
// OLD (Optimal Blue)
const response = await fetch('/api/ob/search', {
  method: 'POST',
  body: JSON.stringify(optimalBlueParams)
});

// NEW (Mortech)
const response = await fetch('/api/mortech/search', {
  method: 'POST',
  body: JSON.stringify({
    loanAmount: 500000,
    propertyValue: 625000,
    creditScore: 740,
    propertyState: 'CA',
    propertyZip: '90210',
    loanPurpose: 'Purchase',
    propertyType: 'Single Family',
    occupancy: 'Primary',
    loanTerm: '30 year fixed',
    filterId: 'CONV', // Optional: Best Offer Strategy
    includeMI: true
  })
});
```

### **Step 2: Update Rate Display Components**

The Mortech API returns data in a compatible format, but you may need to update:

```typescript
// Rate object structure (compatible with existing UI)
interface Rate {
  id: string;
  lenderName: string;
  productName: string;
  loanProgram: string;
  loanType: string;
  loanTerm: string;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  points: number;
  originationFee: number;
  upfrontFee: number;
  monthlyPremium: number;
  downPayment: number;
  loanAmount: number;
  lockTerm: number;
  fees: Array<{
    description: string;
    amount: number;
    section: string;
    paymentType: string;
    prepaid: boolean;
  }>;
  eligibility: {
    eligibilityCheck: string;
    comments: string;
  };
}
```

### **Step 3: Update Search Forms**

Modify your rate search forms to collect Mortech-specific parameters:

```typescript
// Required parameters for Mortech
const searchParams = {
  loanAmount: number,        // Required
  propertyValue: number,     // Required  
  creditScore: number,      // Required
  propertyState: string,     // Required (e.g., "CA")
  propertyZip: string,       // Required (5-digit zip)
  loanPurpose: 'Purchase' | 'Refinance',
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family',
  occupancy: 'Primary' | 'Secondary' | 'Investment',
  loanTerm: string,          // e.g., "30 year fixed", "15 year fixed"
  filterId?: string,         // Optional: Best Offer Strategy filter
  includeMI?: boolean        // Include mortgage insurance
};
```

## 🎯 **Key Differences from Optimal Blue**

### **API Format**
- **Optimal Blue**: JSON requests/responses
- **Mortech**: URL parameters + XML responses

### **Authentication**
- **Optimal Blue**: Bearer token
- **Mortech**: Customer ID + License Key + Third Party Name

### **Product Selection**
- **Optimal Blue**: Complex filtering system
- **Mortech**: Best Offer Strategy (simpler, pre-configured)

### **Response Structure**
- **Optimal Blue**: Nested JSON objects
- **Mortech**: Flat XML structure with fees array

## 🔍 **Testing the Integration**

### **Test API Endpoint**
```bash
curl -X POST http://localhost:3000/api/mortech/search \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 500000,
    "propertyValue": 625000,
    "creditScore": 740,
    "propertyState": "CA",
    "propertyZip": "90210",
    "loanPurpose": "Purchase",
    "propertyType": "Single Family",
    "occupancy": "Primary",
    "loanTerm": "30 year fixed",
    "includeMI": true
  }'
```

### **Expected Response**
```json
{
  "success": true,
  "rates": [
    {
      "id": "1353",
      "lenderName": "DemoHomeLoans(1234)",
      "productName": "FHLMC 30 Yr Fixed",
      "loanProgram": "FHLMC 30 Yr Fixed",
      "loanType": "Fixed",
      "loanTerm": "30",
      "interestRate": 3.75,
      "apr": 3.763,
      "monthlyPayment": 3635.46,
      "points": 0,
      "originationFee": 0,
      "upfrontFee": 0,
      "monthlyPremium": 0,
      "downPayment": 196250,
      "loanAmount": 785000,
      "lockTerm": 30,
      "fees": [...],
      "eligibility": {
        "eligibilityCheck": "Pass",
        "comments": ""
      }
    }
  ]
}
```

## 🚨 **Important Notes**

### **Mortgage Insurance**
- Add `pmiCompany: -999` and `noMI: 0` to include MI quotes
- MI premium appears in `monthlyPremium` field

### **VA/FHA Fees**
- VA funding fee and FHA upfront MI in `upfrontFee`
- Use `financeMI: 1` to finance these fees in loan amount

### **Best Offer Strategy**
- Configure in Marksman admin interface
- Use `filterId` parameter to request specific strategies
- Simplifies product selection logic

### **Error Handling**
- Mortech returns XML with error codes
- Check `errorNum` in response header
- Handle network timeouts and XML parsing errors

## 📞 **Support Contacts**

- **Mortech Sales**: 855.298.9317
- **Mortech Support**: 402.441.4647
- **Documentation**: Mortech Marksman Admin Portal

## 🔄 **Next Steps**

1. **Get Mortech credentials** from your account manager
2. **Configure Best Offer Strategy** packages in Marksman
3. **Update environment variables** in production
4. **Test the integration** with sample data
5. **Update frontend components** to use Mortech API
6. **Deploy and monitor** the new integration

The Mortech integration provides a more streamlined approach to mortgage pricing with built-in mortgage insurance and simplified product management through Best Offer Strategy.




