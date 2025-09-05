# Fix Supabase Schema Cache Issue

## The Problem
The `isActive` column exists in the database but Supabase's schema cache doesn't recognize it, causing the error:
```
Could not find the 'isActive' column of 'companies' in the schema cache
```

## Solution 1: Manual Schema Refresh (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to Settings → API**
3. **Click "Refresh Schema" or "Reload Schema"**
4. **Wait for the refresh to complete**

## Solution 2: SQL Command to Force Refresh

Run this in your Supabase Dashboard → SQL Editor:

```sql
-- This will force a schema refresh
SELECT pg_notify('pgrst', 'reload schema');
```

## Solution 3: Restart Supabase Project

1. **Go to Supabase Dashboard**
2. **Navigate to Settings → General**
3. **Click "Restart Project"**
4. **Wait for restart to complete**

## Solution 4: Use Different Column Name

If the above doesn't work, we can temporarily use a different column name like `active` instead of `isActive`.

## Current Workaround

The code has been updated to work without the `isActive` column for now. Companies will be created successfully, and all companies will show as "Active" in the UI.

## Test the Fix

After applying any of the above solutions:

1. Try creating a company again
2. The `isActive` column should be recognized
3. You can then update the code to use `isActive: true` again


