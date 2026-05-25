-- Adiciona next_question_index às perguntas para guiar
-- questões numeric/text sem depender da lógica de irmãos.
ALTER TABLE questions ADD COLUMN next_question_index TEXT;
CREATE INDEX idx_questions_q_next ON questions(next_question_index);
