-- RLS Policy Enhancements for End-to-End Financial Entity Management
-- Allows all valid members of a family to insert, update and manage financial entities

-- Accounts Policies
DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
CREATE POLICY "Family members can insert accounts" ON public.accounts FOR INSERT WITH CHECK (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;
CREATE POLICY "Family members can update accounts" ON public.accounts FOR UPDATE USING (public.has_family_access(family_id));

-- Cards Policies
DROP POLICY IF EXISTS "Admins can insert cards" ON public.cards;
CREATE POLICY "Family members can insert cards" ON public.cards FOR INSERT WITH CHECK (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can update cards" ON public.cards;
CREATE POLICY "Family members can update cards" ON public.cards FOR UPDATE USING (public.has_family_access(family_id));

-- Budgets Policies
DROP POLICY IF EXISTS "Admins can insert budgets" ON public.budgets;
CREATE POLICY "Family members can insert budgets" ON public.budgets FOR INSERT WITH CHECK (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can update budgets" ON public.budgets;
CREATE POLICY "Family members can update budgets" ON public.budgets FOR UPDATE USING (public.has_family_access(family_id));

-- Goals Policies
DROP POLICY IF EXISTS "Admins can insert goals" ON public.goals;
CREATE POLICY "Family members can insert goals" ON public.goals FOR INSERT WITH CHECK (public.has_family_access(family_id));

DROP POLICY IF EXISTS "Admins can update goals" ON public.goals;
CREATE POLICY "Family members can update goals" ON public.goals FOR UPDATE USING (public.has_family_access(family_id));
