-- Tabela de divisões gerida pelo admin (substitui array estático em tokens.ts)
CREATE TABLE divisions (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  prefix      TEXT UNIQUE,               -- null = sem questionário ainda
  label       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  icon_type   TEXT NOT NULL DEFAULT 'outros',
  bg_color    TEXT NOT NULL DEFAULT 'rgb(241, 236, 236)',
  icon_color  TEXT NOT NULL DEFAULT 'rgb(122, 90, 90)',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_divisions_order ON divisions(order_index);
CREATE INDEX idx_divisions_prefix ON divisions(prefix);

-- Dados iniciais (espelham tokens.ts)
INSERT INTO divisions (prefix, label, subtitle, icon_type, bg_color, icon_color, is_active, order_index) VALUES
('1',  'Sala',         'Pavimentos, revestimentos, carpintaria', 'sala',         'rgb(238, 236, 230)', 'rgb(100, 85, 55)',   true, 1),
('2',  'Cozinha',      'Bancadas, armários, eletrodomésticos',   'cozinha',      'rgb(244, 239, 231)', 'rgb(138, 106, 59)', true, 2),
('3',  'Casa de banho','Loiça, azulejos, canalização',           'casabanho',    'rgb(234, 241, 244)', 'rgb(63, 106, 130)', true, 3),
(null, 'Pintura',      'Paredes, tetos e acabamentos',           'pintura',      'rgb(241, 235, 244)', 'rgb(83, 74, 183)',  true, 4),
(null, 'Pavimentos',   'Madeira, cerâmica, vinílico',            'pavimentos',   'rgb(242, 238, 230)', 'rgb(122, 90, 46)',  true, 5),
(null, 'Eletricidade', 'Instalações e iluminação',               'eletricidade', 'rgb(245, 240, 226)', 'rgb(155, 122, 31)', true, 6),
(null, 'Canalização',  'Águas e esgotos',                        'canalizacao',  'rgb(232, 240, 238)', 'rgb(63, 111, 98)',  true, 7),
(null, 'Janelas',      'PVC, alumínio, vidros duplos',           'janelas',      'rgb(236, 239, 244)', 'rgb(79, 94, 120)',  true, 8),
(null, 'Jardim',       'Relvado, rega e exterior',               'jardim',       'rgb(236, 241, 232)', 'rgb(90, 122, 69)',  true, 9),
(null, 'Outros',       'Conte-nos o que precisa',                'outros',       'rgb(241, 236, 236)', 'rgb(122, 90, 90)',  true, 10);
