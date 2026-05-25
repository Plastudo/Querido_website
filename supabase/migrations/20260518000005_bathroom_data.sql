-- ============================================
-- CASA DE BANHO (prefix 3)
-- ============================================
-- Notas de custo:
--   Paredes partial_tiles_paint: custos = média 50% azulejo + 50% pintura
--     material = (26.48×0.5 + 3.08×0.5) = 14.78 /m² (do total da parede)
--     labor    = (18×0.5 + 8×0.5)       = 13.00 /m²
--   Canalização move_points: pvc(3×3.20)+cobre(5×6.50)=42.10 material, 8h×35=280 labor
--   Canalização nova: pvc(8×3.20)+cobre(12×6.50)=103.60 material, 20h×35=700 labor
--   Elétrica toalheiro: toalheiro(180)+cabo(5×1.10)=185.50 material, 3h×35=105 labor
--   Elétrica nova: cabo(30×1.10)+caixas(5×8)+tomadas(4×6)=97 material, 16h×35=560 labor

-- PERGUNTAS
INSERT INTO questions (index, text, type, required, help_text, order_index, parent_index, next_question_index) VALUES
('3.1',   'Qual é a área total da casa de banho, em m²?',     'numeric', true, 'Use comprimento × largura. Ex: 2,5 m × 2 m = 5 m²',             1,  NULL,  '3.2'),
('3.2',   'Qual é o estado atual da casa de banho?',          'choice',  true, 'Escolha a opção que melhor descreve a situação.',                2,  NULL,  NULL),
('3.3',   'Quantos m² precisam de demolição?',                'numeric', true, 'Se não tem a certeza, use a área total da casa de banho.',       3,  NULL,  '3.4'),
('3.4',   'O que pretende fazer no pavimento?',               'choice',  true, 'Cerâmico é o mais recomendado pela durabilidade.',               4,  NULL,  NULL),
('3.4.1', 'Quantos m² de pavimento cerâmico?',                'numeric', true, 'Adicione 10% para compensar o desperdício.',                     5,  '3.4', '3.5'),
('3.5',   'O que pretende fazer nas paredes?',                'choice',  true, 'A cobertura total oferece máxima proteção.',                     6,  NULL,  NULL),
('3.5.1', 'Quantos m² de parede?',                            'numeric', true, 'Some: largura de cada parede × altura total (≈2,4 m).',          7,  '3.5', '3.6'),
('3.6',   'O que pretende fazer com as louças sanitárias?',   'choice',  true, 'Inclui sanita, lavatório, duche e banheira.',                    8,  NULL,  NULL),
('3.6.1', 'Prefere duche ou banheira?',                       'choice',  true, NULL,                                                             9,  '3.6', NULL),
('3.6.2', 'Pretende substituir a sanita?',                    'boolean', true, NULL,                                                             10, '3.6', NULL),
('3.6.3', 'Pretende substituir o lavatório?',                 'boolean', true, NULL,                                                             11, '3.6', NULL),
('3.6.4', 'O que pretende fazer com o duche ou banheira?',    'choice',  true, NULL,                                                             12, '3.6', NULL),
('3.7',   'O que vai ser feito na canalização de água?',      'choice',  true, 'Mover louças implica obras adicionais.',                         13, NULL,  NULL),
('3.8',   'O que vai ser feito na instalação elétrica?',      'choice',  true, 'Toda a instalação deve ser certificada IP44 ou superior.',       14, NULL,  NULL),
('3.9',   'Como está a ventilação da casa de banho?',         'choice',  true, 'A ventilação adequada é essencial para evitar humidade.',        15, NULL,  NULL);

-- OPÇÕES
-- Q3.2 Estado
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'full_demolition',    'Demolição completa — retirar tudo',            '3.3', false, 1 FROM questions WHERE index = '3.2' UNION ALL
SELECT id, 'partial_renovation', 'Renovação parcial — retirar alguns elementos', '3.3', false, 2 FROM questions WHERE index = '3.2' UNION ALL
SELECT id, 'just_finishing',     'Apenas acabamentos — sem demolição',            '3.4', false, 3 FROM questions WHERE index = '3.2';

-- Q3.4 Pavimento
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',        'Manter o pavimento atual', '3.5',   false, 1 FROM questions WHERE index = '3.4' UNION ALL
SELECT id, 'new_ceramic', 'Novo pavimento cerâmico',  '3.4.1', false, 2 FROM questions WHERE index = '3.4';

-- Q3.5 Paredes
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',                'Manter as paredes',                   '3.6',   false, 1 FROM questions WHERE index = '3.5' UNION ALL
SELECT id, 'full_tiles',          'Azulejos do chão ao teto',            '3.5.1', false, 2 FROM questions WHERE index = '3.5' UNION ALL
SELECT id, 'partial_tiles_paint', 'Azulejos até meia parede + pintura',  '3.5.1', false, 3 FROM questions WHERE index = '3.5';

