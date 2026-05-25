-- ============================================
-- ESTRUTURA NORMALIZADA - QUESTIONÁRIO & ORÇAMENTO
-- ============================================

CREATE TABLE questions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  index TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('boolean', 'numeric', 'choice', 'text')),
  required BOOLEAN DEFAULT true,
  help_text TEXT,
  order_index INT,
  parent_index TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  next_question_index TEXT,
  is_final_answer BOOLEAN DEFAULT false,
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, value)
);

CREATE TABLE question_rules (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed', 'formula', 'conditional')),
  quantity_formula TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE costs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('material', 'labor', 'overhead')),
  value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_questions_index ON questions(index);
CREATE INDEX idx_questions_parent ON questions(parent_index);
CREATE INDEX idx_options_question ON options(question_id);
CREATE INDEX idx_options_next ON options(next_question_index);
CREATE INDEX idx_question_rules_option ON question_rules(option_id);
CREATE INDEX idx_costs_option ON costs(option_id);
CREATE INDEX idx_budget_items_option ON budget_items(option_id);

-- Vista: pergunta + opções + custos
CREATE VIEW question_with_options AS
SELECT
  q.id AS question_id,
  q.index,
  q.text AS question_text,
  q.type,
  q.required,
  q.help_text,
  o.id AS option_id,
  o.value AS option_value,
  o.label AS option_label,
  o.next_question_index,
  o.is_final_answer,
  STRING_AGG(c.cost_type || ':' || c.value::TEXT, ', ') AS costs
FROM questions q
LEFT JOIN options o ON q.id = o.question_id
LEFT JOIN costs c ON o.id = c.option_id
GROUP BY q.id, q.index, q.text, q.type, q.required, q.help_text,
         o.id, o.value, o.label, o.next_question_index, o.is_final_answer;

-- Vista: fluxo completo de uma resposta
CREATE VIEW answer_flow AS
SELECT
  o.id AS option_id,
  q.index AS from_question,
  q.text AS question_text,
  o.value AS option_value,
  o.label AS option_label,
  o.next_question_index AS next_question,
  qr.rule_type,
  qr.quantity_formula,
  bi.description AS budget_description
FROM options o
JOIN questions q ON o.question_id = q.id
LEFT JOIN question_rules qr ON o.id = qr.option_id
LEFT JOIN budget_items bi ON o.id = bi.option_id;
