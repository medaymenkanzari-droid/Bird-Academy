/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  showIndicators?: boolean;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = '',
  innerClassName = '',
  showIndicators = true,
}) => {
  const { t, isRtl } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 1;

    if (!hasOverflow) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    const absScroll = Math.abs(scrollLeft);

    if (isRtl) {
      // RTL Mode scroll pos check
      const atLeftEnd = absScroll >= maxScroll - 4 || scrollLeft <= -maxScroll + 4;
      const atRightEnd = scrollLeft >= 0 && scrollLeft <= 4;

      setShowLeft(!atLeftEnd);
      setShowRight(!atRightEnd);
    } else {
      // LTR Mode scroll pos check
      setShowLeft(scrollLeft > 4);
      setShowRight(scrollLeft < maxScroll - 4);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollState();

    const handleScroll = () => {
      checkScrollState();
    };

    const handleResize = () => {
      checkScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        checkScrollState();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    // Secondary check for layout completion
    const rafId = requestAnimationFrame(() => {
      checkScrollState();
    });

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      cancelAnimationFrame(rafId);
    };
  }, [checkScrollState, children]);

  return (
    <div
      className={`relative w-full max-w-full min-w-0 group overflow-hidden ${className}`}
      data-testid="horizontal-scroll-container"
    >
      {/* Accessible Screen Reader Hint */}
      {showIndicators && (showLeft || showRight) && (
        <span className="sr-only">{t('scrollMoreOptions')}</span>
      )}

      {/* Left Non-blocking Scroll Indicator / Fade */}
      {showIndicators && showLeft && (
        <div
          data-testid="scroll-indicator-left"
          className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-white via-white/80 dark:from-slate-900 dark:via-slate-900/80 to-transparent pointer-events-none z-10 flex items-center justify-start pl-0.5 text-slate-500 dark:text-slate-400 transition-opacity duration-200"
          aria-hidden="true"
        >
          <ChevronLeft className="w-4 h-4 animate-pulse shrink-0" />
        </div>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={`flex flex-nowrap overflow-x-auto min-w-0 max-w-full w-full overflow-y-hidden shrink-0 scroll-smooth touch-pan-x scrollbar-none ${innerClassName}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {children}
      </div>

      {/* Right Non-blocking Scroll Indicator / Fade */}
      {showIndicators && showRight && (
        <div
          data-testid="scroll-indicator-right"
          className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-white via-white/80 dark:from-slate-900 dark:via-slate-900/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-0.5 text-slate-500 dark:text-slate-400 transition-opacity duration-200"
          aria-hidden="true"
        >
          <ChevronRight className="w-4 h-4 animate-pulse shrink-0" />
        </div>
      )}
    </div>
  );
};

export default HorizontalScrollContainer;
