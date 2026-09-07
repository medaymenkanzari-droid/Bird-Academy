/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../theme';
import { AppLoader } from './AppLoader';
import { AppEmptyState } from './AppEmptyState';

export interface AppTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface AppTableProps<T> {
  columns: AppTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyState?: ReactNode;
  hoverable?: boolean;
  className?: string;
  pagination?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  selectedRowId?: string | number;
  onClearSelection?: () => void;
}

export function AppTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  hoverable = true,
  className = '',
  pagination,
  onRowClick,
  selectedRowId,
  onClearSelection,
}: AppTableProps<T>) {
  const radiusClass = BORDER_RADIUS.xl;
  const shadowClass = SHADOWS.md;

  const [internalSelectedId, setInternalSelectedId] = React.useState<string | number | null>(null);

  const activeSelectedId = selectedRowId !== undefined ? selectedRowId : internalSelectedId;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInternalSelectedId(null);
        if (onClearSelection) {
          onClearSelection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClearSelection]);

  const handleRowClick = (row: T, rIdx: number) => {
    const rowKey = keyExtractor(row, rIdx);
    setInternalSelectedId(rowKey);
    if (onRowClick) {
      onRowClick(row, rIdx);
    }
  };

  return (
    <div className={`bg-white overflow-hidden ${radiusClass} ${shadowClass} ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`
                    px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider
                    ${col.headerClassName || ''}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <AppLoader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12">
                  {emptyState || (
                    <AppEmptyState
                      title="Aucune donnée disponible"
                      description="Il n'y a actuellement aucun élément à afficher."
                    />
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => {
                const rowKey = keyExtractor(row, rIdx);
                const isSelected = activeSelectedId !== undefined && activeSelectedId !== null && rowKey === activeSelectedId;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => handleRowClick(row, rIdx)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRowClick(row, rIdx);
                      }
                    }}
                    className={`
                      transition-all duration-200 group outline-none
                      ${hoverable && !isSelected ? 'hover:bg-slate-50/80 hover:shadow-sm' : ''}
                      cursor-pointer
                      ${isSelected ? 'bg-emerald-50/60 shadow-[inset_3px_0_0_0_#10b981] relative z-10' : ''}
                    `}
                  >
                    {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={`
                        px-5 py-4 text-sm text-slate-700 font-medium
                        ${col.className || ''}
                      `}
                    >
                      {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>

      {/* Pagination wrapper */}
      {pagination && (
        <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
          {pagination}
        </div>
      )}
    </div>
  );
}
