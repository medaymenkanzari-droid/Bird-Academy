/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { BORDER_RADIUS, TYPOGRAPHY } from '../../theme';

export interface AppEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AppEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: AppEmptyStateProps) {
  const radiusClass = BORDER_RADIUS.xl;

  return (
    <div
      className={`
        bg-white border border-dashed border-slate-200 p-8 sm:p-12
        flex flex-col items-center justify-center text-center
        ${radiusClass} ${className}
      `}
    >
      <div className="mb-4 bg-slate-50 p-3.5 rounded-full text-slate-300">
        {icon || <Inbox className="w-8 h-8" />}
      </div>

      <h4 className="font-sans font-bold text-sm sm:text-base text-slate-800 tracking-tight mb-1.5">
        {title}
      </h4>

      {description && (
        <p className="font-sans text-xs text-slate-500 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && <div className="flex items-center justify-center shrink-0">{action}</div>}
    </div>
  );
}