-- Q3.6 Louças
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep_all',           'Manter tudo',                  '3.7',   false, 1 FROM questions WHERE index = '3.6' UNION ALL
SELECT id, 'replace_all',        'Substituir tudo',               '3.6.1', false, 2 FROM questions WHERE index = '3.6' UNION ALL
SELECT id, 'replace_partially',  'Substituir algumas peças',      '3.6.2', false, 3 FROM questions WHERE index = '3.6';

-- Q3.6.1 Duche ou banheira (para replace_all)
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'shower_tray', 'Duche (base + painéis de vidro)', '3.7', false, 1 FROM questions WHERE index = '3.6.1' UNION ALL
SELECT id, 'bathtub',     'Banheira',                         '3.7', false, 2 FROM questions WHERE index = '3.6.1';

-- Q3.6.2 Substituir sanita
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim, substituir a sanita',     '3.6.3', false, 1 FROM questions WHERE index = '3.6.2' UNION ALL
SELECT id, 'no',  'Não, manter a sanita atual',   '3.6.3', false, 2 FROM questions WHERE index = '3.6.2';

-- Q3.6.3 Substituir lavatório
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'yes', 'Sim, substituir o lavatório',    '3.6.4', false, 1 FROM questions WHERE index = '3.6.3' UNION ALL
SELECT id, 'no',  'Não, manter o lavatório atual',  '3.6.4', false, 2 FROM questions WHERE index = '3.6.3';

-- Q3.6.4 Duche/banheira (para replace_partially)
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',        'Manter o duche / banheira', '3.7', false, 1 FROM questions WHERE index = '3.6.4' UNION ALL
SELECT id, 'shower_tray', 'Novo duche',                 '3.7', false, 2 FROM questions WHERE index = '3.6.4' UNION ALL
SELECT id, 'bathtub',     'Nova banheira',               '3.7', false, 3 FROM questions WHERE index = '3.6.4';

-- Q3.7 Canalização
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',            'Manter a canalização',       '3.8', false, 1 FROM questions WHERE index = '3.7' UNION ALL
SELECT id, 'move_points',     'Mudar alguns pontos de água','3.8', false, 2 FROM questions WHERE index = '3.7' UNION ALL
SELECT id, 'full_replumbing', 'Canalização nova de raiz',   '3.8', false, 3 FROM questions WHERE index = '3.7';

-- Q3.8 Elétrica
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',           'Manter a instalação elétrica',   '3.9', false, 1 FROM questions WHERE index = '3.8' UNION ALL
SELECT id, 'add_towel_rail', 'Instalar toalheiro elétrico',    '3.9', false, 2 FROM questions WHERE index = '3.8' UNION ALL
SELECT id, 'full_rewiring',  'Instalação elétrica nova',       '3.9', false, 3 FROM questions WHERE index = '3.8';

-- Q3.9 Ventilação
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'existing',      'Já tem ventilação suficiente', NULL, true, 1 FROM questions WHERE index = '3.9' UNION ALL
SELECT id, 'add_extractor', 'Instalar extrator de ar novo', NULL, true, 2 FROM questions WHERE index = '3.9';

-- REGRAS DE QUANTIDADE
INSERT INTO question_rules (option_id, rule_type, quantity_formula, description) VALUES
-- Demolição
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2' AND o.value='full_demolition'),    'formula', 'Q3.3',   'Área de demolição'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2' AND o.value='partial_renovation'), 'formula', 'Q3.3',   'Área de demolição parcial'),
-- Pavimento
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.4' AND o.value='new_ceramic'),        'formula', 'Q3.4.1', 'Área de pavimento cerâmico'),
-- Paredes
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='full_tiles'),         'formula', 'Q3.5.1', 'Área total de parede'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='partial_tiles_paint'),'formula', 'Q3.5.1', 'Área total de parede (50% azulejo + 50% pintura)'),
-- Louças — fixed
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6'   AND o.value='replace_all'),        'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='shower_tray'),        'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='bathtub'),            'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.2' AND o.value='yes'),               'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.3' AND o.value='yes'),               'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='shower_tray'),       'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='bathtub'),           'fixed', '1', NULL),
-- Canalização
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='move_points'),         'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='full_replumbing'),     'fixed', '1', NULL),
-- Elétrica
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='add_towel_rail'),      'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='full_rewiring'),       'fixed', '1', NULL),
-- Ventilação
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.9' AND o.value='add_extractor'),       'fixed', '1', NULL);

