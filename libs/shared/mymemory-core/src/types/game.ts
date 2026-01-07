/**
 * Core Game Types
 * Basic type definitions for the memory game
 */

/**
 * Available grid sizes for the memory game
 */
export type GridSize = '4x4' | '6x6' | '8x8';

/**
 * Grid configuration mapping
 */
export const GRID_ROWS: Record<GridSize, number> = {
  '4x4': 4,
  '6x6': 6,
  '8x8': 8,
};
