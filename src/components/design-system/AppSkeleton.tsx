/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MOTION_VARIANTS } from '../../theme';

export interface AppSkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function AppSkeleton({
  variant = 'rect',
  width,
  height,
  className = '',
  count = 1,
}: AppSkeletonProps) {
  const baseClass = 'bg-slate-200/70 dark:bg-slate-700/50 relative overflow-hidden will-change-opacity';
  
  const variantClass = 
    variant === 'circle' ? 'rounded-full' :
    variant === 'text' ? 'rounded-md h-3 w-5/6 my-2' :
    'rounded-xl';

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  const renderSingle = (index: number) => (
    <motion.div
      key={index}
      variants={MOTION_VARIANTS.skeleton}
      initial="initial"
      animate="animate"
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3 w-full">
        {Array.from({ length: count }).map((_, idx) => renderSingle(idx))}
      </div>
    );
  }

  return renderSingle(0);
}
