-- Client-owned budget persistence
-- Each user can have many budgets; each budget can have many divisions.

CREATE TABLE client_budgets (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  region     TEXT    NOT NULL DEFAULT 'Norte',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_budget_divisions (
  id          UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id   UUID   NOT NULL REFERENCES client_budgets(id)  ON DELETE CASCADE,
  division_id BIGINT NOT NULL REFERENCES divisions(id)        ON DELETE CASCADE,
  answers     JSONB  NOT NULL DEFAULT '{}',
  saved_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(budget_id, division_id)
);

CREATE INDEX idx_client_budgets_user     ON client_budgets(user_id);
CREATE INDEX idx_client_budget_divs_budget ON client_budget_divisions(budget_id);

-- RLS — users see and manage only their own data; admins have no access.
ALTER TABLE client_budgets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_budget_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_budgets"
  ON client_budgets FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_budget_divisions"
  ON client_budget_divisions FOR ALL
  USING  (budget_id IN (SELECT id FROM client_budgets WHERE user_id = auth.uid()))
  WITH CHECK (budget_id IN (SELECT id FROM client_budgets WHERE user_id = auth.uid()));

-- Keep updated_at current whenever a division is saved
CREATE OR REPLACE FUNCTION _touch_client_budget_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE client_budgets SET updated_at = now() WHERE id = NEW.budget_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_budget_on_division
  AFTER INSERT OR UPDATE ON client_budget_divisions
  FOR EACH ROW EXECUTE FUNCTION _touch_client_budget_updated_at();
