import type { RegionalPrices, Region, PriceEntry } from '../types';

// ─── Price database ───────────────────────────────────────────────────────────
// All prices in EUR, 2024/2025 Portuguese market values.
// Regional premiums:
//   Centro    → Norte + 5–10 %
//   LisboaSul → Norte + 15–20 %

export const PRICES: Record<string, RegionalPrices> = {

  // ── Materials ──────────────────────────────────────────────────────────────

  ceramic_floor_tile: {
    Norte:     { min: 12.00, avg: 20.00, max: 32.00 },
    Centro:    { min: 13.00, avg: 21.50, max: 34.00 },
    LisboaSul: { min: 14.00, avg: 23.50, max: 38.00 },
  },

  wall_tile: {
    Norte:     { min: 14.00, avg: 22.00, max: 35.00 },
    Centro:    { min: 15.00, avg: 23.50, max: 37.50 },
    LisboaSul: { min: 16.50, avg: 26.00, max: 42.00 },
  },

  grout: {
    Norte:     { min: 1.50, avg: 2.20, max: 3.50 },
    Centro:    { min: 1.60, avg: 2.40, max: 3.70 },
    LisboaSul: { min: 1.80, avg: 2.60, max: 4.20 },
  },

  tile_adhesive: {
    Norte:     { min: 0.50, avg: 0.75, max: 1.10 },
    Centro:    { min: 0.55, avg: 0.80, max: 1.20 },
    LisboaSul: { min: 0.60, avg: 0.90, max: 1.30 },
  },

  cement: {
    Norte:     { min: 0.14, avg: 0.18, max: 0.25 },
    Centro:    { min: 0.15, avg: 0.19, max: 0.27 },
    LisboaSul: { min: 0.16, avg: 0.21, max: 0.30 },
  },

  sand: {
    Norte:     { min: 22.00, avg: 32.00, max: 45.00 },
    Centro:    { min: 24.00, avg: 34.00, max: 48.00 },
    LisboaSul: { min: 26.00, avg: 38.00, max: 54.00 },
  },

  plasterboard: {
    Norte:     { min:  5.50, avg:  8.00, max: 12.00 },
    Centro:    { min:  5.80, avg:  8.60, max: 13.00 },
    LisboaSul: { min:  6.50, avg:  9.50, max: 14.50 },
  },

  paint_interior: {
    Norte:     { min: 3.00, avg: 5.50, max:  9.00 },
    Centro:    { min: 3.20, avg: 5.90, max:  9.60 },
    LisboaSul: { min: 3.50, avg: 6.50, max: 10.50 },
  },

  primer: {
    Norte:     { min: 2.00, avg: 3.50, max: 5.50 },
    Centro:    { min: 2.20, avg: 3.80, max: 5.80 },
    LisboaSul: { min: 2.50, avg: 4.20, max: 6.50 },
  },

  wood_flooring: {
    Norte:     { min: 20.00, avg: 35.00, max: 60.00 },
    Centro:    { min: 21.00, avg: 37.50, max: 64.00 },
    LisboaSul: { min: 23.00, avg: 41.00, max: 72.00 },
  },

  vinyl_flooring: {
    Norte:     { min: 10.00, avg: 18.00, max: 28.00 },
    Centro:    { min: 11.00, avg: 19.50, max: 30.00 },
    LisboaSul: { min: 12.00, avg: 21.00, max: 34.00 },
  },

  pvc_pipe_50mm: {
    Norte:     { min: 2.00, avg: 3.20, max:  4.50 },
    Centro:    { min: 2.20, avg: 3.40, max:  4.80 },
    LisboaSul: { min: 2.40, avg: 3.80, max:  5.40 },
  },

  copper_pipe_15mm: {
    Norte:     { min: 4.00, avg:  6.50, max: 10.00 },
    Centro:    { min: 4.30, avg:  7.00, max: 10.70 },
    LisboaSul: { min: 4.70, avg:  7.70, max: 12.00 },
  },

  electrical_cable_2_5mm: {
    Norte:     { min: 0.70, avg: 1.10, max: 1.60 },
    Centro:    { min: 0.75, avg: 1.20, max: 1.70 },
    LisboaSul: { min: 0.85, avg: 1.35, max: 1.95 },
  },

  electrical_box: {
    Norte:     { min:  5.00, avg:  8.00, max: 14.00 },
    Centro:    { min:  5.50, avg:  8.60, max: 15.00 },
    LisboaSul: { min:  6.00, avg:  9.50, max: 17.00 },
  },

  switch_socket: {
    Norte:     { min:  3.00, avg:  6.00, max: 12.00 },
    Centro:    { min:  3.20, avg:  6.50, max: 13.00 },
    LisboaSul: { min:  3.50, avg:  7.00, max: 14.50 },
  },

  wooden_door: {
    Norte:     { min: 150.00, avg: 250.00, max: 420.00 },
    Centro:    { min: 160.00, avg: 268.00, max: 450.00 },
    LisboaSul: { min: 175.00, avg: 295.00, max: 500.00 },
  },

  aluminum_window: {
    Norte:     { min: 160.00, avg: 250.00, max: 380.00 },
    Centro:    { min: 170.00, avg: 268.00, max: 406.00 },
    LisboaSul: { min: 185.00, avg: 295.00, max: 450.00 },
  },

  insulation_board: {
    Norte:     { min:  8.00, avg: 14.00, max: 22.00 },
    Centro:    { min:  8.50, avg: 15.00, max: 23.50 },
    LisboaSul: { min:  9.50, avg: 16.50, max: 26.50 },
  },

  // ── Labor ──────────────────────────────────────────────────────────────────

  labor_tiler: {
    Norte:     { min: 12.00, avg: 18.00, max: 26.00 },
    Centro:    { min: 13.00, avg: 19.50, max: 28.00 },
    LisboaSul: { min: 14.00, avg: 21.50, max: 31.00 },
  },

  labor_plasterer: {
    Norte:     { min:  8.00, avg: 13.00, max: 20.00 },
    Centro:    { min:  8.50, avg: 14.00, max: 21.50 },
    LisboaSul: { min:  9.50, avg: 15.50, max: 24.00 },
  },

  labor_painter: {
    Norte:     { min: 5.00, avg:  8.00, max: 13.00 },
    Centro:    { min: 5.50, avg:  8.60, max: 14.00 },
    LisboaSul: { min: 6.00, avg:  9.50, max: 16.00 },
  },

  labor_electrician: {
    Norte:     { min: 22.00, avg: 35.00, max: 50.00 },
    Centro:    { min: 24.00, avg: 37.50, max: 54.00 },
    LisboaSul: { min: 26.00, avg: 41.00, max: 60.00 },
  },

  labor_plumber: {
    Norte:     { min: 22.00, avg: 35.00, max: 50.00 },
    Centro:    { min: 24.00, avg: 37.50, max: 54.00 },
    LisboaSul: { min: 26.00, avg: 41.00, max: 60.00 },
  },

  labor_carpenter: {
    Norte:     { min: 18.00, avg: 30.00, max: 45.00 },
    Centro:    { min: 19.00, avg: 32.00, max: 48.00 },
    LisboaSul: { min: 21.00, avg: 35.00, max: 54.00 },
  },

  labor_general: {
    Norte:     { min: 10.00, avg: 14.00, max: 20.00 },
    Centro:    { min: 11.00, avg: 15.00, max: 21.50 },
    LisboaSul: { min: 12.00, avg: 16.50, max: 24.00 },
  },

  labor_demolition: {
    Norte:     { min:  7.00, avg: 12.00, max: 18.00 },
    Centro:    { min:  7.50, avg: 13.00, max: 19.50 },
    LisboaSul: { min:  8.50, avg: 14.50, max: 22.00 },
  },

  labor_flooring_installer: {
    Norte:     { min:  8.00, avg: 14.00, max: 22.00 },
    Centro:    { min:  8.50, avg: 15.00, max: 23.50 },
    LisboaSul: { min:  9.50, avg: 16.50, max: 26.50 },
  },
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Returns the PriceEntry for a given item and region, or undefined. */
export function getPrice(itemId: string, region: Region): PriceEntry | undefined {
  return PRICES[itemId]?.[region];
}

/**
 * Returns the average price for a given item and region.
 * Falls back to the Norte average if the region entry is missing.
 */
export function getAvgPrice(itemId: string, region: Region): number {
  return PRICES[itemId]?.[region]?.avg ?? PRICES[itemId]?.Norte?.avg ?? 0;
}

/** All item IDs in the database. */
export const PRICE_ITEM_IDS = Object.keys(PRICES) as (keyof typeof PRICES)[];
