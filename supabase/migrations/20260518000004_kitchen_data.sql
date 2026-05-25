-- ============================================
-- COZINHA (prefix 2)
-- ============================================
-- Padrão de custos:
--   Opções de escolha que implicam área (cerâmico, azulejo…)
--   têm formula = Q{indice_pergunta_numeric} que vem a seguir.
--   Opções de valor global (canalização, elétrica, etc.) têm fixed qty=1
--   com custos já calculados (material+labor agregados).

-- PERGUNTAS
INSERT INTO questions (index, text, type, required, help_text, order_index, parent_index, next_question_index) VALUES
('2.1',  'Qual é a área total da sua cozinha, em m²?',           'numeric', true, 'Use comprimento × largura. Ex: 4 m × 3 m = 12 m²',                  1,  NULL, '2.2'),
('2.2',  'Qual é o estado atual da cozinha?',                    'choice',  true, 'Escolha a opção que melhor descreve a situação.',                    2,  NULL, NULL),
('2.3',  'Quantos m² precisam de demolição?',                    'numeric', true, 'Se não tem a certeza, use a área total da cozinha.',                 3,  NULL, '2.4'),
('2.4',  'O que pretende fazer no pavimento?',                   'choice',  true, 'Pode sempre ajustar a escolha mais tarde no orçamento.',             4,  NULL, NULL),
('2.4.1','Quantos m² de pavimento cerâmico?',                    'numeric', true, 'Adicione 10% para compensar o desperdício de corte.',                5,  '2.4', '2.5'),
('2.4.2','Quantos m² de pavimento vinílico?',                    'numeric', true, 'Adicione 5% para compensar o desperdício.',                          6,  '2.4', '2.5'),
('2.5',  'O que pretende fazer nas paredes?',                    'choice',  true, 'A zona de confeção beneficia de proteção contra humidade.',          7,  NULL, NULL),
('2.5.1','Quantos m² de azulejo para as paredes?',               'numeric', true, 'Largura de cada parede × altura a azulejar.',                        8,  '2.5', '2.6'),
('2.5.2','Quantos m² de parede vai pintar?',                     'numeric', true, 'Some as áreas de todas as paredes a pintar.',                        9,  '2.5', '2.6'),
('2.6',  'O que pretende fazer no teto?',                        'choice',  true, 'O teto tem grande impacto visual no resultado final.',               10, NULL, NULL),
('2.6.1','Quantos m² de teto vai pintar?',                       'numeric', true, 'Normalmente igual à área total da cozinha.',                         11, '2.6', '2.7'),
('2.6.2','Quantos m² de teto falso (pladur)?',                   'numeric', true, 'Normalmente igual à área total da cozinha.',                         12, '2.6', '2.7'),
('2.7',  'O que vai ser feito na canalização de água?',          'choice',  true, 'Alterar a posição da pia implica obras adicionais.',                 13, NULL, NULL),
('2.8',  'O que vai ser feito na instalação elétrica?',          'choice',  true, 'A cozinha tem grande consumo elétrico — vale a pena planear bem.',  14, NULL, NULL),
('2.9',  'Pretende incluir mobiliário no orçamento?',            'choice',  true, 'O mobiliário representa geralmente 30–50% do custo total.',          15, NULL, NULL),
('2.10', 'Pretende incluir eletrodomésticos no orçamento?',      'choice',  true, 'Pode ajustar os preços unitários depois.',                           16, NULL, NULL);

