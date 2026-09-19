/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnalyticsService } from './AnalyticsService';
import { AnalyticsFilters } from '../types';

export class ExportService {
  
  /**
   * Triggers a browser download of a given data string
   */
  static downloadBlob(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export database tables based on module selection
   */
  static exportDataset(options: {
    modules: string[]; // 'birds' | 'finance' | 'health' | 'reproduction' | 'cages'
    period: AnalyticsFilters;
    format: 'csv' | 'json' | 'excel' | 'zip';
    columns: string[];
  }) {
    const rawData = AnalyticsService.getAggregateData();
    const dataToExport: Record<string, any> = {};

    // Filter datasets
    if (options.modules.includes('birds')) {
      const filteredBirds = rawData.birds.filter(b => {
        if (options.period.startDate && b.date_naissance && b.date_naissance < options.period.startDate) return false;
        if (options.period.endDate && b.date_naissance && b.date_naissance > options.period.endDate) return false;
        return true;
      });

      // Filter columns if customized
      dataToExport.oiseaux = filteredBirds.map(b => {
        const item: Record<string, any> = {};
        const cols = options.columns.length > 0 ? options.columns : ['id', 'bague', 'nom', 'sexe', 'race', 'mutation', 'couleur'];
        cols.forEach(col => {
          if (col in b) {
            item[col] = (b as any)[col];
          }
        });
        return item;
      });
    }

    if (options.modules.includes('finance')) {
      dataToExport.depenses = rawData.expenses.filter(e => {
        if (options.period.startDate && e.date < options.period.startDate) return false;
        if (options.period.endDate && e.date > options.period.endDate) return false;
        return true;
      });
      dataToExport.ventes = rawData.sales.filter(s => {
        if (options.period.startDate && s.date < options.period.startDate) return false;
        if (options.period.endDate && s.date > options.period.endDate) return false;
        return true;
      });
    }

    if (options.modules.includes('health')) {
      dataToExport.sante = rawData.healthRecords.filter(h => {
        if (options.period.startDate && h.date < options.period.startDate) return false;
        if (options.period.endDate && h.date > options.period.endDate) return false;
        return true;
      });
    }

    if (options.modules.includes('reproduction')) {
      dataToExport.accouplements = rawData.pairs;
      dataToExport.clutches = rawData.clutches;
    }

    if (options.modules.includes('cages')) {
      dataToExport.cages = rawData.cages;
    }

    const stamp = new Date().toISOString().slice(0, 10);

    // Format & export triggers
    if (options.format === 'json') {
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      this.downloadBlob(jsonStr, `birdacademy_export_${stamp}.json`, 'application/json');
    } 
    else if (options.format === 'csv') {
      let csvStr = '';
      Object.entries(dataToExport).forEach(([tableName, rows]) => {
        csvStr += `--- TABLE: ${tableName.toUpperCase()} ---\n`;
        if (rows.length === 0) {
          csvStr += "Aucune donnée\n\n";
          return;
        }
        const headers = Object.keys(rows[0]);
        csvStr += headers.join(';') + '\n';
        rows.forEach((row: any) => {
          const values = headers.map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '""';
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : `"${val}"`;
          });
          csvStr += values.join(';') + '\n';
        });
        csvStr += '\n';
      });
      this.downloadBlob('\uFEFF' + csvStr, `birdacademy_export_${stamp}.csv`, 'text/csv;charset=utf-8;');
    } 
    else if (options.format === 'excel') {
      // Excel-friendly tab-separated CSV format
      let excelStr = '';
      Object.entries(dataToExport).forEach(([tableName, rows]) => {
        excelStr += `[TABLE: ${tableName.toUpperCase()}]\n`;
        if (rows.length === 0) {
          excelStr += "Aucune donnée\n\n";
          return;
        }
        const headers = Object.keys(rows[0]);
        excelStr += headers.join('\t') + '\n';
        rows.forEach((row: any) => {
          const values = headers.map(header => {
            const val = row[header];
            return typeof val === 'string' ? val.replace(/\t/g, ' ') : val;
          });
          excelStr += values.join('\t') + '\n';
        });
        excelStr += '\r\n\r\n';
      });
      this.downloadBlob(excelStr, `birdacademy_export_${stamp}.xls`, 'application/vnd.ms-excel');
    } 
    else if (options.format === 'zip') {
      // Offline fallback: package files in a simulated text manifest zip structure
      let manifestStr = `BIRD ACADEMY ZIP BATCH FILE\nGENERATION DATE: ${stamp}\n===========================\n\n`;
      Object.entries(dataToExport).forEach(([tableName, rows]) => {
        manifestStr += `--- FILE: ${tableName}.json ---\n`;
        manifestStr += JSON.stringify(rows, null, 2);
        manifestStr += `\n\n===========================\n\n`;
      });
      this.downloadBlob(manifestStr, `birdacademy_bundle_${stamp}.txt`, 'text/plain');
    }
  }
}
