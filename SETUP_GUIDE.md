# 🚀 Loan Officer Platform - Complete Setup Guide

## 📋 **Authentication Flow Overview**

### **User Hierarchy:**
1. **Super Admin** (pre-created) → Creates Company Admins
2. **Company Admin** (created by Super Admin) → Creates Loan Officers  
3. **Loan Officers** (created by Company Admin) → Access personal dashboard

### **No Public Signup** - Only Admin-created accounts

---

## 🛠️ **Step-by-Step Setup**

### **Step 1: Supabase Project Setup**

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Note down your project URL and API keys

2. **Get Your Credentials:**
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (keep this secret!)

### **Step 2: Database Setup**

1. **Run Database Migrations:**
   ```bash
   # Generate migrations from schema
   yarn db:generate
   
   # Push schema to Supabase
   yarn db:push
   ```

2. **Set Up RLS Policies:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase-policies.sql`
   - Click "Run" to execute all policies

### **Step 3: Environment Configuration**

1. **Update `.env.local`:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Database Configuration
   DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
   ```

### **Step 4: Create Super Admin**

1. **Manual Database Setup:**
   - Go to Supabase Dashboard → Table Editor → `users`
   - Click "Insert" → "Insert row"
   - Add a new user with:
     - `id`: Generate a UUID (use online UUID generator)
     - `email`: Your admin email
     - `first_name`: Your first name
     - `last_name`: Your last name
     - `role`: `super_admin`
     - `is_active`: `true`
     - `created_at`: Current timestamp

2. **Create Auth User:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add user"
   - Enter the same email and a password
   - Copy the User ID and use it as the `id` in the users table

### **Step 5: Start Development Server**

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit: **http://localhost:3000**

---

## 🎯 **User Flow & Navigation**

### **1. Super Admin Workflow:**

1. **Login** at `/auth` with super admin credentials
2. **Redirected** to `/admin/companies`
3. **Create Company:**
   - Enter company name
   - Enter admin email
   - Set password
   - Click "Create Company"
4. **Company Admin** can now login with created credentials

### **2. Company Admin Workflow:**

1. **Login** at `/auth` with company admin credentials
2. **Redirected** to `/admin/employees`
3. **Create Loan Officers:**
   - Enter employee details (name, email, password)
   - Click "Create Employee"
4. **Employees** can now login and access dashboard

### **3. Employee Workflow:**

1. **Login** at `/auth` with employee credentials
2. **Redirected** to `/dashboard`
3. **Access** personal dashboard with stats and quick actions

---

## 🔐 **Security Features**

### **Row Level Security (RLS):**
- **Super Admins**: Full access to all data
- **Company Admins**: Access only to their company's data
- **Employees**: Access only to their company's data
- **No Cross-Company Access**: Users cannot see other companies' data

### **Authentication:**
- **No Public Signup**: Only admin-created accounts
- **Role-Based Access**: Different dashboards based on user role
- **Secure Password Creation**: Admins create passwords for users

---

## 📊 **Database Schema**

### **Core Tables:**
- `users` - User accounts and roles
- `companies` - Company information
- `user_companies` - User-company relationships
- `leads` - Lead management
- `page_settings` - Landing page configurations
- `analytics` - Performance tracking

### **Key Relationships:**
- Users belong to companies via `user_companies`
- Each company has one admin and multiple employees
- All data is scoped to company level

---

## 🚨 **Important Notes**

### **First Time Setup:**
1. **Create Super Admin manually** in database
2. **Set up RLS policies** before testing
3. **Test each role** to ensure proper access control

### **Environment Variables:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use correct project URL and keys
- Database URL should point to your Supabase instance

### **Development Commands:**
```bash
# Development
yarn dev          # Start dev server
yarn build        # Build for production
yarn type-check   # Run TypeScript checks
yarn lint         # Run ESLint

# Database
yarn db:generate  # Generate migrations
yarn db:push      # Push to database
yarn db:studio    # Open Drizzle Studio
```

---

## 🎉 **Ready to Go!**

Your Loan Officer Platform is now set up with:
- ✅ Secure multi-role authentication
- ✅ Company-based data isolation
- ✅ Admin-created user accounts
- ✅ Role-based dashboards
- ✅ Row Level Security policies

**Next Steps:**
1. Test the complete user flow
2. Customize the UI/UX as needed
3. Add additional features for loan officers
4. Deploy to production when ready

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Cannot find module" errors:**
   - Run `yarn install` to ensure all dependencies are installed
   - Check that all files are in the correct locations

2. **Authentication errors:**
   - Verify Supabase credentials in `.env.local`
   - Check that RLS policies are properly set up

3. **Database connection issues:**
   - Verify `DATABASE_URL` is correct
   - Ensure database migrations have been run

4. **Permission denied errors:**
   - Check RLS policies are active
   - Verify user roles are correctly set

### **Getting Help:**
- Check Supabase logs in the dashboard
- Use Drizzle Studio to inspect database
- Review browser console for client-side errors



