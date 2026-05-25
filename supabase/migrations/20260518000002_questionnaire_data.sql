-- ============================================
-- DADOS DO QUESTIONÁRIO - SALA/DIVISÃO GENÉRICA
-- ============================================

-- PERGUNTAS
INSERT INTO questions (index, text, type, required, help_text, order_index, parent_index) VALUES
('1.1',   'Queres aplicar pavimento?',                    'boolean', true, NULL, 1, NULL),
('1.1.1', 'Quantos m2?',                                  'numeric', true, 'Introduz a área em metros quadrados', 1, '1.1'),
('1.1.2', 'Que tipo de pavimento?',                       'choice',  true, 'Seleciona o material preferido', 2, '1.1'),
('1.2',   'Vais querer colocar rodapé?',                  'boolean', true, NULL, 3, NULL),
('1.2.1', 'Qual o Material do rodapé?',                   'choice',  true, 'Escolhe o tipo de material', 4, '1.2'),
('1.3',   'Queres aplicar revestimentos de paredes?',     'boolean', true, NULL, 5, NULL),
('1.3.1', 'Qual a altura do revestimento?',               'numeric', true, 'Altura em metros', 6, '1.3'),
('1.3.2', 'Qual o tipo de revestimento?',                 'choice',  true, 'Seleciona o material', 7, '1.3'),
('1.4',   'Vais mudar a Instalação elétrica + TV?',       'boolean', true, NULL, 8, NULL),
('1.5',   'Vais colocar porta na entrada da divisão?',    'boolean', true, NULL, 9, NULL),
('1.6',   'Vais intervir no teto?',                       'boolean', true, NULL, 10, NULL),
('1.6.1', 'Vais colocar teto falso?',                     'boolean', true, NULL, 11, '1.6'),
('1.6.2', 'Queres fazer sancas?',                         'choice',  true, 'Escolhe a opção desejada', 12, '1.6'),
('1.6.3', 'Que tipo de iluminação queres?',               'choice',  true, 'Seleciona o tipo de iluminação', 13, '1.6'),
('1.7',   'Queres considerar algum móvel de carpintaria?','boolean', true, NULL, 14, NULL),
('1.7.1', 'Que tipo de móvel queres considerar?',         'choice',  true, 'Escolhe o tipo de móvel', 15, '1.7');

-- OPÇÕES
-- Q1.1: Pavimento
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.1.1', false, 1 FROM questions WHERE index = '1.1'
UNION ALL
SELECT id, 'no',  'Não', '1.2',   false, 2 FROM questions WHERE index = '1.1';

-- Q1.1.2: Tipo de pavimento
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'ceramic',  'Cerâmico',  '1.2', false, 1 FROM questions WHERE index = '1.1.2'
UNION ALL
SELECT id, 'vinyl',    'Vinílico',  '1.2', false, 2 FROM questions WHERE index = '1.1.2'
UNION ALL
SELECT id, 'floating', 'Flutuante', '1.2', false, 3 FROM questions WHERE index = '1.1.2'
UNION ALL
SELECT id, 'wood',     'Madeira',   '1.2', false, 4 FROM questions WHERE index = '1.1.2';

-- Q1.2: Rodapé
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.2.1', false, 1 FROM questions WHERE index = '1.2'
UNION ALL
SELECT id, 'no',  'Não', '1.3',   false, 2 FROM questions WHERE index = '1.2';

-- Q1.2.1: Material do rodapé
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'pvc', 'PVC (Standard)', '1.3', false, 1 FROM questions WHERE index = '1.2.1'
UNION ALL
SELECT id, 'mdf', 'MDF Lacado',     '1.3', false, 2 FROM questions WHERE index = '1.2.1';

-- Q1.3: Revestimentos
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.3.1', false, 1 FROM questions WHERE index = '1.3'
UNION ALL
SELECT id, 'no',  'Não', '1.4',   false, 2 FROM questions WHERE index = '1.3';

-- Q1.3.2: Tipo de revestimento
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'ceramic', 'Cerâmico', '1.4', false, 1 FROM questions WHERE index = '1.3.2'
UNION ALL
SELECT id, 'paint',   'Pintar',   '1.4', false, 2 FROM questions WHERE index = '1.3.2';

-- Q1.4: Instalação elétrica
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.5', false, 1 FROM questions WHERE index = '1.4'
UNION ALL
SELECT id, 'no',  'Não', '1.5', false, 2 FROM questions WHERE index = '1.4';

-- Q1.5: Porta
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.6', false, 1 FROM questions WHERE index = '1.5'
UNION ALL
SELECT id, 'no',  'Não', '1.6', false, 2 FROM questions WHERE index = '1.5';

