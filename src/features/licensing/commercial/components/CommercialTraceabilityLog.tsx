/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL TRACEABILITY LOG COMPONENT
 * Complete audit trail of commercial and licensing operations.
 */

import React, { useState } from 'react';
import { CommercialTraceabilityEvent, CommercialEventType } from '../types/commercialTraceability';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppBadge,
} from '../../../../components/design-system';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Key,
  ShoppingBag,
  User,
  FileBox,
} from 'lucide-react';

export interface CommercialTraceabilityLogProps {
  events: CommercialTraceabilityEvent[];
}

export const CommercialTraceabilityLog: React.FC<CommercialTraceabilityLogProps> = ({
  events,
}) => {
  const { isRtl } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filtered = selectedType === 'ALL'
    ? events
    : events.filter(e => e.eventType === selectedType);

  const getEventBadge = (type: CommercialEventType) => {
    if (type.startsWith('ORDER_')) {
      return <AppBadge variant="accent" size="sm"><ShoppingBag className="w-3 h-3 mr-1 inline" />{type}</AppBadge>;
    }
    if (type.startsWith('CUSTOMER_')) {
      return <AppBadge variant="secondary" size="sm"><User className="w-3 h-3 mr-1 inline" />{type}</AppBadge>;
    }
    if (type === 'DELIVERY_PACKAGE_GENERATED') {
      return <AppBadge variant="primary" size="sm"><FileBox className="w-3 h-3 mr-1 inline" />PACKAGE</AppBadge>;
    }
    if (type === 'LICENSE_REVOKED') {
      return <AppBadge variant="danger" size="sm">{type}</AppBadge>;
    }
    if (type === 'LICENSE_ACTIVATED' || type === 'LICENSE_GENERATED') {
      return <AppBadge variant="success" size="sm"><Key className="w-3 h-3 mr-1 inline" />{type}</AppBadge>;
    }
    return <AppBadge variant="warning" size="sm">{type}</AppBadge>;
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-traceability-log">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Journal de Traçabilité Commerciale & Opérationnelle
          </h4>
          <p className="text-xs text-slate-500">
            Audit exhaustif et immuable de toutes les commandes, délivrances et événements de licences.
          </p>
        </div>

        <select
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          data-testid="traceability-type-filter"
        >
          <option value="ALL">Tous les Événements ({events.length})</option>
          <option value="ORDER_CREATED">ORDER_CREATED</option>
          <option value="ORDER_PAID">ORDER_PAID</option>
          <option value="ORDER_COMPLETED">ORDER_COMPLETED</option>
          <option value="LICENSE_ASSIGNED">LICENSE_ASSIGNED</option>
          <option value="DELIVERY_PACKAGE_GENERATED">DELIVERY_PACKAGE_GENERATED</option>
          <option value="CUSTOMER_CREATED">CUSTOMER_CREATED</option>
          <option value="ORDER_CANCELLED">ORDER_CANCELLED</option>
          <option value="ORDER_REFUNDED">ORDER_REFUNDED</option>
        </select>
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <AppCard className="p-8 text-center" data-testid="traceability-empty-state">
          <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Aucun événement enregistré dans le journal.</p>
        </AppCard>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filtered.map((evt) => (
            <AppCard
              key={evt.eventId}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              data-testid={`traceability-event-${evt.eventId}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getEventBadge(evt.eventType)}
                  <span className="font-mono text-xs text-slate-400 font-semibold">
                    {evt.eventId}
                  </span>
                  {evt.orderId && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold">
                      {evt.orderId}
                    </span>
                  )}
                  {evt.customerId && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {evt.customerId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {evt.details}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(evt.timestamp).toLocaleString('fr-FR')}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Source: {evt.source}
                </span>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
};
