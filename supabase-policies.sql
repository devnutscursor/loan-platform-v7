-- Supabase RLS Policies for Loan Officer Platform
-- Run these commands in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_settings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Super admins can see all users
CREATE POLICY "Super admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Company admins can see users in their company
CREATE POLICY "Company admins can view company users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      JOIN users u ON u.id = uc.user_id
      WHERE uc.user_id = auth.uid() 
      AND u.role = 'company_admin'
      AND uc.company_id IN (
        SELECT company_id FROM user_companies 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Super admins can insert users
CREATE POLICY "Super admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Company admins can insert employee users
CREATE POLICY "Company admins can insert employees" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_companies uc
      JOIN users u ON u.id = uc.user_id
      WHERE uc.user_id = auth.uid() 
      AND u.role = 'company_admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Companies table policies
-- Super admins can do everything with companies
CREATE POLICY "Super admins can manage companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Company admins can view their company
CREATE POLICY "Company admins can view their company" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      JOIN users u ON u.id = uc.user_id
      WHERE uc.user_id = auth.uid() 
      AND u.role = 'company_admin'
      AND uc.company_id = companies.id
    )
  );

-- Employees can view their company
CREATE POLICY "Employees can view their company" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = companies.id
    )
  );

-- User companies table policies
-- Super admins can manage all user-company relationships
CREATE POLICY "Super admins can manage user companies" ON user_companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Company admins can manage their company's user relationships
CREATE POLICY "Company admins can manage company users" ON user_companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      JOIN users u ON u.id = uc.user_id
      WHERE uc.user_id = auth.uid() 
      AND u.role = 'company_admin'
      AND uc.company_id = user_companies.company_id
    )
  );

-- Users can view their own company relationships
CREATE POLICY "Users can view own company relationships" ON user_companies
  FOR SELECT USING (user_id = auth.uid());

-- Leads table policies
-- Users can manage leads for their company
CREATE POLICY "Users can manage company leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = leads.company_id
    )
  );

-- Page settings policies
-- Users can manage page settings for their company
CREATE POLICY "Users can manage company page settings" ON page_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = page_settings.company_id
    )
  );

-- Page settings versions policies
-- Users can manage page settings versions for their company
CREATE POLICY "Users can manage company page settings versions" ON page_settings_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = page_settings_versions.company_id
    )
  );

-- Rate data policies
-- Users can view rate data for their company
CREATE POLICY "Users can view company rate data" ON rate_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = rate_data.company_id
    )
  );

-- API keys policies
-- Users can manage API keys for their company
CREATE POLICY "Users can manage company API keys" ON api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = api_keys.company_id
    )
  );

-- Analytics policies
-- Users can manage analytics for their company
CREATE POLICY "Users can manage company analytics" ON analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_companies uc
      WHERE uc.user_id = auth.uid() 
      AND uc.company_id = analytics.company_id
    )
  );

-- Templates policies (public read access)
CREATE POLICY "Anyone can view active templates" ON templates
  FOR SELECT USING (is_active = true);

-- Super admins can manage templates
CREATE POLICY "Super admins can manage templates" ON templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );



