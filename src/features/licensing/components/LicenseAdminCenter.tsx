/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL ADMIN CENTER
 * Official commercial administration console for managing LMSE licenses (FREE / PREMIUM / PRO).
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useCommercialLicenseAdmin } from '../admin/hooks/useCommercialLicenseAdmin';
import { useCommercialOperations } from '../commercial/hooks/useCommercialOperations';
import { License } from '../types/licensing';
import {
  LicenseAdminDashboard,
  LicenseFilterBar,
  LicenseList,
  LicenseDetailsModal,
  LicenseCreateWorkflow,
  LicenseRenewalDialog,
  LicenseReplacementDialog,
  LicenseRevocationDialog,
  LicenseSuspensionDialog,
  LicenseUpgradeDialog,
  LicenseDowngradeDialog,
  LicenseExportDialog,
  LicenseQRGenerator,
  LicenseAuditHistory
} from '../admin';
import {
  CommercialOffersCatalog,
  CommercialOrderList,
  CommercialOrderCreateDialog,
  CommercialOrderDetailsModal,
  CommercialCustomerList,
  CommercialCustomerDetailsModal,
  CommercialDeliveryPackageModal,
  CommercialOperationsDashboard,
  CommercialTraceabilityLog,
} from '../commercial';
import { OfflineActivationEngine } from '../engines/OfflineActivationEngine';
import {
  AppTabs,
  AppCard,
  AppButton,
  AppInput,
  AppAlert,
  AppLoader
} from '../../../components/design-system';
import {
  ShieldCheck,
  Plus,
  Download,
  Upload,
  Key,
  Laptop,
  Activity,
  BarChart3,
  Lock,
  Copy,
  Check,
  ShoppingBag,
  Users,
  PackageCheck,
  TrendingUp,
  FileBox,
} from 'lucide-react';

export const LicenseAdminCenter: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const {
    licenses,
    filteredLicenses,
    stats: licenseStats,
    auditLogs,
    loading: licenseLoading,
    alert: licenseAlert,
    setAlert: setLicenseAlert,
    filterState,
    updateFilterState,
    refreshData: refreshLicenseData,
    inspectLicense,
    setInspectLicense,
    exportLicense,
    setExportLicense,
    qrLicense,
    setQrLicense,
    renewLicense,
    setRenewLicense,
    replaceLicense,
    setReplaceLicense,
    upgradeLicense,
    setUpgradeLicense,
    downgradeLicense,
    setDowngradeLicense,
    suspendLicense,
    setSuspendLicense,
    revokeLicense,
    setRevokeLicense,
    isCreateOpen,
    setIsCreateOpen,
    handleCreateLicense,
    handleRenewLicense,
    handleReplaceLicense,
    handleUpgradeLicense,
    handleDowngradeLicense,
    handleSuspendLicense,
    handleReactivateLicense,
    handleRevokeLicense,
    exportAllData,
    importAllData,
  } = useCommercialLicenseAdmin();

  const {
    orders,
    customers,
    offers,
    events,
    stats: opsStats,
    loading: opsLoading,
    alert: opsAlert,
    setAlert: setOpsAlert,
    refreshData: refreshOpsData,
    isCreateOrderOpen,
    setIsCreateOrderOpen,
    inspectOrder,
    setInspectOrder,
    inspectCustomer,
    setInspectCustomer,
    deliveryPackage,
    setDeliveryPackage,
    handleCreateOrder,
    handlePayOrder,
    handleFulfillOrder,
    handleCancelOrder,
    handleRefundOrder,
    handleCreateCustomer,
    handleGenerateDeliveryPackage,
  } = useCommercialOperations();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'customers' | 'offers' | 'licenses' | 'devices' | 'audit' | 'generator' | 'importexport'
  >('overview');

  const [selectedOfferForOrder, setSelectedOfferForOrder] = useState<any>(null);

  // Generator & Offline Response Code State
  const [genChallenge, setGenChallenge] = useState('');
  const [genKey, setGenKey] = useState('');
  const [genResponseCode, setGenResponseCode] = useState('');
  const [copiedResponseCode, setCopiedResponseCode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Opérations & Ventes', icon: TrendingUp },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, badge: orders.length },
    { id: 'customers', label: 'Clients', icon: Users, badge: customers.length },
    { id: 'offers', label: 'Offres Commerciales', icon: PackageCheck },
    { id: 'licenses', label: 'Licences LMSE', icon: Key, badge: licenses.length },
    { id: 'devices', label: 'Appareils', icon: Laptop, badge: licenseStats?.totalActivatedDevices || 0 },
    { id: 'audit', label: 'Traçabilité & Audit', icon: Activity, badge: events.length || auditLogs.length },
    { id: 'generator', label: 'Défi Hors-Ligne', icon: Lock },
    { id: 'importexport', label: 'Sauvegardes', icon: Download },
  ];

  const handleRefreshAll = () => {
    refreshLicenseData();
    refreshOpsData();
  };

  const handleExportFullArchive = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lmse_commercial_archive_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLicenseAlert({ type: 'success', title: 'Exportation Réussie', message: 'L\'archive complète des licences a été téléchargée.' });
    } catch (e) {
      setLicenseAlert({ type: 'danger', title: 'Erreur', message: (e as Error).message });
    }
  };

  const handleImportArchive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await importAllData(content);
      if (res.success) {
        setLicenseAlert({ type: 'success', title: 'Importation Réussie', message: res.message });
      } else {
        setLicenseAlert({ type: 'danger', title: 'Erreur d\'Importation', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateOfflineResponse = async () => {
    if (!genChallenge || !genKey) {
      setLicenseAlert({ type: 'danger', title: 'Erreur', message: 'Veuillez spécifier le Code Défi et la Clé de Licence.' });
      return;
    }
    const code = await OfflineActivationEngine.generateActivationCode(genChallenge, genKey);
    setGenResponseCode(code);
    setLicenseAlert({ type: 'success', title: 'Code Hors-Ligne Généré', message: 'Le code de validation matérielle est prêt.' });
  };

  const copyResponseCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && genResponseCode) {
      navigator.clipboard.writeText(genResponseCode);
      setCopiedResponseCode(true);
      setTimeout(() => setCopiedResponseCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 text-left" dir={isRtl ? 'rtl' : 'ltr'} data-testid="lmse-commercial-admin-center">
      {/* HEADER HERO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-md text-[10px] font-black uppercase tracking-wider">
              LMSE Commercial v1.3.6
            </span>
            <span className="text-[10px] text-slate-400">• Chaîne d'Autorité FREE / PREMIUM / PRO</span>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            {t('adminCenterTitle') || 'Console d\'Administration Commerciale des Licences'}
          </h1>
          <p className="text-xs text-slate-300">
            Gestion offline-first du cycle de vie commercial des licences : création, attribution, upgrade, downgrade, renouvellement, remplacement et révocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AppButton variant="secondary" size="sm" onClick={handleRefreshAll} disabled={licenseLoading}>
            {licenseLoading ? <AppLoader /> : 'Rafraîchir'}
          </AppButton>
          <AppButton variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} data-testid="hero-create-license-btn">
            <Plus className="w-4 h-4 mr-1" />
            Créer une Licence
          </AppButton>
        </div>
      </div>

      {/* ALERTS */}
      {licenseAlert && (
        <AppAlert type={licenseAlert.type} title={licenseAlert.title}>
          {licenseAlert.message}
        </AppAlert>
      )}
      {opsAlert && (
        <AppAlert type={opsAlert.type} title={opsAlert.title}>
          {opsAlert.message}
        </AppAlert>
      )}

      {/* NAVIGATION TABS */}
      <AppTabs tabs={tabs} activeTab={activeTab} onChange={(tId) => setActiveTab(tId as any)} />

      {/* 1. OVERVIEW TAB: COMMERCIAL OPERATIONS & LICENSE DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <CommercialOperationsDashboard
            stats={opsStats}
            recentOrders={orders}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
            onOpenCreateCustomer={() => setActiveTab('customers')}
            onInspectOrder={(ord) => setInspectOrder(ord)}
          />

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              État du Parc des Licences Cryptographiques
            </h3>
            <LicenseAdminDashboard
              stats={licenseStats}
              licenses={licenses}
              onRenew={(lic) => setRenewLicense(lic)}
              onInspect={(lic) => setInspectLicense(lic)}
              onCreateOpen={() => setIsCreateOpen(true)}
              onRefresh={handleRefreshAll}
            />
          </div>
        </div>
      )}

      {/* 2. ORDERS TAB: COMMERCIAL ORDER LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                Commandes & Ventes Commerciales ({orders.length})
              </h3>
              <p className="text-xs text-slate-500">
                Gestion des commandes, facturation et génération de packages de licences.
              </p>
            </div>
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOrderOpen(true)}
              data-testid="tab-create-order-btn"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nouvelle Commande
            </AppButton>
          </div>

          <CommercialOrderList
            orders={orders}
            onInspectOrder={(ord) => setInspectOrder(ord)}
            onPayOrder={handlePayOrder}
            onFulfillOrder={handleFulfillOrder}
            onCancelOrder={handleCancelOrder}
            onRefundOrder={handleRefundOrder}
            onOpenDeliveryPackage={(licId, ordId) => handleGenerateDeliveryPackage(licId, ordId)}
          />
        </div>
      )}

      {/* 3. CUSTOMERS TAB: CLIENT DIRECTORY */}
      {activeTab === 'customers' && (
        <CommercialCustomerList
          customers={customers}
          onInspectCustomer={(cust) => setInspectCustomer(cust)}
          onCreateCustomer={handleCreateCustomer}
        />
      )}

      {/* 4. OFFERS TAB: COMMERCIAL OFFERS CATALOG */}
      {activeTab === 'offers' && (
        <CommercialOffersCatalog
          offers={offers}
          onSelectOffer={(off) => {
            setSelectedOfferForOrder(off);
            setIsCreateOrderOpen(true);
          }}
        />
      )}

      {/* 5. LICENSES TAB: FILTER BAR & RICH LIST */}
      {activeTab === 'licenses' && (
        <div className="space-y-4">
          <LicenseFilterBar
            filterState={filterState}
            onFilterChange={updateFilterState}
            onRefresh={handleRefreshAll}
            onCreateOpen={() => setIsCreateOpen(true)}
            totalCount={licenses.length}
            filteredCount={filteredLicenses.length}
          />

          <LicenseList
            licenses={filteredLicenses}
            onInspect={(lic) => setInspectLicense(lic)}
            onExport={(lic) => setExportLicense(lic)}
            onShowQr={(lic) => setQrLicense(lic)}
            onRenew={(lic) => setRenewLicense(lic)}
            onReplace={(lic) => setReplaceLicense(lic)}
            onUpgrade={(lic) => setUpgradeLicense(lic)}
            onDowngrade={(lic) => setDowngradeLicense(lic)}
            onSuspend={(lic) => setSuspendLicense(lic)}
            onRevoke={(lic) => setRevokeLicense(lic)}
            onCreateOpen={() => setIsCreateOpen(true)}
          />
        </div>
      )}

      {/* 6. REGISTERED DEVICES TAB */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-500" />
              Parc d'Appareils Activés
            </h3>
            <span className="text-xs text-slate-500">
              Total Appareils : {licenseStats?.totalActivatedDevices || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {licenses.flatMap((l) => (l.activations || []).map((a) => ({ ...a, license: l }))).length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                Aucun appareil actif pour le moment.
              </div>
            ) : (
              licenses.flatMap((l) => (l.activations || []).map((a) => ({ ...a, license: l }))).map((item) => (
                <AppCard key={item.id} className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {item.license.holderName}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                        {item.license.id}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.fingerprint.os}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                    <div>Device ID : {item.fingerprint.deviceId.slice(0, 20)}...</div>
                    <div>Activé : {new Date(item.activatedAt).toLocaleString()}</div>
                    <div>Dernière vérif : {new Date(item.lastVerifiedAt).toLocaleString()}</div>
                  </div>
                </AppCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. AUDIT & TRACEABILITY TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <CommercialTraceabilityLog events={events} />
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Journal d'Audit des Licences Cryptographiques
            </h4>
            <LicenseAuditHistory auditLogs={auditLogs} onRefresh={handleRefreshAll} />
          </div>
        </div>
      )}

      {/* 8. GENERATOR & OFFLINE ACTIVATION CHALLENGE */}
      {activeTab === 'generator' && (
        <AppCard className="p-6 max-w-2xl mx-auto space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Générateur de Code de Réponse Hors-Ligne
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Génère le code d'activation pour un utilisateur sur machine 100% déconnectée à partir de son Code Défi Matériel.
            </p>
          </div>

          <div className="space-y-3">
            <AppInput
              label="Clé de Licence"
              placeholder="LMSE-COMM-XXXX-XXXX-XXXX"
              value={genKey}
              onChange={(e) => setGenKey(e.target.value)}
              data-testid="offline-gen-key-input"
            />

            <AppInput
              label="Code Défi Fourni par l'Utilisateur"
              placeholder="Ex: 8F3A-C4B2-7E1D-9A0F"
              value={genChallenge}
              onChange={(e) => setGenChallenge(e.target.value)}
              data-testid="offline-gen-challenge-input"
            />

            <AppButton
              variant="primary"
              onClick={handleGenerateOfflineResponse}
              data-testid="generate-offline-code-btn"
            >
              Calculer le Code de Réponse
            </AppButton>
          </div>

          {genResponseCode && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800" data-testid="offline-response-result">
              <span className="text-xs text-slate-400 block font-bold">Code d'Activation à transmettre :</span>
              <div className="flex items-center justify-between font-mono text-lg font-black text-amber-400 select-all">
                <span>{genResponseCode}</span>
                <AppButton variant="secondary" size="sm" onClick={copyResponseCode}>
                  {copiedResponseCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </AppButton>
              </div>
            </div>
          )}
        </AppCard>
      )}

      {/* 9. IMPORT / EXPORT TAB */}
      {activeTab === 'importexport' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* EXPORT */}
          <AppCard className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Download className="w-4 h-4 text-indigo-500" />
                Exporter l'Archive Complète des Licences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sauvegardez l'ensemble des licences, des logs d'audit et de la liste de révocation dans un fichier JSON.
              </p>
            </div>
            <AppButton variant="primary" onClick={handleExportFullArchive} data-testid="export-full-archive-btn">
              <Download className="w-4 h-4 mr-1" />
              Télécharger l'Archive JSON
            </AppButton>
          </AppCard>

          {/* IMPORT */}
          <AppCard className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4 text-emerald-500" />
                Restaurer / Importer une Archive
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Importez une archive administrative JSON pour importer ou restaurer les licences.
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportArchive}
                className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/40 dark:file:text-indigo-300"
                data-testid="import-archive-input"
              />
            </div>
          </AppCard>
        </div>
      )}

      {/* COMMERCIAL OPERATIONS MODALS */}
      <CommercialOrderCreateDialog
        isOpen={isCreateOrderOpen}
        onClose={() => {
          setIsCreateOrderOpen(false);
          setSelectedOfferForOrder(null);
        }}
        offers={offers}
        customers={customers}
        selectedOffer={selectedOfferForOrder}
        onCreateOrder={handleCreateOrder}
      />

      <CommercialOrderDetailsModal
        order={inspectOrder}
        isOpen={!!inspectOrder}
        onClose={() => setInspectOrder(null)}
        onPayOrder={handlePayOrder}
        onFulfillOrder={handleFulfillOrder}
        onCancelOrder={handleCancelOrder}
        onRefundOrder={handleRefundOrder}
        onOpenDeliveryPackage={(licId, ordId) => {
          setInspectOrder(null);
          handleGenerateDeliveryPackage(licId, ordId);
        }}
      />

      <CommercialCustomerDetailsModal
        customer={inspectCustomer}
        isOpen={!!inspectCustomer}
        onClose={() => setInspectCustomer(null)}
      />

      <CommercialDeliveryPackageModal
        pkg={deliveryPackage}
        isOpen={!!deliveryPackage}
        onClose={() => setDeliveryPackage(null)}
      />

      {/* ALL MODAL DIALOGS */}
      <LicenseCreateWorkflow
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateLicense}
        onExport={(lic) => {
          setIsCreateOpen(false);
          setExportLicense(lic);
        }}
        onShowQr={(lic) => {
          setIsCreateOpen(false);
          setQrLicense(lic);
        }}
      />

      <LicenseDetailsModal
        license={inspectLicense}
        isOpen={!!inspectLicense}
        onClose={() => setInspectLicense(null)}
        onExport={(lic) => {
          setInspectLicense(null);
          setExportLicense(lic);
        }}
        onShowQr={(lic) => {
          setInspectLicense(null);
          setQrLicense(lic);
        }}
        onRenew={(lic) => {
          setInspectLicense(null);
          setRenewLicense(lic);
        }}
        onReplace={(lic) => {
          setInspectLicense(null);
          setReplaceLicense(lic);
        }}
        onRevoke={(lic) => {
          setInspectLicense(null);
          setRevokeLicense(lic);
        }}
        onSuspend={(lic) => {
          setInspectLicense(null);
          setSuspendLicense(lic);
        }}
        onUpgrade={(lic) => {
          setInspectLicense(null);
          setUpgradeLicense(lic);
        }}
        onDowngrade={(lic) => {
          setInspectLicense(null);
          setDowngradeLicense(lic);
        }}
      />

      <LicenseExportDialog
        license={exportLicense}
        isOpen={!!exportLicense}
        onClose={() => setExportLicense(null)}
        onShowQr={(lic) => {
          setExportLicense(null);
          setQrLicense(lic);
        }}
      />

      <LicenseQRGenerator
        license={qrLicense}
        isOpen={!!qrLicense}
        onClose={() => setQrLicense(null)}
      />

      <LicenseRenewalDialog
        license={renewLicense}
        isOpen={!!renewLicense}
        onClose={() => setRenewLicense(null)}
        onRenew={handleRenewLicense}
      />

      <LicenseReplacementDialog
        license={replaceLicense}
        isOpen={!!replaceLicense}
        onClose={() => setReplaceLicense(null)}
        onReplace={handleReplaceLicense}
      />

      <LicenseRevocationDialog
        license={revokeLicense}
        isOpen={!!revokeLicense}
        onClose={() => setRevokeLicense(null)}
        onRevoke={handleRevokeLicense}
      />

      <LicenseSuspensionDialog
        license={suspendLicense}
        isOpen={!!suspendLicense}
        onClose={() => setSuspendLicense(null)}
        onSuspend={handleSuspendLicense}
        onReactivate={handleReactivateLicense}
      />

      <LicenseUpgradeDialog
        license={upgradeLicense}
        isOpen={!!upgradeLicense}
        onClose={() => setUpgradeLicense(null)}
        onUpgrade={handleUpgradeLicense}
      />

      <LicenseDowngradeDialog
        license={downgradeLicense}
        isOpen={!!downgradeLicense}
        onClose={() => setDowngradeLicense(null)}
        onDowngrade={handleDowngradeLicense}
      />
    </div>
  );
};
