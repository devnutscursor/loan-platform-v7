# 🚀 Production Deployment Fix Guide

## 🔍 **Issues Identified:**

1. **Missing Environment Variables** in Vercel production
2. **Database Connection Issues** - using direct connection instead of pooling
3. **Missing Production Configuration**

## 🛠️ **Step-by-Step Fix:**

### 1. **Add Environment Variables to Vercel:**

Go to your Vercel dashboard → Project Settings → Environment Variables and add these:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://furmgdzzerkqcljsxjbt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cm1nZHp6ZXJrcWNsanN4amJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODUzNTgsImV4cCI6MjA3MjU2MTM1OH0.u_gtLj3uNhqRsF97ax3SMzjxTrsnZOrirjfShLqMvcE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cm1nZHp6ZXJrcWNsanN4amJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk4NTM1OCwiZXhwIjoyMDcyNTYxMzU4fQ.A3Hzh9ERuWZJuP8cWiJu_8ZeAjeWIeZjhHJz2Dkc8bA

# Database Configuration - CRITICAL FIX
DATABASE_URL=postgresql://postgres.furmgdzzerkqcljsxjbt:vivoy15!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Redis Configuration
UPSTASH_REDIS_REST_URL=https://boss-shrew-28295.upstash.io
UPSTASH_REDIS_REST_TOKEN=AW6HAAIncDIxMDk3MGZmNjFhYzg0NjQyYTBiYmJlMDRlN2JhZWY4OXAyMjgyOTU

# App Configuration
NEXT_PUBLIC_SITE_URL=https://banking-bride-clone.vercel.app
NEXT_PUBLIC_APP_URL=https://banking-bride-clone.vercel.app

