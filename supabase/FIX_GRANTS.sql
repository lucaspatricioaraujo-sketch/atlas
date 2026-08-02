-- =============================================================================
-- ATLAS FINANCEIRO — SCRIPT DE CORREÇÃO EMERGENCIAL
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/bdannwwandjtylzqagbe/sql/new
--
-- Problema: RLS policies estavam criadas mas faltavam os GRANTs de permissão
-- do PostgreSQL para os roles 'anon' e 'authenticated'.
-- =============================================================================

-- 1. GARANTIR QUE OS PERFIS EXISTEM PARA USUÁRIOS JÁ CADASTRADOS
-- (Para usuários criados antes do trigger handle_new_user existir)
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. GRANT DE PERMISSÕES PARA TODOS OS OBJETOS DO SCHEMA PUBLIC
-- Sem isso, o RLS policy de INSERT WITH CHECK (true) ainda falha
-- porque o role authenticated não tem GRANT INSERT na tabela.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_contributions TO authenticated;

-- Apenas SELECT para anon (leitura pública restrita pelo RLS)
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.families TO anon;
GRANT SELECT ON public.family_members TO anon;

-- 3. GRANT DE EXECUÇÃO PARA AS FUNÇÕES RPC
GRANT EXECUTE ON FUNCTION public.has_family_access(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_family_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_upcoming_bills(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_expenses_by_category(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cash_flow_chart(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_financial_summary(UUID, DATE, DATE) TO authenticated;

-- 4. RECRIAR POLÍTICAS DE FAMILIES PARA GARANTIR
DROP POLICY IF EXISTS "Users can create families" ON public.families;
CREATE POLICY "Users can create families"
ON public.families FOR INSERT
TO authenticated
WITH CHECK (true);

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

-- 5. RECRIAR POLÍTICAS DE FAMILY_MEMBERS
DROP POLICY IF EXISTS "Admins can insert members" ON public.family_members;
CREATE POLICY "Admins can insert members"
ON public.family_members FOR INSERT
TO authenticated
WITH CHECK (public.is_family_admin(family_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
CREATE POLICY "Users can view members of their families"
ON public.family_members FOR SELECT
TO authenticated
USING (public.has_family_access(family_id));

-- 6. RECRIAR POLÍTICAS DE PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

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

-- 7. VERIFICAÇÃO FINAL
SELECT
  grantee,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('families', 'family_members', 'profiles', 'accounts', 'goals', 'budgets')
  AND grantee IN ('anon', 'authenticated')
GROUP BY grantee, table_name
ORDER BY table_name, grantee;
