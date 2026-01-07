import { useEffect, useState } from 'react';
import type { GridSize } from '../types/game';
import { GRID_ROWS } from '../types/game';

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

      // Padding: 0.75rem (mobile) = 12px, 2rem (desktop) = 32px
      const containerPadding = mobile ? 12 : 32;

      // Gap between cards: 0.25rem (mobile) = 4px, 0.75rem (desktop) = 12px
      const gapSize = mobile ? 4 : 12;
      const rows = GRID_ROWS[gridSize];
      const cols = GRID_ROWS[gridSize]; // Square grid
      const totalGapVertical = gapSize * (rows - 1);
      const totalGapHorizontal = gapSize * (cols - 1);

      // Calculate based on HEIGHT
      const availableHeight = vh - headerSpace - (containerPadding * 2);
      const optimalHeightSize = (availableHeight - totalGapVertical) / rows;

      // Calculate based on WIDTH
      // Account for: container px-4 (32px) + board padding (24px or 64px) + safety margin (16px)
      const horizontalMargins = mobile ? 72 : 112; // More conservative calculation
      const availableWidth = vw - horizontalMargins;
      const optimalWidthSize = (availableWidth - totalGapHorizontal) / cols;

      // Use the minimum of both to ensure it fits
      const optimalSize = Math.min(optimalHeightSize, optimalWidthSize);

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
