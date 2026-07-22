-- 1. ENUMS
CREATE TYPE public.account_type AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT');
CREATE TYPE public.category_type AS ENUM ('INCOME', 'EXPENSE');

-- 2. TABLES
-- Accounts
CREATE TABLE public.accounts (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Cards
CREATE TABLE public.cards (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Categories
CREATE TABLE public.categories (
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
CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for Accounts
CREATE POLICY "Users can view family accounts" ON public.accounts FOR SELECT USING (public.has_family_access(family_id));
CREATE POLICY "Admins can insert accounts" ON public.accounts FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Admins can update accounts" ON public.accounts FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "Admins can delete accounts" ON public.accounts FOR DELETE USING (public.is_family_admin(family_id));

-- Policies for Cards
CREATE POLICY "Users can view family cards" ON public.cards FOR SELECT USING (public.has_family_access(family_id));
CREATE POLICY "Admins can insert cards" ON public.cards FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Admins can update cards" ON public.cards FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "Admins can delete cards" ON public.cards FOR DELETE USING (public.is_family_admin(family_id));

-- Policies for Categories
CREATE POLICY "Users can view family categories" ON public.categories FOR SELECT USING (public.has_family_access(family_id));
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_family_admin(family_id) AND system_category = FALSE);

-- 5. INDEXES
CREATE INDEX idx_accounts_family_id ON public.accounts(family_id);
CREATE INDEX idx_cards_family_id ON public.cards(family_id);
CREATE INDEX idx_cards_account_id ON public.cards(account_id);
CREATE INDEX idx_categories_family_id ON public.categories(family_id);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_category_id);

-- 6. DEFAULT CATEGORY SEEDING TRIGGER
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert Income Categories
  INSERT INTO public.categories (family_id, name, type, system_category, icon, color)
  VALUES 
    (NEW.id, 'Salário', 'INCOME', TRUE, 'briefcase', '#10b981'),
    (NEW.id, 'Freelance', 'INCOME', TRUE, 'laptop', '#3b82f6'),
    (NEW.id, 'Investimentos', 'INCOME', TRUE, 'trending-up', '#8b5cf6'),
    (NEW.id, 'Renda Extra', 'INCOME', TRUE, 'plus-circle', '#f59e0b');

  -- Insert Expense Categories
  INSERT INTO public.categories (family_id, name, type, system_category, icon, color)
  VALUES 
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

CREATE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();