-- Q1.6: Teto
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.6.1', false, 1 FROM questions WHERE index = '1.6'
UNION ALL
SELECT id, 'no',  'Não', '1.7',   false, 2 FROM questions WHERE index = '1.6';

-- Q1.6.1: Teto falso
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.6.2', false, 1 FROM questions WHERE index = '1.6.1'
UNION ALL
SELECT id, 'no',  'Não', '1.6.2', false, 2 FROM questions WHERE index = '1.6.1';

-- Q1.6.2: Sancas
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim (com input de nº de paredes)', '1.6.3', false, 1 FROM questions WHERE index = '1.6.2'
UNION ALL
SELECT id, 'no',  'Não',                              '1.6.3', false, 2 FROM questions WHERE index = '1.6.2';

-- Q1.6.3: Iluminação
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'spots', 'Focos', '1.7', false, 1 FROM questions WHERE index = '1.6.3'
UNION ALL
SELECT id, 'led',   'Led',   '1.7', false, 2 FROM questions WHERE index = '1.6.3';

-- Q1.7: Móvel
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim', '1.7.1', false, 1 FROM questions WHERE index = '1.7'
UNION ALL
SELECT id, 'no',  'Não', NULL,    true,  2 FROM questions WHERE index = '1.7';

-- Q1.7.1: Tipo de móvel
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'tv_stand',     'Móvel baixo para a televisão', NULL, true, 1 FROM questions WHERE index = '1.7.1'
UNION ALL
SELECT id, 'closed_shelf', 'Estante fechada de 4 módulos', NULL, true, 2 FROM questions WHERE index = '1.7.1'
UNION ALL
SELECT id, 'open_shelf',   'Estante aberta de 4 módulos',  NULL, true, 3 FROM questions WHERE index = '1.7.1';

-- REGRAS DE QUANTIDADE
INSERT INTO question_rules (option_id, rule_type, quantity_formula, description) VALUES
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'pvc'), 'formula', 'sqrt(Q1.1.1)*4', 'Perímetro aproximado baseado na área'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'mdf'), 'formula', 'sqrt(Q1.1.1)*4', 'Perímetro aproximado baseado na área'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'ceramic'), 'formula', 'sqrt(Q1.1.1)*4*Q1.3.1', 'Área de revestimento = perímetro * altura'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'paint'),   'formula', 'sqrt(Q1.1.1)*4*Q1.3.1', 'Área de revestimento = perímetro * altura'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.2' AND o.value = 'yes'),     'formula', 'sqrt(Q1.1.1)*4*Q1.6.2', 'Perímetro total de sancas'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.4'   AND o.value = 'yes'),     'fixed',   '1', 'Instalação completa'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.5'   AND o.value = 'yes'),     'fixed',   '1', 'Uma porta'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.1' AND o.value = 'yes'),     'fixed',   '1', 'Teto falso completo'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'spots'),   'fixed',   '1', 'Focos de iluminação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'led'),     'fixed',   '1', 'Iluminação LED'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'tv_stand'),     'fixed', '1', 'Móvel baixo'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'closed_shelf'), 'fixed', '1', 'Estante fechada'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'open_shelf'),   'fixed', '1', 'Estante aberta');

