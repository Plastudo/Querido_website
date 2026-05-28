-- Tabela de feedback (bugs e melhorias)
CREATE TABLE IF NOT EXISTS feedback (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type             TEXT        NOT NULL CHECK (type IN ('bug', 'improvement')),
  location         TEXT        NOT NULL,
  description      TEXT        NOT NULL,
  expected_behavior TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: qualquer pessoa pode inserir, só admin pode ler
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_public"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "feedback_select_admin"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