-- CUSTOS
INSERT INTO costs (option_id, cost_type, value, description) VALUES
-- Demolição
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2' AND o.value='full_demolition'),    'labor',   12.00, 'Demolição e remoção /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2' AND o.value='partial_renovation'), 'labor',   12.00, 'Demolição e remoção /m²'),
-- Pavimento cerâmico
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.4' AND o.value='new_ceramic'), 'material', 24.48, 'Mosaico + argamassa + rejunte /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.4' AND o.value='new_ceramic'), 'labor',    18.00, 'Assentamento /m²'),
-- Paredes azulejo total
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='full_tiles'), 'material', 26.48, 'Azulejo + argamassa + rejunte /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='full_tiles'), 'labor',    18.00, 'Assentamento /m²'),
-- Paredes azulejo + pintura (metade cada)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='partial_tiles_paint'), 'material', 14.78, 'Azulejo+argamassa (50%) + primário+tinta (50%) /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5' AND o.value='partial_tiles_paint'), 'labor',    13.00, 'Assentamento 50% + pintura 50% /m²'),
-- Louças replace_all: sanita(280)+lavatório(180)=460 material, labor(150+120)=270
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6' AND o.value='replace_all'), 'material', 460.00, 'Sanita com autoclismo + lavatório'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6' AND o.value='replace_all'), 'labor',    270.00, 'Instalação sanita + lavatório'),
-- Duche (3.6.1)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='shower_tray'), 'material', 450.00, 'Base de duche + painéis de vidro'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='shower_tray'), 'labor',    250.00, 'Instalação de duche'),
-- Banheira (3.6.1)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='bathtub'), 'material', 500.00, 'Banheira'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='bathtub'), 'labor',    250.00, 'Instalação de banheira'),
-- Sanita (3.6.2 yes)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.2' AND o.value='yes'), 'material', 280.00, 'Sanita com autoclismo'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.2' AND o.value='yes'), 'labor',    150.00, 'Instalação de sanita'),
-- Lavatório (3.6.3 yes)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.3' AND o.value='yes'), 'material', 180.00, 'Lavatório com coluna ou suspenso'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.3' AND o.value='yes'), 'labor',    120.00, 'Instalação de lavatório'),
-- Duche (3.6.4)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='shower_tray'), 'material', 450.00, 'Base de duche + painéis de vidro'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='shower_tray'), 'labor',    250.00, 'Instalação de duche'),
-- Banheira (3.6.4)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='bathtub'), 'material', 500.00, 'Banheira'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='bathtub'), 'labor',    250.00, 'Instalação de banheira'),
-- Canalização move_points
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='move_points'),     'material',  42.10, 'Tubagem PVC + cobre (3ml+5ml)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='move_points'),     'labor',    280.00, 'Canalizador 8h'),
-- Canalização nova
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='full_replumbing'), 'material', 103.60, 'Tubagem PVC + cobre (8ml+12ml)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7' AND o.value='full_replumbing'), 'labor',    700.00, 'Canalizador 20h'),
-- Toalheiro elétrico
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='add_towel_rail'), 'material', 185.50, 'Toalheiro(180) + cabo(5×1.10)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='add_towel_rail'), 'labor',    105.00, 'Eletricista 3h'),
-- Elétrica nova
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='full_rewiring'), 'material',  97.00, 'Cabo(30×1.10)+caixas(5×8)+tomadas(4×6)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8' AND o.value='full_rewiring'), 'labor',    560.00, 'Eletricista 16h'),
-- Extrator
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.9' AND o.value='add_extractor'), 'material',  85.00, 'Extrator de ar para casa de banho'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.9' AND o.value='add_extractor'), 'labor',     70.00, 'Eletricista 2h');

-- ITENS DE ORÇAMENTO
INSERT INTO budget_items (option_id, description, category, order_index) VALUES
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2'   AND o.value='full_demolition'),    'Demolição e remoção de entulho',       'Demolição',          1),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.2'   AND o.value='partial_renovation'), 'Demolição e remoção de entulho',       'Demolição',          2),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.4'   AND o.value='new_ceramic'),        'Pavimento Cerâmico',                    'Pavimento',          3),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5'   AND o.value='full_tiles'),         'Azulejo — paredes (chão ao teto)',      'Paredes',            4),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.5'   AND o.value='partial_tiles_paint'),'Azulejo + Pintura — paredes',           'Paredes',            5),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6'   AND o.value='replace_all'),        'Sanita + Lavatório novos',              'Louças Sanitárias',  6),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='shower_tray'),        'Base de duche + painéis de vidro',      'Louças Sanitárias',  7),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.1' AND o.value='bathtub'),            'Banheira',                              'Louças Sanitárias',  8),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.2' AND o.value='yes'),               'Sanita com autoclismo',                 'Louças Sanitárias',  9),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.3' AND o.value='yes'),               'Lavatório',                             'Louças Sanitárias', 10),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='shower_tray'),       'Base de duche + painéis de vidro',      'Louças Sanitárias', 11),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.6.4' AND o.value='bathtub'),           'Banheira',                              'Louças Sanitárias', 12),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7'   AND o.value='move_points'),       'Mudança de pontos de água',             'Canalização',       13),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.7'   AND o.value='full_replumbing'),   'Canalização nova de raiz',              'Canalização',       14),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8'   AND o.value='add_towel_rail'),    'Toalheiro elétrico + instalação',       'Instalação Elétrica',15),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.8'   AND o.value='full_rewiring'),     'Instalação elétrica nova',              'Instalação Elétrica',16),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='3.9'   AND o.value='add_extractor'),     'Extrator de ar',                        'Ventilação',        17);