-- CUSTOS
INSERT INTO costs (option_id, cost_type, value, description) VALUES
-- Pavimento - Cerâmico
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'ceramic'), 'material', 20.00, 'Cerâmica material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'ceramic'), 'labor',    25.00, 'Mão de obra aplicação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'ceramic'), 'overhead', 10.00, 'Custos indiretos'),
-- Pavimento - Vinílico
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'vinyl'), 'material', 25.00, 'Vinil material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'vinyl'), 'labor',    25.00, 'Mão de obra aplicação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'vinyl'), 'overhead', 10.00, 'Custos indiretos'),
-- Pavimento - Flutuante
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'floating'), 'material', 30.00, 'Pavimento flutuante material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'floating'), 'labor',    25.00, 'Mão de obra aplicação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'floating'), 'overhead', 10.00, 'Custos indiretos'),
-- Pavimento - Madeira
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'wood'), 'material', 45.00, 'Madeira material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'wood'), 'labor',    25.00, 'Mão de obra aplicação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'wood'), 'overhead', 10.00, 'Custos indiretos'),
-- Rodapé - PVC
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'pvc'), 'material',  5.00, 'PVC material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'pvc'), 'labor',    20.00, 'Mão de obra colocação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'pvc'), 'overhead',  5.00, 'Custos indiretos'),
-- Rodapé - MDF
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'mdf'), 'material', 10.00, 'MDF material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'mdf'), 'labor',    20.00, 'Mão de obra colocação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'mdf'), 'overhead',  5.00, 'Custos indiretos'),
-- Revestimentos - Cerâmico
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'ceramic'), 'material',  10.00, 'Cerâmica material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'ceramic'), 'labor',    500.00, 'Mão de obra aplicação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'ceramic'), 'overhead',  40.00, 'Custos indiretos'),
-- Revestimentos - Pintura
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'paint'), 'material',   3.00, 'Tinta material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'paint'), 'labor',    500.00, 'Mão de obra pintura'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'paint'), 'overhead',  40.00, 'Custos indiretos'),
-- Instalação elétrica
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.4' AND o.value = 'yes'), 'material', 150.00, 'Materiais elétricos'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.4' AND o.value = 'yes'), 'labor',    200.00, 'Mão de obra instalação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.4' AND o.value = 'yes'), 'overhead',  30.00, 'Custos indiretos'),
-- Porta
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.5' AND o.value = 'yes'), 'material', 250.00, 'Porta + ferragens'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.5' AND o.value = 'yes'), 'labor',     30.00, 'Mão de obra colocação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.5' AND o.value = 'yes'), 'overhead',  10.00, 'Custos indiretos'),
-- Teto falso
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.1' AND o.value = 'yes'), 'material', 200.00, 'Materiais teto falso'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.1' AND o.value = 'yes'), 'labor',    300.00, 'Mão de obra colocação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.1' AND o.value = 'yes'), 'overhead',  50.00, 'Custos indiretos'),
-- Sancas
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.2' AND o.value = 'yes'), 'material',  50.00, 'Materiais sancas'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.2' AND o.value = 'yes'), 'labor',    150.00, 'Mão de obra sancas'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.2' AND o.value = 'yes'), 'overhead',  20.00, 'Custos indiretos'),
-- Iluminação - Focos
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'spots'), 'material', 150.00, 'Focos material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'spots'), 'labor',     70.00, 'Mão de obra instalação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'spots'), 'overhead',  20.00, 'Custos indiretos'),
-- Iluminação - LED
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'led'), 'material', 100.00, 'LED material'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'led'), 'labor',     70.00, 'Mão de obra instalação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'led'), 'overhead',  20.00, 'Custos indiretos'),
-- Móvel - TV Stand
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'tv_stand'), 'material', 300.00, 'Materiais móvel'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'tv_stand'), 'labor',    100.00, 'Mão de obra fabricação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'tv_stand'), 'overhead',  40.00, 'Custos indiretos'),
-- Móvel - Estante Fechada
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'closed_shelf'), 'material', 500.00, 'Materiais móvel'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'closed_shelf'), 'labor',    150.00, 'Mão de obra fabricação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'closed_shelf'), 'overhead',  40.00, 'Custos indiretos'),
-- Móvel - Estante Aberta
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'open_shelf'), 'material', 400.00, 'Materiais móvel'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'open_shelf'), 'labor',    100.00, 'Mão de obra fabricação'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'open_shelf'), 'overhead',  40.00, 'Custos indiretos');

-- ITENS DE ORÇAMENTO
INSERT INTO budget_items (option_id, description, category, order_index) VALUES
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'ceramic'),       'Revestimento de Pavimentos - Cerâmico', 'Pavimentos',   1),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'vinyl'),         'Revestimento de Pavimentos - Vinílico',  'Pavimentos',   2),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'floating'),      'Revestimento de Pavimentos - Flutuante', 'Pavimentos',   3),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.1.2' AND o.value = 'wood'),          'Revestimento de Pavimentos - Madeira',   'Pavimentos',   4),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'pvc'),           'Rodapé - PVC',                           'Acabamentos',  5),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.2.1' AND o.value = 'mdf'),           'Rodapé - MDF Lacado',                    'Acabamentos',  6),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'ceramic'),       'Revestimento de Paredes - Cerâmico',     'Revestimentos',7),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.3.2' AND o.value = 'paint'),         'Revestimento de Paredes - Pintura',      'Revestimentos',8),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.4'   AND o.value = 'yes'),           'Instalação Elétrica + TV',               'Instalações',  9),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.5'   AND o.value = 'yes'),           'Portas',                                 'Acabamentos', 10),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.1' AND o.value = 'yes'),           'Teto Falso',                             'Estrutura',   11),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.2' AND o.value = 'yes'),           'Sanca Teto',                             'Estrutura',   12),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'spots'),         'Iluminação Teto - Focos',                'Iluminação',  13),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.6.3' AND o.value = 'led'),           'Iluminação Teto - LEDs',                 'Iluminação',  14),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'tv_stand'),      'Móvel Baixo para Televisão',             'Carpintaria',  15),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'closed_shelf'),  'Estante Fechada 4 Módulos',              'Carpintaria',  16),
((SELECT o.id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.index = '1.7.1' AND o.value = 'open_shelf'),    'Estante Aberta 4 Módulos',               'Carpintaria',  17);