-- OPÇÕES
INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'full_demolition',    'Demolição completa — retirar tudo',              '2.3', false, 1 FROM questions WHERE index = '2.2' UNION ALL
SELECT id, 'partial_renovation', 'Renovação parcial — retirar alguns elementos',   '2.3', false, 2 FROM questions WHERE index = '2.2' UNION ALL
SELECT id, 'just_finishing',     'Apenas acabamentos — sem demolição',              '2.4', false, 3 FROM questions WHERE index = '2.2';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',        'Manter o pavimento atual',  '2.5',   false, 1 FROM questions WHERE index = '2.4' UNION ALL
SELECT id, 'new_ceramic', 'Novo pavimento cerâmico',   '2.4.1', false, 2 FROM questions WHERE index = '2.4' UNION ALL
SELECT id, 'new_vinyl',   'Novo pavimento vinílico',   '2.4.2', false, 3 FROM questions WHERE index = '2.4';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',      'Manter as paredes',           '2.6',   false, 1 FROM questions WHERE index = '2.5' UNION ALL
SELECT id, 'new_tiles', 'Novos azulejos nas paredes',  '2.5.1', false, 2 FROM questions WHERE index = '2.5' UNION ALL
SELECT id, 'paint_only','Pintar as paredes',           '2.5.2', false, 3 FROM questions WHERE index = '2.5';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',          'Manter o teto',          '2.7',   false, 1 FROM questions WHERE index = '2.6' UNION ALL
SELECT id, 'paint',         'Pintar o teto',          '2.6.1', false, 2 FROM questions WHERE index = '2.6' UNION ALL
SELECT id, 'false_ceiling', 'Teto falso em pladur',   '2.6.2', false, 3 FROM questions WHERE index = '2.6';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep_existing',   'Manter a canalização',       '2.8', false, 1 FROM questions WHERE index = '2.7' UNION ALL
SELECT id, 'move_sink',       'Mudar o ponto de água',      '2.8', false, 2 FROM questions WHERE index = '2.7' UNION ALL
SELECT id, 'full_replumbing', 'Canalização nova de raiz',   '2.8', false, 3 FROM questions WHERE index = '2.7';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'keep',          'Manter a instalação elétrica',         '2.9', false, 1 FROM questions WHERE index = '2.8' UNION ALL
SELECT id, 'add_sockets',   'Acrescentar tomadas e pontos de luz',  '2.9', false, 2 FROM questions WHERE index = '2.8' UNION ALL
SELECT id, 'full_rewiring', 'Instalação elétrica nova',             '2.9', false, 3 FROM questions WHERE index = '2.8';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'not_included',     'Não incluir mobiliário',            '2.10', false, 1 FROM questions WHERE index = '2.9' UNION ALL
SELECT id, 'ikea_type',        'Móveis de linha (tipo IKEA)',       '2.10', false, 2 FROM questions WHERE index = '2.9' UNION ALL
SELECT id, 'custom_carpentry', 'Marcenaria de cozinha à medida',    '2.10', false, 3 FROM questions WHERE index = '2.9';

INSERT INTO options (question_id, value, label, next_question_index, is_final_answer, order_index)
SELECT id, 'not_included', 'Não incluir eletrodomésticos', NULL, true, 1 FROM questions WHERE index = '2.10' UNION ALL
SELECT id, 'basic',        'Gama básica',                  NULL, true, 2 FROM questions WHERE index = '2.10' UNION ALL
SELECT id, 'premium',      'Gama premium',                 NULL, true, 3 FROM questions WHERE index = '2.10';

-- REGRAS DE QUANTIDADE
INSERT INTO question_rules (option_id, rule_type, quantity_formula, description) VALUES
-- Demolição: qty = área demolição (Q2.3)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2' AND o.value='full_demolition'),   'formula', 'Q2.3',   'Área de demolição'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2' AND o.value='partial_renovation'),'formula', 'Q2.3',   'Área de demolição parcial'),
-- Pavimento: qty = área introduzida na pergunta seguinte
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_ceramic'),       'formula', 'Q2.4.1', 'Área de pavimento cerâmico'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_vinyl'),         'formula', 'Q2.4.2', 'Área de pavimento vinílico'),
-- Paredes
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='new_tiles'),         'formula', 'Q2.5.1', 'Área de azulejo'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='paint_only'),        'formula', 'Q2.5.2', 'Área de pintura'),
-- Teto
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='paint'),             'formula', 'Q2.6.1', 'Área de teto a pintar'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='false_ceiling'),     'formula', 'Q2.6.2', 'Área de teto falso'),
-- Canalização (custo global fixo)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='move_sink'),         'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='full_replumbing'),   'fixed', '1', NULL),
-- Elétrica (custo global fixo)
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='add_sockets'),       'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='full_rewiring'),     'fixed', '1', NULL),
-- Mobiliário
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='ikea_type'),         'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='custom_carpentry'),  'fixed', '1', NULL),
-- Eletrodomésticos
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='basic'),            'fixed', '1', NULL),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='premium'),          'fixed', '1', NULL);

