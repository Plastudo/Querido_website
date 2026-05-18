/**
 * tokens.ts — Design System: Orçamentos de Obras
 *
 * Usar com styled-components, emotion, ou como referência
 * para className dinâmicos em React.
 */

export const colors = {
  primary:      'rgb(83, 74, 183)',
  primaryBg:    'rgba(83, 74, 183, 0.08)',
  primaryHover: 'rgb(70, 62, 160)',

  text: {
    primary:   'rgb(29, 29, 31)',
    secondary: 'rgba(29, 29, 31, 0.60)',
    tertiary:  'rgba(29, 29, 31, 0.45)',
    muted:     'rgba(29, 29, 31, 0.55)',
  },

  border: {
    card:   'rgba(0, 0, 0, 0.10)',
    subtle: 'rgba(29, 29, 31, 0.12)',
    input:  'rgba(0, 0, 0, 0.15)',
  },
} as const;

/**
 * Cada categoria tem:
 *  - bg: cor de fundo do contentor do ícone
 *  - icon: cor do stroke do SVG
 *  - label: nome em português
 *  - subtitle: descrição curta
 */
export const categories = [
  {
    id: 'cozinha',
    label: 'Cozinha',
    subtitle: 'Bancadas, armários, eletrodomésticos',
    bg: 'rgb(244, 239, 231)',
    icon: 'rgb(138, 106, 59)',
  },
  {
    id: 'casabanho',
    label: 'Casa de banho',
    subtitle: 'Loiça, azulejos, canalização',
    bg: 'rgb(234, 241, 244)',
    icon: 'rgb(63, 106, 130)',
  },
  {
    id: 'pintura',
    label: 'Pintura',
    subtitle: 'Paredes, tetos e acabamentos',
    bg: 'rgb(241, 235, 244)',
    icon: 'rgb(83, 74, 183)',
  },
  {
    id: 'pavimentos',
    label: 'Pavimentos',
    subtitle: 'Madeira, cerâmica, vinílico',
    bg: 'rgb(242, 238, 230)',
    icon: 'rgb(122, 90, 46)',
  },
  {
    id: 'eletricidade',
    label: 'Eletricidade',
    subtitle: 'Instalações e iluminação',
    bg: 'rgb(245, 240, 226)',
    icon: 'rgb(155, 122, 31)',
  },
  {
    id: 'canalizacao',
    label: 'Canalização',
    subtitle: 'Águas e esgotos',
    bg: 'rgb(232, 240, 238)',
    icon: 'rgb(63, 111, 98)',
  },
  {
    id: 'janelas',
    label: 'Janelas',
    subtitle: 'PVC, alumínio, vidros duplos',
    bg: 'rgb(236, 239, 244)',
    icon: 'rgb(79, 94, 120)',
  },
  {
    id: 'jardim',
    label: 'Jardim',
    subtitle: 'Relvado, rega e exterior',
    bg: 'rgb(236, 241, 232)',
    icon: 'rgb(90, 122, 69)',
  },
  {
    id: 'outros',
    label: 'Outros',
    subtitle: 'Conte-nos o que precisa',
    bg: 'rgb(241, 236, 236)',
    icon: 'rgb(122, 90, 90)',
  },
] as const;

export type CategoryId = typeof categories[number]['id'];

export const radius = {
  card:      '16px',
  icon:      '12px',
  button:    '12px',
  input:     '10px',
  badge:     '999px',
  badgeSm:   '3px',
  progress:  '2px',
} as const;

export const fontSize = {
  hero:       '56px',
  h1:         '40px',
  h2:         '24px',
  cardTitle:  '17px',
  body:       '19px',
  bodySm:     '16px',
  label:      '13.5px',
  badge:      '12.5px',
  footer:     '13px',
} as const;

export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  22: '88px',
} as const;

export const layout = {
  maxWidth:    '1040px',
  paddingX:    '120px',
  paddingXSm:  '24px',
  sectionPadY: '88px',
  cardGap:     '16px',
  cardPadding: '28px',
  iconSize:    '48px',
} as const;
