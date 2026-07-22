-- 1. ENUMS
CREATE TYPE public.transaction_type_enum AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE public.transaction_payment_type AS ENUM ('CASH', 'DEBIT', 'CREDIT', 'PIX', 'BANK_TRANSFER');
CREATE TYPE public.transaction_status_type AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- 2. TABLES
-- Transactions
CREATE TABLE public.transactions (
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
CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Transactions
CREATE POLICY "Users can view family transactions" 
ON public.transactions FOR SELECT 
USING (public.has_family_access(family_id));

CREATE POLICY "Admins can insert transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (public.is_family_admin(family_id));

CREATE POLICY "Admins can update transactions" 
ON public.transactions FOR UPDATE 
USING (public.is_family_admin(family_id));

CREATE POLICY "Admins can delete transactions" 
ON public.transactions FOR DELETE 
USING (public.is_family_admin(family_id));

-- 5. INDEXES (Optimized for filtering and reports)
CREATE INDEX idx_transactions_family_id ON public.transactions(family_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_recurrence_id ON public.transactions(recurrence_group_id);
CREATE INDEX idx_transactions_installment_id ON public.transactions(installment_group_id);
CREATE INDEX idx_transactions_transfer_id ON public.transactions(transfer_group_id);
