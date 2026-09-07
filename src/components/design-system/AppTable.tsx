/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, ReactNode } from 'react';
import { BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppLoader } from './AppLoader';
import { AppEmptyState } from './AppEmptyState';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';

export interface AppTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | boolean | null | undefined;
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
  // Integrated Search & Title Controls
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  title?: ReactNode;
  extraHeaderActions?: ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

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
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  searchKeys,
  title,
  extraHeaderActions,
}: AppTableProps<T>) {
  const radiusClass = BORDER_RADIUS.xl; // rounded-2xl (~16px)

  const [internalSelectedId, setInternalSelectedId] = useState<string | number | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleSortToggle = (colKey: string, isSortable?: boolean) => {
    if (!isSortable) return;
    if (sortKey !== colKey) {
      setSortKey(colKey);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  // Filter and Sort Data
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search filter
    if (searchable && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item: any) => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some(k => {
            const val = item[k];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Fallback: search across all string/number fields of item
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(q);
          }
          return false;
        });
      });
    }

    // 2. Column Sorting
    if (sortKey && sortDir) {
      const activeCol = columns.find(c => c.key === sortKey);
      result.sort((a: any, b: any) => {
        let valA = activeCol?.sortAccessor ? activeCol.sortAccessor(a) : a[sortKey];
        let valB = activeCol?.sortAccessor ? activeCol.sortAccessor(b) : b[sortKey];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDir === 'asc'
            ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
            : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchable, searchQuery, searchKeys, sortKey, sortDir, columns]);

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden ${radiusClass} shadow-xs ${className}`}>
      {/* Optional Table Toolbar (Search / Title / Actions) */}
      {(title || searchable || extraHeaderActions) && (
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            {title && (
              <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </div>
            )}
            {searchable && (
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {processedData.length} élément{processedData.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {searchable && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                    aria-label="Effacer la recherche"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            {extraHeaderActions}
          </div>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800">
              {columns.map((col, idx) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key || idx}
                    scope="col"
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    onClick={() => handleSortToggle(col.key, col.sortable)}
                    className={`
                      px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider select-none
                      ${col.sortable ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''}
                      ${col.headerClassName || ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="inline-flex">
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <AppLoader />
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12">
                  {emptyState || (
                    <AppEmptyState
                      title={searchQuery ? "Aucun résultat trouvé" : "Aucune donnée disponible"}
                      description={searchQuery ? `Aucun élément ne correspond à votre recherche "${searchQuery}".` : "Il n'y a actuellement aucun élément à afficher."}
                    />
                  )}
                </td>
              </tr>
            ) : (
              processedData.map((row, rIdx) => {
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
                      transition-all duration-150 group outline-none min-h-[44px]
                      ${hoverable && !isSelected ? 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50' : ''}
                      cursor-pointer
                      ${isSelected ? 'bg-blue-500/10 dark:bg-blue-500/20 shadow-[inset_3px_0_0_0_#2563EB] dark:shadow-[inset_3px_0_0_0_#3B82F6] relative z-10' : ''}
                    `}
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || cIdx}
                        className={`
                          px-5 py-3.5 text-sm text-slate-800 dark:text-slate-100 font-medium
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
        <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          {pagination}
        </div>
      )}
    </div>
  );
}

export default AppTable;
