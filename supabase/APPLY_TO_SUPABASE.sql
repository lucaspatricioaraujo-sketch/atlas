-- =============================================================================
-- ATLAS FINANCEIRO — SCHEMA COMPLETO CONSOLIDADO
-- Versão: 1.0.0-qa
-- Descrição: Script mestre para aplicar todo o schema do banco de dados Atlas
--            no Supabase remoto. Execute este script inteiro no SQL Editor do
--            dashboard Supabase: https://supabase.com/dashboard/project/bdannwwandjtylzqagbe/sql/new
-- =============================================================================

-- =============================================================================
-- MIGRATION 1: core_auth_schema
-- =============================================================================

-- 1. Custom Types
DO $$ BEGIN
  CREATE TYPE public.family_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Core Tables

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- FAMILIES
CREATE TABLE IF NOT EXISTS public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE (family_id, user_id)
);

-- 4. Triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_families_updated_at ON public.families;
CREATE TRIGGER set_families_updated_at
BEFORE UPDATE ON public.families
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_family_members_updated_at ON public.family_members;
CREATE TRIGGER set_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 5. Helper Functions for Security
CREATE OR REPLACE FUNCTION public.has_family_access(check_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = check_family_id 
    AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(check_family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE family_id = check_family_id 
    AND user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  );
$$;

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 6a. GRANT permissions to Supabase roles
-- (Without these GRANTs, RLS policies are meaningless — PostgreSQL rejects at the GRANT layer first)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view family members profiles" ON public.profiles;
CREATE POLICY "Users can view family members profiles" 
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = profiles.id
  )
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Families Policies
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;
CREATE POLICY "Users can view families they belong to" 
ON public.families FOR SELECT
TO authenticated
USING (public.has_family_access(id));

DROP POLICY IF EXISTS "Admins can update families" ON public.families;
CREATE POLICY "Admins can update families" 
ON public.families FOR UPDATE
TO authenticated
USING (public.is_family_admin(id));

DROP POLICY IF EXISTS "Users can create families" ON public.families;
CREATE POLICY "Users can create families" 
ON public.families FOR INSERT
TO authenticated
WITH CHECK (true);