# Optimal Blue API Configuration
OB_BASE_URL=https://marketplace.optimalblue.com/consumer/api
OB_BUSINESS_CHANNEL_ID=64170
OB_ORIGINATOR_ID=749463
OB_BEARER_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiJodHRwczovL21hcmtldHBsYWNlYXV0aC5vcHRpbWFsYmx1ZS5jb20vZDM1YWU4OTMtMjM2Ny00MGI1LWE5YjQtYmZhYjNhY2I3OTkxIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZDAwMjZmOTktYjk4Mi00NzI0LTgyYzUtZWUwMTRmNWI2MzE4LyIsImlhdCI6MTc1Nzk0MjA2NiwibmJmIjoxNzU3OTQyMDY2LCJleHAiOjE3NTc5NDU5NjYsImFpbyI6ImsyUmdZRkQ5R2Fpa1dHUGNjZlozek9JRENsTHhBQT09IiwiYXBwaWQiOiJhNjFmYjhiOS0yNzgxLTQ5MGItYWIxYy0yNjg3NDE5ZmUzZWYiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9kMDAyNmY5OS1iOTgyLTQ3MjQtODJjNS1lZTAxNGY1YjYzMTgvIiwib2lkIjoiOTYzN2Y4NjktZDgxNi00MjVjLWIzZjctNGVhZDk2MGU2NmMyIiwicmgiOiIxLkFSc0FtVzhDMElLNUpFZUN4ZTRCVDF0akdBeVpHSlBEaEsxQWtaVjhyQXN6a2p2WUFBQWJBQS4iLCJyb2xlcyI6WyJMb2NrRGVza01hbmFnZW1lbnQiLCJNYXJrZXRwbGFjZS5TdXBwb3J0LlNlcnZpY2VzIiwiTWFya2V0cGxhY2UuTG9hbi5IaXN0b3JpY2FsUmVzZWFyY2giLCJCdXNpbmVzc0FuYWx5dGljcy5NYXJrZXRSYXRlSW5kZXgiLCJDbGllbnRJZFNlcnZpY2UiLCJDb21lcmdlbmNlLkNvbmNpZXJnZVByb3NwZWN0cyIsIkJlc3RYTUlTZWFyY2hGcm9tTG9hbiIsIkhpZXJhcmNoeU1hbmFnZW1lbnRTZXJ2aWNlIiwiQ29tZXJnZW5jZS5Db25jaWVyZ2VDb250YWN0cyIsIkNvbWVyZ2VuY2UuSW5kaXZpZHVhbFJldmlld1dpZGdldEFQSSIsIk1hcmtldHBsYWNlLkxvYW4uQWRtaW5pc3RyYXRpb24iLCJCZXN0WE1JU2VhcmNoIiwiTWFya2V0cGxhY2UuUHJpY2luZy5Db25zdW1lciIsIkJhc2VQcmljaW5nIiwiQXV0aG9yaXphdGlvblNlcnZpY2UiLCJNYXJrZXRwbGFjZS5QcmljaW5nLkJyb2tlciIsIk1hcmtldHBsYWNlLkF1dG9RdW90ZSIsIk1hcmtldHBsYWNlLkxvYW4uTG9ja2luZyIsIkNvbWVyZ2VuY2UuUmV2aWV3c0FQSSIsIk1hcmtldHBsYWNlLkxvYW4uQ2hhbmdlUmVxdWVzdCIsIk1hcmtldHBsYWNlLkNvbmZpZ3VyYXRpb24uU3VwcG9ydCIsIk1hcmtldHBsYWNlLlByaWNpbmcuRnVsbCIsIkNvbWVyZ2VuY2UuUXVlc3Rpb25uYWlyZSIsIkNvbWVyZ2VuY2UuQ3VzdG9tZXJUUE9EYXRhIiwiTWFya2V0cGxhY2UuTWFya2V0UmF0ZUluZGV4LkludHJhZGF5IiwiSW50ZXJuYWwuSW52ZXN0b3JQcmljaW5nSW5zaWdodENvbmZpZyIsIk1hcmtldHBsYWNlLkxvYW5TaWZ0ZXJOb3cuU2VhcmNoIiwiTWFya2V0cGxhY2UuTG9hblNpZnRlck5vdy5QaXBlbGluZSIsIk1hcmtldHBsYWNlLkxvYW5TaWZ0ZXJOb3cuQ29uZmlndXJhdGlvbiIsIkludGVybmFsLklkZW50aXR5TWFuYWdlbWVudFNlcnZpY2UiLCJJbnRlcm5hbC5JbnZlc3Rvck1hbmFnZW1lbnQiXSwic3ViIjoiOTYzN2Y4NjktZDgxNi00MjVjLWIzZjctNGVhZDk2MGU2NmMyIiwidGlkIjoiZDAwMjZmOTktYjk4Mi00NzI0LTgyYzUtZWUwMTRmNWI2MzE4IiwidXRpIjoiRU01M2JKYnF0VVdZU2ZKVnNaLTJBQSIsInZlciI6IjEuMCIsInhtc19mdGQiOiJlMkZnUC1OV3kxZXRPekNPalNDQ3VQR1dfRkRYTGhsT3A4bG1KM0pVdUg4QmRYTnViM0owYUMxa2MyMXoifQ.d_8XTfdvR0X8HWkJtiqEjCCC-hgvzNHaZKKBxWprSDOk3EVQnbTuVEhbcc6yW52Ke3ubTg-Mq52-dGTysrTOHtnQshQUp-x8IoJCGBdjUkyvF32amc9LvzU0NxFmXJNdY1rgvE8Mx7jvGJa1_1uje1sKNtzD-IgfuGg93B_4BD0QO9jywWdT5lhpjPxjT8zON9629aFIQJ_DJx94vUGH8dowyhnd5X81n2IMEFLS0uslWq_L1Y_sv_yBrEKHAKKy4MagZJzYGRRIyktsnDl6GzmwTJxbM3WgfP4gsY-NoTal9J9Wd7Hezc7NCB3kIV-uO6E_6WPQof-i_TbNsK9KHQ
```

### 2. **Critical Database URL Fix:**

The main issue is your database URL. You're using:
```bash
# ❌ WRONG (Direct connection - causes timeouts)
DATABASE_URL=postgresql://postgres:vivoy15!@db.furmgdzzerkqcljsxjbt.supabase.co:5432/postgres
```

**Change to:**
```bash
# ✅ CORRECT (Connection pooling - production ready)
DATABASE_URL=postgresql://postgres.furmgdzzerkqcljsxjbt:vivoy15!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. **Deploy the Changes:**

1. **Commit and push** the updated files:
   ```bash
   git add .
   git commit -m "Fix production deployment issues"
   git push origin main
   ```

2. **Redeploy** on Vercel (should happen automatically)

### 4. **Verify the Fix:**

After deployment, test these URLs:
- ✅ `/officers/leads` - Should load leads properly
- ✅ `/public/profile/[slug]` - Should load public profiles
- ✅ `/admin/loanofficers` - Should show loan officers with status

## 🔧 **Additional Production Optimizations:**

The code has been updated with:
- ✅ **Connection pooling** for better performance
- ✅ **Reduced connection limits** for Vercel
- ✅ **Increased timeouts** for production
- ✅ **SSL configuration** for Supabase
- ✅ **Error handling** improvements

## 🚨 **If Issues Persist:**

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions → View Logs
   - Look for specific error messages

2. **Test Database Connection:**
   - The new pooling URL should resolve connection timeouts

3. **Environment Variables:**
   - Ensure all variables are set in Vercel dashboard
   - Make sure they're not commented out

## 📋 **Summary of Changes Made:**

1. **Created `.env.production`** with correct production values
2. **Updated `vercel.json`** for proper deployment configuration  
3. **Fixed database connection** in `src/lib/db/index.ts`
4. **Added production optimizations** for Vercel

The main issue was using direct database connection instead of Supabase's connection pooling, which causes timeouts in serverless environments like Vercel.