-- CUSTOS
-- Material cerâmico = mosaico(20) + argamassa(3.38) + rejunte(1.10) = 24.48 /m²
-- Material vinílico = 18 /m²
-- Azulejo paredes: mosaico(22) + argamassa(3.38) + rejunte(1.10) = 26.48 /m²
-- Pintura: primário(0.88) + tinta(2.20) = 3.08 /m²
-- Pladur: material 12, labor 13 /m²
-- Canalização move_sink: material=pvc(3×3.20)+cobre(5×6.50)=42.10, labor=8h×35=280
-- Canalização nova: material=pvc(10×3.20)+cobre(15×6.50)=129.50, labor=24h×35=840
-- Elétrica add: material=cabo(15×1.10)+caixas(2×8)+tomadas(4×6)=56.50, labor=8h×35=280
-- Elétrica nova: material=cabo(40×1.10)+caixas(6×8)+tomadas(10×6)=152, labor=24h×35=840
-- IKEA: material=3500, labor=8h×30=240
-- Custom: material=8000, labor=40h×30=1200
INSERT INTO costs (option_id, cost_type, value, description) VALUES
-- Demolição
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2' AND o.value='full_demolition'),    'labor',    12.00, 'Demolição e remoção de entulho'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2' AND o.value='partial_renovation'), 'labor',    12.00, 'Demolição e remoção de entulho'),
-- Pavimento cerâmico
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_ceramic'), 'material', 24.48, 'Mosaico + argamassa + rejunte /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_ceramic'), 'labor',    18.00, 'Assentamento de mosaico /m²'),
-- Pavimento vinílico
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_vinyl'), 'material', 18.00, 'Pavimento vinílico /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4' AND o.value='new_vinyl'), 'labor',    14.00, 'Aplicação de vinílico /m²'),
-- Azulejo paredes
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='new_tiles'), 'material', 26.48, 'Azulejo + argamassa + rejunte /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='new_tiles'), 'labor',    18.00, 'Assentamento de azulejo /m²'),
-- Pintura paredes
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='paint_only'), 'material',  3.08, 'Primário + tinta interior /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5' AND o.value='paint_only'), 'labor',     8.00, 'Pintura de paredes /m²'),
-- Pintura teto
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='paint'), 'material',  3.08, 'Primário + tinta /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='paint'), 'labor',     8.00, 'Pintura de teto /m²'),
-- Teto falso pladur
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='false_ceiling'), 'material', 12.00, 'Pladur + estrutura metálica /m²'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6' AND o.value='false_ceiling'), 'labor',    13.00, 'Instalação de teto falso /m²'),
-- Canalização — mudar ponto
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='move_sink'), 'material',  42.10, 'Tubagem PVC + cobre (3ml+5ml)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='move_sink'), 'labor',    280.00, 'Canalizador 8h'),
-- Canalização nova de raiz
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='full_replumbing'), 'material', 129.50, 'Tubagem PVC + cobre (10ml+15ml)'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7' AND o.value='full_replumbing'), 'labor',    840.00, 'Canalizador 24h'),
-- Elétrica — acrescentar
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='add_sockets'), 'material',  56.50, 'Cabo + caixas + tomadas adicionais'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='add_sockets'), 'labor',    280.00, 'Eletricista 8h'),
-- Elétrica nova
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='full_rewiring'), 'material', 152.00, 'Cabo + caixas + tomadas completos'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8' AND o.value='full_rewiring'), 'labor',    840.00, 'Eletricista 24h'),
-- Mobiliário linha
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='ikea_type'), 'material', 3500.00, 'Móveis de cozinha de linha'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='ikea_type'), 'labor',     240.00, 'Montagem de móveis 8h'),
-- Marcenaria à medida
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='custom_carpentry'), 'material', 8000.00, 'Marcenaria de cozinha à medida'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9' AND o.value='custom_carpentry'), 'labor',    1200.00, 'Fabrico e montagem 40h'),
-- Eletrodomésticos
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='basic'),   'material', 1500.00, 'Fogão + exaustor + frigorífico + lava-louça gama básica'),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='premium'), 'material', 4000.00, 'Eletrodomésticos de topo');

-- ITENS DE ORÇAMENTO
INSERT INTO budget_items (option_id, description, category, order_index) VALUES
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2'  AND o.value='full_demolition'),    'Demolição e remoção de entulho',     'Demolição',          1),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.2'  AND o.value='partial_renovation'),  'Demolição e remoção de entulho',     'Demolição',          2),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4'  AND o.value='new_ceramic'),         'Pavimento Cerâmico',                  'Pavimento',          3),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.4'  AND o.value='new_vinyl'),           'Pavimento Vinílico',                  'Pavimento',          4),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5'  AND o.value='new_tiles'),           'Azulejo — paredes',                   'Paredes',            5),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.5'  AND o.value='paint_only'),          'Pintura de paredes',                  'Paredes',            6),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6'  AND o.value='paint'),               'Pintura de teto',                     'Teto',               7),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.6'  AND o.value='false_ceiling'),       'Teto falso em pladur',                'Teto',               8),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7'  AND o.value='move_sink'),           'Mudança de ponto de água',            'Canalização',        9),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.7'  AND o.value='full_replumbing'),     'Canalização nova de raiz',            'Canalização',       10),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8'  AND o.value='add_sockets'),         'Tomadas e pontos de luz adicionais',  'Instalação Elétrica',11),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.8'  AND o.value='full_rewiring'),       'Instalação elétrica nova',            'Instalação Elétrica',12),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9'  AND o.value='ikea_type'),           'Móveis de cozinha de linha',          'Mobiliário',        13),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.9'  AND o.value='custom_carpentry'),    'Marcenaria de cozinha à medida',      'Mobiliário',        14),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='basic'),               'Eletrodomésticos — gama básica',      'Eletrodomésticos',  15),
((SELECT o.id FROM options o JOIN questions q ON o.question_id=q.id WHERE q.index='2.10' AND o.value='premium'),             'Eletrodomésticos — gama premium',     'Eletrodomésticos',  16);
