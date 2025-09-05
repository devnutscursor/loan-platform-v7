# Email Verification Flow - Loan Officer Platform

## 🔄 New Authentication Flow

### 1. Super Admin Creates Company
- Super Admin logs in to `/admin/companies`
- Fills company creation form with:
  - Company Name
  - Admin Email (for company admin)
  - Website
- Clicks "Create Company & Send Verification"

### 2. Email Verification Process
- System automatically sends verification email to admin email
- Email contains link: `/auth/verify-company-admin?company={id}&token={token}`
- Company is created with `admin_email_verified: false`
- Company Admin cannot login until email is verified

### 3. Company Admin Email Verification
- Admin clicks verification link in email
- Redirected to password creation page
- Sets up password (minimum 8 characters)
- Email gets verified and user account is activated

### 4. Company Admin Login
- Admin can now login at `/auth` with email + password
- Automatically redirected to `/admin/employees` (Company Admin dashboard)
- Can create Loan Officers from their dashboard

### 5. Loan Officers Login
- Once created by Company Admin, can login at `/auth`
- Redirected to `/dashboard` (Employee dashboard)

## 🔧 Error Handling

### Invalid Credentials
- ❌ "Invalid email or password. Please check your credentials and try again."

### Email Not Verified
- 📧 "Please check your email and confirm your account before signing in. Look for the verification email and click the confirmation link."

### User Not Found
- 👤 "No account found with this email. Please check your email or contact your administrator."

### Too Many Attempts
- ⏰ "Too many login attempts. Please wait a few minutes before trying again."

### Network Errors
- 🌐 "Network error. Please check your connection and try again."

## 🔄 Resend Verification Email

### Automatic Resend
- If Super Admin enters same email again in company creation form
- System automatically resends verification email
- Shows message: "Verification email resent. Please check your inbox."

### Manual Resend (Future Enhancement)
- Could add "Resend Verification" button on companies list
- For companies with `admin_email_verified: false`

## 🛡️ Security Features

### Email Validation
- Frontend validates email format
- Backend validates email before sending
- Prevents invalid email addresses

### Token Security
- Unique verification token for each company
- Token expires after use
- Cannot reuse verification links

### Password Requirements
- Minimum 8 characters
- Confirmed password matching
- Secure password hashing by Supabase

## 📊 Database Schema

### Companies Table
```sql
admin_email              -- Email for company admin
admin_email_verified     -- Boolean verification status
admin_user_id           -- Reference to Supabase user
verification_token      -- Unique token for email verification
```

### Flow States
1. **Created**: Company exists, email sent, not verified
2. **Email Verified**: Admin verified email, set password
3. **Active**: Admin can login and manage loan officers

## 🎯 User Experience

### Super Admin
- Clear feedback when company is created
- Knows verification email was sent
- Can resend by re-entering same email

### Company Admin
- Receives clear verification instructions
- Simple password setup process
- Success message after verification
- Smooth redirect to login

### Loan Officers
- Standard login process
- Clear error messages if issues
- Directed to appropriate dashboard

## 🚀 Next Steps

1. **Test email verification flow**
2. **Add email verification status to companies list**
3. **Add manual resend verification option**
4. **Implement forgot password flow**
5. **Add email template customization**
