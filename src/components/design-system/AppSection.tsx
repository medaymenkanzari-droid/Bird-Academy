/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { TYPOGRAPHY } from '../../theme';

export interface AppSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerActions?: ReactNode;
}

export function AppSection({
  children,
  title,
  description,
  className = '',
  headerActions,
}: AppSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description || headerActions) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2">
          <div>
            {title && (
              <h2 className={TYPOGRAPHY.h3}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                {description}
              </p>
            )}
          </div>
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}
