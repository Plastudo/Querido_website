-- ── Bug #1: Add multi_choice type to questions ─────────────────────────────────
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('boolean', 'numeric', 'choice', 'multi_choice', 'text'));

-- ── Bug #2: Add unit column to questions ────────────────────────────────────────
ALTER TABLE questions ADD COLUMN IF NOT EXISTS unit TEXT
  CHECK (unit IN ('m2', 'ml', 'un', 'vg', 'm3') OR unit IS NULL);

-- ── Improvement #2: Add addon fields to options ──────────────────────────────────
ALTER TABLE options ADD COLUMN IF NOT EXISTS is_addon BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE options ADD COLUMN IF NOT EXISTS addon_info TEXT;

-- ── Feedback: Add status column ──────────────────────────────────────────────────
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
  CHECK (status IN ('open', 'fixed_pending_validation', 'validated'));
