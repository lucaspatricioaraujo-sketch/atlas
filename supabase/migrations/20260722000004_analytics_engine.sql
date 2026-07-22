-- ==============================================================================
-- ATLAS FINANCEIRO: ANALYTICS ENGINE (RPCs)
-- ==============================================================================

-- 1. Dashboard Summary
-- Returns the primary KPIs for the main dashboard (Total balance, Income, Expense)
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_family_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON AS $$
DECLARE
  v_total_balance NUMERIC;
  v_total_income NUMERIC;
  v_total_expense NUMERIC;
  v_result JSON;
BEGIN
  -- Validate access
  IF NOT public.has_family_access(p_family_id) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  -- Calculate Total Balance (Sum of all accounts not archived and included in total)
  SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
  FROM public.accounts
  WHERE family_id = p_family_id 
    AND archived = false 
    AND include_in_total_balance = true;

  -- Calculate Total Income for the period
  SELECT COALESCE(SUM(amount), 0) INTO v_total_income
  FROM public.transactions
  WHERE family_id = p_family_id
    AND transaction_type = 'INCOME'
    AND status = 'PAID'
    AND transaction_date >= p_start_date
    AND transaction_date <= p_end_date;

  -- Calculate Total Expense for the period
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
  FROM public.transactions
  WHERE family_id = p_family_id
    AND transaction_type = 'EXPENSE'
    AND status = 'PAID'
    AND transaction_date >= p_start_date
    AND transaction_date <= p_end_date;

  -- Build JSON Response
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
-- Returns pending transactions (bills) and soon-to-due transactions
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


-- 3. Expenses by Category (Chart Data)
-- Aggregates expenses grouped by category for Donut/Pie charts
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


-- 4. Cash Flow Chart (Bar/Line Chart Data)
-- Aggregates income and expenses grouped by date
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


-- 5. AI Financial Summary (Context Injection for LLMs)
-- Returns a heavily aggregated, text-ready or dense JSON structure optimized for AI consumption
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

  -- Get high level numbers
  v_dashboard := public.get_dashboard_summary(p_family_id, p_start_date, p_end_date);
  
  -- Get category behavior
  v_expenses := public.get_expenses_by_category(p_family_id, p_start_date, p_end_date);
  
  -- Get goals progress
  SELECT COALESCE(json_agg(row_to_json(g)), '[]'::json) INTO v_goals
  FROM (
    SELECT name, target_amount, current_amount, status 
    FROM public.goals 
    WHERE family_id = p_family_id
  ) g;

  -- Aggregate into a single context payload
  v_result := json_build_object(
    'period', json_build_object('start', p_start_date, 'end', p_end_date),
    'kpis', v_dashboard,
    'expense_distribution', v_expenses,
    'goals_progress', v_goals
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
