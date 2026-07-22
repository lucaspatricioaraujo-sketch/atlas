-- 1. ENUMS
CREATE TYPE public.budget_period AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE public.goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- 2. TABLES
-- Budgets
CREATE TABLE public.budgets (
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
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE (budget_id, category_id)
);

-- Goals
CREATE TABLE public.goals (
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
CREATE TABLE public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  contribution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (id)
);

-- 3. TRIGGERS (updated_at)
CREATE TRIGGER set_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

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
  -- Determine the goal_id based on operation
  IF TG_OP = 'DELETE' THEN
    v_goal_id := OLD.goal_id;
  ELSE
    v_goal_id := NEW.goal_id;
  END IF;

  -- Calculate the new total for the goal
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM public.goal_contributions
  WHERE goal_id = v_goal_id;

  -- Get target amount
  SELECT target_amount INTO v_target
  FROM public.goals
  WHERE id = v_goal_id;

  -- Update goal
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

CREATE TRIGGER on_goal_contribution_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.goal_contributions
  FOR EACH ROW EXECUTE FUNCTION public.handle_goal_contribution();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Budgets
CREATE POLICY "Users can view family budgets" ON public.budgets FOR SELECT USING (public.has_family_access(family_id));
CREATE POLICY "Admins can insert budgets" ON public.budgets FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Admins can update budgets" ON public.budgets FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "Admins can delete budgets" ON public.budgets FOR DELETE USING (public.is_family_admin(family_id));

-- Budget Items
CREATE POLICY "Users can view budget items" ON public.budget_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_id AND public.has_family_access(budgets.family_id))
);
CREATE POLICY "Admins can manage budget items" ON public.budget_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_id AND public.is_family_admin(budgets.family_id))
);

-- Goals
CREATE POLICY "Users can view family goals" ON public.goals FOR SELECT USING (public.has_family_access(family_id));
CREATE POLICY "Admins can insert goals" ON public.goals FOR INSERT WITH CHECK (public.is_family_admin(family_id));
CREATE POLICY "Admins can update goals" ON public.goals FOR UPDATE USING (public.is_family_admin(family_id));
CREATE POLICY "Admins can delete goals" ON public.goals FOR DELETE USING (public.is_family_admin(family_id));

-- Goal Contributions
CREATE POLICY "Users can view goal contributions" ON public.goal_contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND public.has_family_access(goals.family_id))
);
CREATE POLICY "Admins can manage goal contributions" ON public.goal_contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND public.is_family_admin(goals.family_id))
);

-- 6. INDEXES
CREATE INDEX idx_budgets_family_id ON public.budgets(family_id);
CREATE INDEX idx_budget_items_budget_id ON public.budget_items(budget_id);
CREATE INDEX idx_goals_family_id ON public.goals(family_id);
CREATE INDEX idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_transaction_id ON public.goal_contributions(transaction_id);
