import React from 'react';

export const ICON_TYPES = [
  'sala', 'cozinha', 'casabanho', 'pintura', 'pavimentos',
  'eletricidade', 'canalizacao', 'janelas', 'jardim', 'outros',
  'quarto', 'escritorio', 'garagem', 'corredor',
] as const;

export type IconType = typeof ICON_TYPES[number];

export const ICON_LABELS: Record<string, string> = {
  sala: 'Sala', cozinha: 'Cozinha', casabanho: 'Casa de banho',
  pintura: 'Pintura', pavimentos: 'Pavimentos', eletricidade: 'Eletricidade',
  canalizacao: 'Canalização', janelas: 'Janelas', jardim: 'Jardim',
  outros: 'Outros', quarto: 'Quarto', escritorio: 'Escritório',
  garagem: 'Garagem', corredor: 'Corredor',
};

export const ICON_PATHS: Record<string, React.ReactNode> = {
  sala: (
    <>
      <path d="M3 13v4h18v-4" />
      <path d="M3 13a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3" />
      <path d="M7 10V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      <path d="M5 17v2M19 17v2" />
    </>
  ),
  cozinha: (
    <>
      <path d="M6 2v4M12 2v4M18 2v4" />
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 11h18" />
    </>
  ),
  casabanho: (
    <>
      <path d="M4 12h16a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2z" />
      <path d="M6 12V5a2 2 0 0 1 2-2h1" />
      <circle cx="10" cy="5" r="1" />
    </>
  ),
  pintura: (
    <>
      <path d="M3 21v-3l11-11 3 3L6 21H3z" />
      <path d="M14.5 6.5l3 3" />
      <path d="M16 2l6 6-2 2" />
    </>
  ),
  pavimentos: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  eletricidade: (
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  ),
  canalizacao: (
    <>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3c.5 3.5 3 4.06 3 7 0 2.5-2 4-3.5 4" />
    </>
  ),
  janelas: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 12h18M12 3v18" />
    </>
  ),
  jardim: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  outros: (
    <>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </>
  ),
  quarto: (
    <>
      <path d="M3 7v11M21 7v11" />
      <path d="M3 18h18" />
      <path d="M3 11h18" />
      <path d="M7 11V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
    </>
  ),
  escritorio: (
    <>
      <rect x="2" y="3" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  garagem: (
    <>
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
      <circle cx="9" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  corredor: (
    <>
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4.562v16.157a1 1 0 0 1-1.154.985L3 20V5.562a2 2 0 0 1 1.516-1.944l6-1.5a2 2 0 0 1 2.484 1.944z" />
    </>
  ),
};
