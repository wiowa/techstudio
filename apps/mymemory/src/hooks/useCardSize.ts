import { useEffect, useState } from 'react';
import type { GridSize } from '../app/app';

const GRID_ROWS: Record<GridSize, number> = {
  '4x4': 4,
  '6x6': 6,
  '8x8': 8,
};

/**
 * Hook to calculate optimal card size based on viewport height
 * Ensures the entire game board fits within the screen without scrolling
 */
export function useCardSize(gridSize: GridSize) {
  const [cardSize, setCardSize] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calculateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Detect mobile
      const mobile = vw < 768;
      setIsMobile(mobile);

      // Header space estimation (title + stats + buttons)
      const headerSpace = mobile ? 280 : 350;

      // Padding: p-3 (mobile) = 12px top + 12px bottom, p-8 (desktop) = 32px top + 32px bottom
      const containerPadding = mobile ? 24 : 64;

      // Gap between cards: gap-1 (mobile) = 4px, gap-3 (desktop) = 12px
      const gapSize = mobile ? 4 : 12;
      const rows = GRID_ROWS[gridSize];
      const totalGap = gapSize * (rows - 1);

      // Available height for the grid
      const availableHeight = vh - headerSpace - containerPadding;

      // Calculate optimal card size
      const optimalSize = (availableHeight - totalGap) / rows;

      // Set minimum card size to ensure playability
      const minCardSize = mobile ? 40 : 60;
      const finalSize = Math.max(minCardSize, Math.floor(optimalSize));

      setCardSize(finalSize);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    window.addEventListener('orientationchange', calculateSize);

    return () => {
      window.removeEventListener('resize', calculateSize);
      window.removeEventListener('orientationchange', calculateSize);
    };
  }, [gridSize]);

  return { cardSize, isMobile };
}

/**
 * Get recommended grid size based on screen dimensions
 */
export function getRecommendedGridSize(): {
  recommended: GridSize;
  warning?: string;
} {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const isPortrait = vh > vw;
  const isMobile = vw < 768;

  if (isMobile && isPortrait) {
    // Mobile portrait: recommend 4x4
    return {
      recommended: '4x4',
      warning: '6x6 and 8x8 may have very small cards on your screen',
    };
  } else if (isMobile && !isPortrait) {
    // Mobile landscape: recommend 6x6
    return {
      recommended: '6x6',
      warning: '8x8 may have small cards on your screen',
    };
  } else if (vh < 800) {
    // Small desktop/tablet: recommend 6x6
    return {
      recommended: '6x6',
    };
  } else {
    // Large desktop: all sizes OK, default to 6x6
    return {
      recommended: '6x6',
    };
  }
}
