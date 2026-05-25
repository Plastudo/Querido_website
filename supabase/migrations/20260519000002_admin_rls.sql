-- Tabela de configuração do admin (email guardado na DB, não no código)
CREATE TABLE admin_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO admin_config VALUES ('admin_email', 'tiago.16598@gmail.com');

-- Função auxiliar: verifica se o utilizador autenticado é o admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'email') IS NOT DISTINCT FROM (
    SELECT value FROM admin_config WHERE key = 'admin_email'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Ativar RLS em todas as tabelas ────────────────────────────────────────────
ALTER TABLE questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- ── SELECT público (leitura aberta para todos) ────────────────────────────────
CREATE POLICY "public_select_questions"    ON questions      FOR SELECT USING (true);
CREATE POLICY "public_select_options"      ON options        FOR SELECT USING (true);
CREATE POLICY "public_select_rules"        ON question_rules FOR SELECT USING (true);
CREATE POLICY "public_select_costs"        ON costs          FOR SELECT USING (true);
CREATE POLICY "public_select_budget_items" ON budget_items   FOR SELECT USING (true);
CREATE POLICY "public_select_divisions"    ON divisions      FOR SELECT USING (true);
CREATE POLICY "public_select_admin_config" ON admin_config   FOR SELECT USING (true);

-- ── Escrita restrita ao admin ─────────────────────────────────────────────────
CREATE POLICY "admin_all_questions"    ON questions      FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_options"      ON options        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_rules"        ON question_rules FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_costs"        ON costs          FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_budget_items" ON budget_items   FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_divisions"    ON divisions      FOR ALL USING (is_admin()) WITH CHECK (is_admin());
-- admin_config: sem política de escrita → apenas service_role pode modificar
