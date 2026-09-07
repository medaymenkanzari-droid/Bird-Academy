/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MOTION_VARIANTS } from '../../theme';

export interface AppPageProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function AppPage({
  children,
  className = '',
  animate = true,
}: AppPageProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const variants = {
    initial: reducedMotion || !animate ? { opacity: 0 } : MOTION_VARIANTS.pageTransition.initial,
    animate: reducedMotion || !animate ? { opacity: 1, transition: { duration: 0.15 } } : MOTION_VARIANTS.pageTransition.animate,
    exit: reducedMotion || !animate ? { opacity: 0, transition: { duration: 0.1 } } : MOTION_VARIANTS.pageTransition.exit,
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={`space-y-6 sm:space-y-8 w-full will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