-- Family Members Policies
DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
CREATE POLICY "Users can view members of their families" 
ON public.family_members FOR SELECT
TO authenticated
USING (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can insert members" ON public.family_members;
CREATE POLICY "Admins can insert members" 
ON public.family_members FOR INSERT
TO authenticated
WITH CHECK (public.is_family_admin(family_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update members" ON public.family_members;
CREATE POLICY "Admins can update members" 
ON public.family_members FOR UPDATE
TO authenticated
USING (public.is_family_admin(family_id));

DROP POLICY IF EXISTS "Admins or self can delete members" ON public.family_members;
CREATE POLICY "Admins or self can delete members" 
ON public.family_members FOR DELETE
TO authenticated
USING (public.is_family_admin(family_id) OR user_id = auth.uid());

-- 7. Automated Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Backfill profiles for users created before trigger existed
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);


-- =============================================================================
-- MIGRATION 2: financial_core_schema
-- =============================================================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.category_type AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLES
-- Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  type public.account_type NOT NULL DEFAULT 'CHECKING',
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  color TEXT,
  icon TEXT,
  include_in_total_balance BOOLEAN NOT NULL DEFAULT TRUE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  -- Open Finance / extra fields
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  sync_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  last_sync TIMESTAMPTZ,
  provider_id TEXT,
  provider_name TEXT,
  manual_account BOOLEAN NOT NULL DEFAULT TRUE,
  sync_error TEXT,
  available_balance NUMERIC(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  last_four_digits TEXT,
  limit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  closing_day INT,
  due_day INT,
  color TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  -- Open Finance / extra fields
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  institution TEXT,
  sync_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  last_sync TIMESTAMPTZ,
  provider_id TEXT,
  provider_name TEXT,
  manual_card BOOLEAN NOT NULL DEFAULT TRUE,
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type public.category_type NOT NULL,
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  system_category BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 3. TRIGGERS (updated_at)
DROP TRIGGER IF EXISTS set_accounts_updated_at ON public.accounts;
CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_cards_updated_at ON public.cards;
CREATE TRIGGER set_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for Accounts
DROP POLICY IF EXISTS "Users can view family accounts" ON public.accounts;
CREATE POLICY "Users can view family accounts" ON public.accounts FOR SELECT USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Family members can insert accounts" ON public.accounts;
CREATE POLICY "Family members can insert accounts" ON public.accounts FOR INSERT WITH CHECK (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Family members can update accounts" ON public.accounts;
CREATE POLICY "Family members can update accounts" ON public.accounts FOR UPDATE USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can delete accounts" ON public.accounts;
CREATE POLICY "Admins can delete accounts" ON public.accounts FOR DELETE USING (public.is_family_admin(family_id));

-- Policies for Cards
DROP POLICY IF EXISTS "Users can view family cards" ON public.cards;
CREATE POLICY "Users can view family cards" ON public.cards FOR SELECT USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can insert cards" ON public.cards;
DROP POLICY IF EXISTS "Family members can insert cards" ON public.cards;
CREATE POLICY "Family members can insert cards" ON public.cards FOR INSERT WITH CHECK (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can update cards" ON public.cards;
DROP POLICY IF EXISTS "Family members can update cards" ON public.cards;
CREATE POLICY "Family members can update cards" ON public.cards FOR UPDATE USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can delete cards" ON public.cards;
CREATE POLICY "Admins can delete cards" ON public.cards FOR DELETE USING (public.is_family_admin(family_id));

-- Policies for Categories
DROP POLICY IF EXISTS "Users can view family categories" ON public.categories;
CREATE POLICY "Users can view family categories" ON public.categories FOR SELECT USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_family_admin(family_id));
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_family_admin(family_id));
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_family_admin(family_id) AND system_category = FALSE);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_accounts_family_id ON public.accounts(family_id);
CREATE INDEX IF NOT EXISTS idx_cards_family_id ON public.cards(family_id);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON public.cards(account_id);
CREATE INDEX IF NOT EXISTS idx_categories_family_id ON public.categories(family_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_category_id);

-- 6. DEFAULT CATEGORY SEEDING TRIGGER
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (family_id, name, type, system_category, icon, color)
  VALUES 
    (NEW.id, 'Salário', 'INCOME', TRUE, 'briefcase', '#10b981'),
    (NEW.id, 'Freelance', 'INCOME', TRUE, 'laptop', '#3b82f6'),
    (NEW.id, 'Investimentos', 'INCOME', TRUE, 'trending-up', '#8b5cf6'),
    (NEW.id, 'Renda Extra', 'INCOME', TRUE, 'plus-circle', '#f59e0b'),
    (NEW.id, 'Moradia', 'EXPENSE', TRUE, 'home', '#ef4444'),
    (NEW.id, 'Alimentação', 'EXPENSE', TRUE, 'shopping-cart', '#f97316'),
    (NEW.id, 'Transporte', 'EXPENSE', TRUE, 'car', '#06b6d4'),
    (NEW.id, 'Saúde', 'EXPENSE', TRUE, 'heart', '#ec4899'),
    (NEW.id, 'Educação', 'EXPENSE', TRUE, 'book-open', '#8b5cf6'),
    (NEW.id, 'Lazer', 'EXPENSE', TRUE, 'smile', '#f59e0b'),
    (NEW.id, 'Compras', 'EXPENSE', TRUE, 'shopping-bag', '#ec4899'),
    (NEW.id, 'Assinaturas', 'EXPENSE', TRUE, 'repeat', '#3b82f6'),
    (NEW.id, 'Impostos', 'EXPENSE', TRUE, 'file-text', '#64748b'),
    (NEW.id, 'Viagem', 'EXPENSE', TRUE, 'plane', '#14b8a6'),
    (NEW.id, 'Pets', 'EXPENSE', TRUE, 'paw-print', '#f97316'),
    (NEW.id, 'Outros', 'EXPENSE', TRUE, 'help-circle', '#94a3b8');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_family_created ON public.families;
CREATE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();


-- =============================================================================
-- MIGRATION 3: transactions_engine
-- =============================================================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.transaction_type_enum AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_payment_type AS ENUM ('CASH', 'DEBIT', 'CREDIT', 'PIX', 'BANK_TRANSFER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_status_type AS ENUM ('PENDING', 'PAID', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  transaction_type public.transaction_type_enum NOT NULL,
  payment_type public.transaction_payment_type NOT NULL,
  status public.transaction_status_type NOT NULL DEFAULT 'PENDING',
  
  transaction_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  notes TEXT,
  attachment_url TEXT,
  
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_group_id UUID,
  installment_group_id UUID,
  transfer_group_id UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- 3. TRIGGERS (updated_at)
DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view family transactions" ON public.transactions;
CREATE POLICY "Users can view family transactions" 
ON public.transactions FOR SELECT 
USING (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
CREATE POLICY "Family members can insert transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
CREATE POLICY "Family members can update transactions" 
ON public.transactions FOR UPDATE 
USING (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
CREATE POLICY "Admins can delete transactions" 
ON public.transactions FOR DELETE 
USING (public.is_family_admin(family_id));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON public.transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_recurrence_id ON public.transactions(recurrence_group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_installment_id ON public.transactions(installment_group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON public.transactions(transfer_group_id);


-- =============================================================================
-- MIGRATION 4: planning_module
-- =============================================================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE public.budget_period AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. TABLES
-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period public.budget_period NOT NULL DEFAULT 'MONTHLY',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_limit NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Budget Items
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE (budget_id, category_id)
);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  target_date DATE,
  icon TEXT,
  color TEXT,
  status public.goal_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Goal Contributions
CREATE TABLE IF NOT EXISTS public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  contribution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (id)
);

-- 3. TRIGGERS (updated_at)
DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_goals_updated_at ON public.goals;
CREATE TRIGGER set_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. BUSINESS LOGIC TRIGGER (Goals)
CREATE OR REPLACE FUNCTION public.handle_goal_contribution()
RETURNS TRIGGER AS $$
DECLARE
  v_goal_id UUID;
  v_total NUMERIC(15,2);
  v_target NUMERIC(15,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_goal_id := OLD.goal_id;
  ELSE
    v_goal_id := NEW.goal_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM public.goal_contributions
  WHERE goal_id = v_goal_id;

  SELECT target_amount INTO v_target
  FROM public.goals
  WHERE id = v_goal_id;

  UPDATE public.goals
  SET 
    current_amount = v_total,
    status = CASE 
      WHEN v_total >= v_target THEN 'COMPLETED'::public.goal_status
      WHEN status = 'CANCELLED' THEN 'CANCELLED'::public.goal_status
      ELSE 'ACTIVE'::public.goal_status
    END
  WHERE id = v_goal_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_goal_contribution_changed ON public.goal_contributions;
CREATE TRIGGER on_goal_contribution_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.goal_contributions
  FOR EACH ROW EXECUTE FUNCTION public.handle_goal_contribution();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Budgets
DROP POLICY IF EXISTS "Users can view family budgets" ON public.budgets;
CREATE POLICY "Users can view family budgets" ON public.budgets FOR SELECT USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Family members can insert budgets" ON public.budgets;
CREATE POLICY "Family members can insert budgets" ON public.budgets FOR INSERT WITH CHECK (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can update budgets" ON public.budgets;
DROP POLICY IF EXISTS "Family members can update budgets" ON public.budgets;
CREATE POLICY "Family members can update budgets" ON public.budgets FOR UPDATE USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can delete budgets" ON public.budgets;
CREATE POLICY "Admins can delete budgets" ON public.budgets FOR DELETE USING (public.is_family_admin(family_id));

-- Budget Items
DROP POLICY IF EXISTS "Users can view budget items" ON public.budget_items;
CREATE POLICY "Users can view budget items" ON public.budget_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_id AND public.has_family_access(budgets.family_id))
);
DROP POLICY IF EXISTS "Admins can manage budget items" ON public.budget_items;
CREATE POLICY "Family members can manage budget items" ON public.budget_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_id AND public.has_family_access(budgets.family_id))
);

-- Goals
DROP POLICY IF EXISTS "Users can view family goals" ON public.goals;
CREATE POLICY "Users can view family goals" ON public.goals FOR SELECT USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can insert goals" ON public.goals;
DROP POLICY IF EXISTS "Family members can insert goals" ON public.goals;
CREATE POLICY "Family members can insert goals" ON public.goals FOR INSERT WITH CHECK (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can update goals" ON public.goals;
DROP POLICY IF EXISTS "Family members can update goals" ON public.goals;
CREATE POLICY "Family members can update goals" ON public.goals FOR UPDATE USING (public.has_family_access(family_id));
DROP POLICY IF EXISTS "Admins can delete goals" ON public.goals;
CREATE POLICY "Admins can delete goals" ON public.goals FOR DELETE USING (public.is_family_admin(family_id));

-- Goal Contributions
DROP POLICY IF EXISTS "Users can view goal contributions" ON public.goal_contributions;
CREATE POLICY "Users can view goal contributions" ON public.goal_contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND public.has_family_access(goals.family_id))
);
DROP POLICY IF EXISTS "Admins can manage goal contributions" ON public.goal_contributions;
CREATE POLICY "Family members can manage goal contributions" ON public.goal_contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND public.has_family_access(goals.family_id))
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_budgets_family_id ON public.budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON public.budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON public.goals(family_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id ON public.goal_contributions(transaction_id);


-- =============================================================================
-- MIGRATION 5: analytics_engine (RPCs)
-- =============================================================================

-- 1. Dashboard Summary
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_family_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON AS $$
DECLARE
  v_total_balance NUMERIC;
  v_total_income NUMERIC;
  v_total_expense NUMERIC;
  v_result JSON;
BEGIN
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
  FROM public.accounts
  WHERE family_id = p_family_id 
    AND archived = false 
    AND include_in_total_balance = true;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_income
  FROM public.transactions
  WHERE family_id = p_family_id
    AND transaction_type = 'INCOME'
    AND status = 'PAID'
    AND transaction_date >= p_start_date
    AND transaction_date <= p_end_date;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
  FROM public.transactions
  WHERE family_id = p_family_id
    AND transaction_type = 'EXPENSE'
    AND status = 'PAID'
    AND transaction_date >= p_start_date
    AND transaction_date <= p_end_date;

  v_result := json_build_object(
    'totalBalance', v_total_balance,
    'totalIncome', v_total_income,
    'totalExpense', v_total_expense,
    'netCashFlow', v_total_income - v_total_expense
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Upcoming Bills
CREATE OR REPLACE FUNCTION public.get_upcoming_bills(p_family_id UUID, p_limit INT DEFAULT 5)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_result
  FROM (
    SELECT id, description, amount, due_date, transaction_type, status
    FROM public.transactions
    WHERE family_id = p_family_id
      AND status = 'PENDING'
      AND transaction_type = 'EXPENSE'
    ORDER BY COALESCE(due_date, transaction_date) ASC
    LIMIT p_limit
  ) t;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Expenses by Category
CREATE OR REPLACE FUNCTION public.get_expenses_by_category(p_family_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_result
  FROM (
    SELECT 
      c.name AS category_name, 
      c.color AS category_color, 
      SUM(tx.amount) AS total_amount
    FROM public.transactions tx
    JOIN public.categories c ON tx.category_id = c.id
    WHERE tx.family_id = p_family_id
      AND tx.transaction_type = 'EXPENSE'
      AND tx.status = 'PAID'
      AND tx.transaction_date >= p_start_date
      AND tx.transaction_date <= p_end_date
    GROUP BY c.id, c.name, c.color
    ORDER BY total_amount DESC
  ) t;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cash Flow Chart
CREATE OR REPLACE FUNCTION public.get_cash_flow_chart(p_family_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_result
  FROM (
    SELECT 
      DATE(transaction_date) AS date,
      SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
    FROM public.transactions
    WHERE family_id = p_family_id
      AND status = 'PAID'
      AND transaction_date >= p_start_date
      AND transaction_date <= p_end_date
    GROUP BY DATE(transaction_date)
    ORDER BY DATE(transaction_date) ASC
  ) t;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. AI Financial Summary
CREATE OR REPLACE FUNCTION public.get_ai_financial_summary(p_family_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON AS $$
DECLARE
  v_dashboard JSON;
  v_expenses JSON;
  v_goals JSON;
  v_result JSON;
BEGIN
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  v_dashboard := public.get_dashboard_summary(p_family_id, p_start_date, p_end_date);
  v_expenses := public.get_expenses_by_category(p_family_id, p_start_date, p_end_date);
  
  SELECT COALESCE(json_agg(row_to_json(g)), '[]'::json) INTO v_goals
  FROM (
    SELECT name, target_amount, current_amount, status 
    FROM public.goals 
    WHERE family_id = p_family_id
  ) g;

  v_result := json_build_object(
    'period', json_build_object('start', p_start_date, 'end', p_end_date),
    'kpis', v_dashboard,
    'expense_distribution', v_expenses,
    'goals_progress', v_goals
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- GRANTS FINAIS — PERMISSÕES PARA TODAS AS TABELAS FINANCEIRAS
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_contributions TO authenticated;

-- GRANTs para funções RPC (necessário para chamadas via PostgREST)
GRANT EXECUTE ON FUNCTION public.has_family_access(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_family_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_upcoming_bills(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_expenses_by_category(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cash_flow_chart(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_financial_summary(UUID, DATE, DATE) TO authenticated;


-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================
SELECT 
  table_name,
  'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'families', 'family_members', 'accounts', 'cards', 'categories', 'transactions', 'budgets', 'budget_items', 'goals', 'goal_contributions')
ORDER BY table_name;
