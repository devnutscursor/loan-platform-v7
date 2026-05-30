-- Enable RLS + policies (public schema)
-- One SQL statement per breakpoint to work with scripts/run-migration.ts

--> statement-breakpoint
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS users_select_self ON public.users;
--> statement-breakpoint
DROP POLICY IF EXISTS users_update_self ON public.users;
--> statement-breakpoint
DROP POLICY IF EXISTS users_select_super_admin ON public.users;
--> statement-breakpoint
CREATE POLICY users_select_self ON public.users FOR SELECT USING (id = auth.uid());
--> statement-breakpoint
CREATE POLICY users_update_self ON public.users FOR UPDATE USING (id = auth.uid());
--> statement-breakpoint
CREATE POLICY users_select_super_admin ON public.users FOR SELECT USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS companies_select_member ON public.companies;
--> statement-breakpoint
DROP POLICY IF EXISTS companies_manage_super_admin ON public.companies;
--> statement-breakpoint
DROP POLICY IF EXISTS companies_update_company_admin ON public.companies;
--> statement-breakpoint
-- Allow reading your company during invite/setup even if membership is not yet active.
-- (Invite flows often create user_companies rows with is_active=false until setup completes.)
CREATE POLICY companies_select_member
ON public.companies
FOR SELECT
USING (
  public.current_user_role() = 'super_admin'
  OR EXISTS (
    SELECT 1
    FROM public.user_companies uc
    WHERE uc.user_id = auth.uid()
      AND uc.company_id = public.companies.id
  )
);
--> statement-breakpoint
CREATE POLICY companies_update_company_admin ON public.companies FOR UPDATE USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(id));
--> statement-breakpoint
CREATE POLICY companies_manage_super_admin ON public.companies FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.user_companies FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS user_companies_select_self ON public.user_companies;
--> statement-breakpoint
DROP POLICY IF EXISTS user_companies_select_company_admin ON public.user_companies;
--> statement-breakpoint
DROP POLICY IF EXISTS user_companies_manage_super_admin ON public.user_companies;
--> statement-breakpoint
DROP POLICY IF EXISTS user_companies_manage_company_admin ON public.user_companies;
--> statement-breakpoint
DROP POLICY IF EXISTS user_companies_manage_company_admin_update ON public.user_companies;
--> statement-breakpoint
CREATE POLICY user_companies_select_self ON public.user_companies FOR SELECT USING (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY user_companies_select_company_admin ON public.user_companies FOR SELECT USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY user_companies_manage_company_admin ON public.user_companies FOR INSERT WITH CHECK (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY user_companies_manage_company_admin_update ON public.user_companies FOR UPDATE USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY user_companies_manage_super_admin ON public.user_companies FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS leads_select_owner_or_admin ON public.leads;
--> statement-breakpoint
DROP POLICY IF EXISTS leads_insert_owner_or_admin ON public.leads;
--> statement-breakpoint
DROP POLICY IF EXISTS leads_update_owner_or_admin ON public.leads;
--> statement-breakpoint
DROP POLICY IF EXISTS leads_delete_owner_or_admin ON public.leads;
--> statement-breakpoint
CREATE POLICY leads_select_owner_or_admin ON public.leads FOR SELECT USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY leads_insert_owner_or_admin ON public.leads FOR INSERT WITH CHECK (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY leads_update_owner_or_admin ON public.leads FOR UPDATE USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY leads_delete_owner_or_admin ON public.leads FOR DELETE USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.page_settings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS page_settings_select_owner_or_admin ON public.page_settings;
--> statement-breakpoint
DROP POLICY IF EXISTS page_settings_write_owner_or_admin ON public.page_settings;
--> statement-breakpoint
CREATE POLICY page_settings_select_owner_or_admin ON public.page_settings FOR SELECT USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY page_settings_write_owner_or_admin ON public.page_settings FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.page_settings_versions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.page_settings_versions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS page_settings_versions_select_owner_or_admin ON public.page_settings_versions;
--> statement-breakpoint
DROP POLICY IF EXISTS page_settings_versions_write_owner_or_admin ON public.page_settings_versions;
--> statement-breakpoint
CREATE POLICY page_settings_versions_select_owner_or_admin ON public.page_settings_versions FOR SELECT USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY page_settings_versions_write_owner_or_admin ON public.page_settings_versions FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.templates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS templates_select_default_or_own ON public.templates;
--> statement-breakpoint
DROP POLICY IF EXISTS templates_write_own ON public.templates;
--> statement-breakpoint
DROP POLICY IF EXISTS templates_write_own_update ON public.templates;
--> statement-breakpoint
DROP POLICY IF EXISTS templates_manage_super_admin ON public.templates;
--> statement-breakpoint
CREATE POLICY templates_select_default_or_own ON public.templates FOR SELECT USING (public.current_user_role() = 'super_admin' OR is_default = true OR user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY templates_write_own ON public.templates FOR INSERT WITH CHECK (public.current_user_role() = 'super_admin' OR user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY templates_write_own_update ON public.templates FOR UPDATE USING (public.current_user_role() = 'super_admin' OR user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY templates_manage_super_admin ON public.templates FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.loan_officer_public_links ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.loan_officer_public_links FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS links_select_owner_or_admin ON public.loan_officer_public_links;
--> statement-breakpoint
DROP POLICY IF EXISTS links_write_owner_or_company_admin ON public.loan_officer_public_links;
--> statement-breakpoint
CREATE POLICY links_select_owner_or_admin ON public.loan_officer_public_links FOR SELECT USING (public.current_user_role() = 'super_admin' OR user_id = auth.uid() OR public.is_company_admin_of(company_id));
--> statement-breakpoint
CREATE POLICY links_write_owner_or_company_admin ON public.loan_officer_public_links FOR ALL USING (public.current_user_role() = 'super_admin' OR user_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.public_link_usage ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.public_link_usage FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS public_link_usage_super_admin ON public.public_link_usage;
--> statement-breakpoint
CREATE POLICY public_link_usage_super_admin ON public.public_link_usage FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.officer_content_faqs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.officer_content_faqs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS officer_faqs_owner_or_admin ON public.officer_content_faqs;
--> statement-breakpoint
CREATE POLICY officer_faqs_owner_or_admin ON public.officer_content_faqs FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid());

--> statement-breakpoint
ALTER TABLE public.officer_content_videos ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.officer_content_videos FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS officer_videos_owner_or_admin ON public.officer_content_videos;
--> statement-breakpoint
CREATE POLICY officer_videos_owner_or_admin ON public.officer_content_videos FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid());

--> statement-breakpoint
ALTER TABLE public.officer_content_guides ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.officer_content_guides FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS officer_guides_owner_or_admin ON public.officer_content_guides;
--> statement-breakpoint
CREATE POLICY officer_guides_owner_or_admin ON public.officer_content_guides FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid());

--> statement-breakpoint
ALTER TABLE public.selected_rates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.selected_rates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS selected_rates_owner_or_admin ON public.selected_rates;
--> statement-breakpoint
CREATE POLICY selected_rates_owner_or_admin ON public.selected_rates FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.manual_rates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.manual_rates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS manual_rates_owner_or_admin ON public.manual_rates;
--> statement-breakpoint
CREATE POLICY manual_rates_owner_or_admin ON public.manual_rates FOR ALL USING (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.rate_data ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.rate_data FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS rate_data_company_admin ON public.rate_data;
--> statement-breakpoint
CREATE POLICY rate_data_company_admin ON public.rate_data FOR ALL USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS api_keys_company_admin ON public.api_keys;
--> statement-breakpoint
CREATE POLICY api_keys_company_admin ON public.api_keys FOR ALL USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.analytics FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS analytics_select_company_admin ON public.analytics;
--> statement-breakpoint
DROP POLICY IF EXISTS analytics_insert_officer ON public.analytics;
--> statement-breakpoint
CREATE POLICY analytics_select_company_admin ON public.analytics FOR SELECT USING (public.current_user_role() = 'super_admin' OR public.is_company_admin_of(company_id) OR officer_id = auth.uid());
--> statement-breakpoint
CREATE POLICY analytics_insert_officer ON public.analytics FOR INSERT WITH CHECK (public.current_user_role() = 'super_admin' OR officer_id = auth.uid() OR public.is_company_admin_of(company_id));

--> statement-breakpoint
ALTER TABLE public.mortech_todays_rates_snapshot ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.mortech_todays_rates_snapshot FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS mortech_snapshot_super_admin ON public.mortech_todays_rates_snapshot;
--> statement-breakpoint
CREATE POLICY mortech_snapshot_super_admin ON public.mortech_todays_rates_snapshot FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.mortech_api_calls ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.mortech_api_calls FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS mortech_api_calls_super_admin ON public.mortech_api_calls;
--> statement-breakpoint
CREATE POLICY mortech_api_calls_super_admin ON public.mortech_api_calls FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.mortech_investors ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.mortech_investors FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS mortech_investors_super_admin ON public.mortech_investors;
--> statement-breakpoint
CREATE POLICY mortech_investors_super_admin ON public.mortech_investors FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.mortech_products ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.mortech_products FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS mortech_products_super_admin ON public.mortech_products;
--> statement-breakpoint
CREATE POLICY mortech_products_super_admin ON public.mortech_products FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.email_verifications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS email_verifications_super_admin ON public.email_verifications;
--> statement-breakpoint
CREATE POLICY email_verifications_super_admin ON public.email_verifications FOR ALL USING (public.current_user_role() = 'super_admin');

--> statement-breakpoint
ALTER TABLE public.mortech_email_rate_limits ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.mortech_email_rate_limits FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS mortech_email_rl_super_admin ON public.mortech_email_rate_limits;
--> statement-breakpoint
CREATE POLICY mortech_email_rl_super_admin ON public.mortech_email_rate_limits FOR ALL USING (public.current_user_role() = 'super_admin');

