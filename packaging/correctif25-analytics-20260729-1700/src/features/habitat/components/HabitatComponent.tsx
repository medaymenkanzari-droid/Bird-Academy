/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, Move, ShieldAlert, QrCode, Copy, Printer, Download, 
  Eye, Layers, ChevronRight, ChevronDown, Check, RefreshCw, X, Calendar, 
  User, Search, ArrowRightLeft, AlertTriangle, CheckCircle, Info, RefreshCw as ResetIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  AppButton, AppCard, AppInput, AppSelect, AppModal, AppBadge, 
  AppAlert, AppEmptyState, AppHeader, AppSection, AppTable 
} from '../../../components/design-system';

// Services, repos and engine
import { HabitatRepository } from '../repositories/HabitatRepository';
import { HabitatEngine } from '../../../business/HabitatEngine';
import { HabitatService } from '../services/HabitatService';
import { QRCodeManager } from '../services/QRCodeManager';
import { BirdService } from '../../birds/services/BirdService';

// Types
import { 
  Facility, Zone, Aviary, HabitatCage, Compartment, QuarantineArea, 
  DeplacementRecord, QuarantineRecord, Canari 
} from '../../../types';

export default function HabitatComponent() {
  const { t, isRtl } = useLanguage();
  const activeUser = "Lead Éleveur";

  // Navigation & Tabs
  const [activeSubTab, setActiveSubTab] = useState<'structures' | 'movements' | 'quarantine'>('structures');

  // Trigger state updates
  const [tick, setTick] = useState(0);
  const forceUpdate = () => setTick(prev => prev + 1);

  // Structural entities states
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [aviaries, setAviaries] = useState<Aviary[]>([]);
  const [cages, setCages] = useState<HabitatCage[]>([]);
  const [compartments, setCompartments] = useState<Compartment[]>([]);
  const [quarantineAreas, setQuarantineAreas] = useState<QuarantineArea[]>([]);
  const [movements, setMovements] = useState<DeplacementRecord[]>([]);
  const [quarantines, setQuarantines] = useState<QuarantineRecord[]>([]);
  const [birds, setBirds] = useState<Canari[]>([]);

  // Selected hierarchy node for details and filtering
  const [selectedType, setSelectedType] = useState<'all' | 'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea'>('all');
  const [selectedId, setSelectedId] = useState<string>('all');

  // Interactive Tree Expansion States
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // QR display and action target
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrEntity, setQrEntity] = useState<{ type: string; id: string; label: string } | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Modals for additions
  const [addModalType, setAddModalType] = useState<'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea' | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);

  // Movement Form State
  const [moveForm, setMoveForm] = useState({
    birdId: '',
    destType: 'cage' as any,
    destId: '',
    motif: 'Optimisation de couple',
    comment: ''
  });

  // Quarantine Form State
  const [quarantineForm, setQuarantineForm] = useState({
    birdId: '',
    quarantineAreaId: '',
    duration: 30,
    raison: 'Suspicion de gale',
    traitements: 'Traitement antiparasitaire externe',
    observations: 'Oiseau isolé préventivement.'
  });

  // Structure Form States
  const [facilityForm, setFacilityForm] = useState({ nom: '', description: '', capacite: 50 });
  const [zoneForm, setZoneForm] = useState({ nom: '', description: '', facilityId: '', isQuarantine: false });
  const [aviaryForm, setAviaryForm] = useState({ nom: '', description: '', zoneId: '', capacite: 20 });
  const [cageForm, setCageForm] = useState({ nom: '', description: '', zoneId: '', aviaryId: '', capacite: 6 });
  const [compartmentForm, setCompartmentForm] = useState({ nom: '', description: '', cageId: '', capacite: 2 });
  const [quarantineAreaForm, setQuarantineAreaForm] = useState({ nom: '', description: '', zoneId: '', capacite: 10 });

  // Load all entities
  useEffect(() => {
    setFacilities(HabitatRepository.getAll<Facility>('facility'));
    setZones(HabitatRepository.getAll<Zone>('zone'));
    setAviaries(HabitatRepository.getAll<Aviary>('aviary'));
    setCages(HabitatRepository.getAll<HabitatCage>('cage'));
    setCompartments(HabitatRepository.getAll<Compartment>('compartment'));
    setQuarantineAreas(HabitatRepository.getAll<QuarantineArea>('quarantineArea'));
    setMovements(HabitatRepository.getAll<DeplacementRecord>('deplacementRecord').reverse());
    setQuarantines(HabitatRepository.getAll<QuarantineRecord>('quarantineRecord').reverse());
    setBirds(BirdService.getBirds(true));
  }, [tick]);

  // Load initial expanded nodes
  useEffect(() => {
    if (facilities.length > 0) {
      const initial: Record<string, boolean> = {};
      facilities.forEach(f => {
        initial[`facility-${f.id}`] = true;
      });
      setExpandedNodes(initial);
    }
  }, [facilities]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Helper: Count birds inside a given container
  const getBirdCountForNode = (type: string, id: string): number => {
    return birds.filter(b => {
      if (type === 'facility') return b.facilityId === id;
      if (type === 'zone') return b.zoneId === id;
      if (type === 'aviary') return b.aviaryId === id;
      if (type === 'cage') return b.cageId === id || String(b.cage_id) === id;
      if (type === 'compartment') return b.compartmentId === id;
      if (type === 'quarantineArea') return b.quarantineId === id;
      return false;
    }).length;
  };

  // Stats for Currently Selected Node
  const getSelectedStats = () => {
    if (selectedType === 'all') {
      let capacity = 0;
      let occupancy = 0;
      facilities.forEach(f => {
        const stats = HabitatEngine.calculateStats('facility', f.id, birds);
        capacity += stats.capaciteTotale;
        occupancy += stats.oiseauxPresents;
      });
      if (facilities.length === 0) {
        capacity = cages.reduce((sum, c) => sum + (c.capacite_max || 0), 0);
        occupancy = birds.length;
      }
      const available = Math.max(0, capacity - occupancy);
      const rate = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
      const isOverloaded = occupancy > capacity && capacity > 0;
      return { capacity, occupancy, available, rate, isOverloaded };
    } else {
      const stats = HabitatEngine.calculateStats(selectedType as any, selectedId, birds);
      return {
        capacity: stats.capaciteTotale,
        occupancy: stats.oiseauxPresents,
        available: stats.placesDisponibles,
        rate: stats.tauxOccupation,
        isOverloaded: stats.isOverloaded
      };
    }
  };

  const currentStats = getSelectedStats();

  // QR Code Generation Trigger
  const handleShowQR = async (type: string, id: string, label: string) => {
    const code = QRCodeManager.formatCode(type as any, id);
    const svg = await QRCodeManager.generateSVG(code, 220);
    setQrSvgString(svg);
    setQrEntity({ type, id, label });
    setQrModalOpen(true);
    setCopied(false);
  };

  const handleCopyQR = async () => {
    if (!qrEntity) return;
    const code = QRCodeManager.formatCode(qrEntity.type as any, qrEntity.id);
    const success = await QRCodeManager.copyIdentifier(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintQR = () => {
    if (!qrEntity) return;
    const code = QRCodeManager.formatCode(qrEntity.type as any, qrEntity.id);
    QRCodeManager.printQRCode(code, qrEntity.label, qrEntity.type.toUpperCase());
  };

  const handleDownloadPNG = () => {
    if (!qrEntity) return;
    const code = QRCodeManager.formatCode(qrEntity.type as any, qrEntity.id);
    QRCodeManager.downloadPNG(code, `QR_${qrEntity.type}_${qrEntity.id}`);
  };

  const handleDownloadSVG = () => {
    if (!qrEntity) return;
    const code = QRCodeManager.formatCode(qrEntity.type as any, qrEntity.id);
    QRCodeManager.downloadSVG(code, `QR_${qrEntity.type}_${qrEntity.id}`);
  };

  // Create Handlers
  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.nom) return;
    HabitatRepository.create<Facility>('facility', {
      nom: facilityForm.nom,
      description: facilityForm.description,
      capacite: facilityForm.capacite,
      statut: 'Actif'
    });
    setFacilityForm({ nom: '', description: '', capacite: 50 });
    setAddModalType(null);
    forceUpdate();
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneForm.nom || !zoneForm.facilityId) return;
    HabitatRepository.create<Zone>('zone', {
      nom: zoneForm.nom,
      description: zoneForm.description,
      facilityId: zoneForm.facilityId,
      statut: 'Actif',
      isQuarantine: zoneForm.isQuarantine
    });
    setZoneForm({ nom: '', description: '', facilityId: '', isQuarantine: false });
    setAddModalType(null);
    forceUpdate();
  };

  const handleCreateAviary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aviaryForm.nom || !aviaryForm.zoneId) return;
    HabitatRepository.create<Aviary>('aviary', {
      nom: aviaryForm.nom,
      description: aviaryForm.description,
      zoneId: aviaryForm.zoneId,
      capacite: aviaryForm.capacite,
      statut: 'Actif'
    });
    setAviaryForm({ nom: '', description: '', zoneId: '', capacite: 20 });
    setAddModalType(null);
    forceUpdate();
  };

  const handleCreateCage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cageForm.nom || !cageForm.zoneId) return;
    HabitatRepository.create<HabitatCage>('cage', {
      nom: cageForm.nom,
      description: cageForm.description,
      zoneId: cageForm.zoneId,
      aviaryId: cageForm.aviaryId || undefined,
      capacite_max: cageForm.capacite,
      statut: 'Actif'
    });
    setCageForm({ nom: '', description: '', zoneId: '', aviaryId: '', capacite: 6 });
    setAddModalType(null);
    forceUpdate();
  };

  const handleCreateCompartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compartmentForm.nom || !compartmentForm.cageId) return;
    HabitatRepository.create<Compartment>('compartment', {
      nom: compartmentForm.nom,
      description: compartmentForm.description,
      cageId: compartmentForm.cageId,
      capacite: compartmentForm.capacite,
      statut: 'Actif'
    });
    setCompartmentForm({ nom: '', description: '', cageId: '', capacite: 2 });
    setAddModalType(null);
    forceUpdate();
  };

  const handleCreateQuarantineArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quarantineAreaForm.nom || !quarantineAreaForm.zoneId) return;
    HabitatRepository.create<QuarantineArea>('quarantineArea', {
      nom: quarantineAreaForm.nom,
      description: quarantineAreaForm.description,
      zoneId: quarantineAreaForm.zoneId,
      capacite: quarantineAreaForm.capacite,
      statut: 'Actif'
    });
    setQuarantineAreaForm({ nom: '', description: '', zoneId: '', capacite: 10 });
    setAddModalType(null);
    forceUpdate();
  };

  const handleDeleteEntity = (type: any, id: string) => {
    const count = getBirdCountForNode(type, id);
    if (count > 0) {
      alert(`Impossible de supprimer cette structure car elle héberge encore ${count} oiseaux.`);
      return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette structure ?")) {
      const success = HabitatRepository.delete(type, id);
      if (success) {
        setSelectedType('all');
        setSelectedId('all');
        forceUpdate();
      }
    }
  };

  // Movement Submit
  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveForm.birdId || !moveForm.destId) return;

    const res = HabitatService.moveBird(
      parseInt(moveForm.birdId, 10),
      moveForm.destType,
      moveForm.destId,
      moveForm.motif,
      activeUser,
      moveForm.comment
    );

    if (res.success) {
      setMoveModalOpen(false);
      setMoveForm({ birdId: '', destType: 'cage', destId: '', motif: 'Optimisation de couple', comment: '' });
      forceUpdate();
    } else {
      alert(res.message + (res.error ? `\nErreur : ${res.error}` : ''));
    }
  };

  // Quarantine Submit
  const handleQuarantineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quarantineForm.birdId || !quarantineForm.quarantineAreaId) return;

    const res = HabitatService.startQuarantine(
      parseInt(quarantineForm.birdId, 10),
      quarantineForm.quarantineAreaId,
      quarantineForm.duration,
      quarantineForm.raison,
      quarantineForm.traitements,
      quarantineForm.observations,
      activeUser
    );

    if (res.success) {
      setQuarantineModalOpen(false);
      setQuarantineForm({ birdId: '', quarantineAreaId: '', duration: 30, raison: 'Suspicion de gale', traitements: 'Traitement externe', observations: '' });
      forceUpdate();
    } else {
      alert(res.message + (res.error ? `\nErreur : ${res.error}` : ''));
    }
  };

  // End Quarantine
  const handleEndQuarantine = (recordId: string, prolong = false) => {
    if (prolong) {
      const days = prompt("Nombre de jours à prolonger :", "15");
      if (days && !isNaN(parseInt(days, 10))) {
        const obs = prompt("Motif de la prolongation :", "Traitements complémentaires requis");
        if (obs) {
          HabitatService.endQuarantine(recordId, 'prolong', parseInt(days, 10), obs, undefined, activeUser);
          forceUpdate();
        }
      }
    } else {
      if (confirm("Autoriser la sortie de quarantaine pour cet oiseau ?")) {
        // Find suitable cage
        const availableCages = cages.filter(c => c.statut === 'Actif');
        let targetCageId = '';
        if (availableCages.length > 0) {
          targetCageId = availableCages[0].id;
        }
        
        HabitatService.endQuarantine(recordId, 'release', 0, "Oiseau guéri", targetCageId || undefined, activeUser);
        forceUpdate();
      }
    }
  };

  // Filter List based on hierarchy, search, status
  const getFilteredStructures = () => {
    let items: any[] = [];
    
    if (selectedType === 'all') {
      // Show all cages by default to keep familiar view, or list all custom nodes
      items = [...facilities.map(f => ({ ...f, type: 'facility' })), 
               ...zones.map(z => ({ ...z, type: 'zone' })),
               ...aviaries.map(a => ({ ...a, type: 'aviary' })),
               ...cages.map(c => ({ ...c, type: 'cage' })),
               ...compartments.map(comp => ({ ...comp, type: 'compartment' })),
               ...quarantineAreas.map(q => ({ ...q, type: 'quarantineArea' }))];
    } else if (selectedType === 'facility') {
      items = zones.filter(z => z.facilityId === selectedId).map(z => ({ ...z, type: 'zone' }));
    } else if (selectedType === 'zone') {
      items = [
        ...aviaries.filter(a => a.zoneId === selectedId).map(a => ({ ...a, type: 'aviary' })),
        ...cages.filter(c => c.zoneId === selectedId && !c.aviaryId).map(c => ({ ...c, type: 'cage' })),
        ...quarantineAreas.filter(q => q.zoneId === selectedId).map(q => ({ ...q, type: 'quarantineArea' }))
      ];
    } else if (selectedType === 'aviary') {
      items = cages.filter(c => c.aviaryId === selectedId).map(c => ({ ...c, type: 'cage' }));
    } else if (selectedType === 'cage') {
      items = compartments.filter(comp => comp.cageId === selectedId).map(comp => ({ ...comp, type: 'compartment' }));
    }

    // Apply Search Query
    if (searchQuery) {
      items = items.filter(item => 
        item.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort Items
    items.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  };

  const filteredStructures = getFilteredStructures();

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Layers className="w-48 h-48 text-amber-500" />
        </div>
        
        <div className="space-y-1.5 z-10">
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {t('habitatTitle')}
          </span>
          <h2 className="text-xl font-bold tracking-tight">{t('habitatTitle')}</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t('habitatSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
          <AppButton 
            onClick={() => setMoveModalOpen(true)}
            variant="secondary"
            className="text-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 mr-1.5" />
            {t('moveBird')}
          </AppButton>
          <AppButton 
            onClick={() => setQuarantineModalOpen(true)}
            variant="danger"
            className="text-xs cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 mr-1.5" />
            {t('startQuarantine')}
          </AppButton>
          <AppButton 
            onClick={() => setAddModalType('facility')}
            variant="primary"
            className="text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('addFacility')}
          </AppButton>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t('capacityTotal')}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{currentStats.capacity}</span>
            <span className="text-xs text-slate-400">places</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, currentStats.rate)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t('birdsPresent')}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{currentStats.occupancy}</span>
            <span className="text-xs text-slate-400">oiseaux</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-2">Actuellement hébergés</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t('slotsAvailable')}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{currentStats.available}</span>
            <span className="text-xs text-slate-400">libres</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-2">Espaces disponibles</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">{t('occupancyRate')}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{currentStats.rate}%</span>
          </div>
          <span className={`text-[10px] font-semibold mt-2 ${currentStats.isOverloaded ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
            {currentStats.isOverloaded ? t('overloaded') : 'Remplissage optimal'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Structures</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 py-1 rounded">
              <span className="text-xs font-bold text-slate-700 block">{facilities.length}</span>
              <span className="text-[8px] text-slate-400 block">Inst.</span>
            </div>
            <div className="bg-slate-50 py-1 rounded">
              <span className="text-xs font-bold text-slate-700 block">{zones.length}</span>
              <span className="text-[8px] text-slate-400 block">Zones</span>
            </div>
            <div className="bg-slate-50 py-1 rounded">
              <span className="text-xs font-bold text-slate-700 block">{cages.length}</span>
              <span className="text-[8px] text-slate-400 block">Cages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSubTab('structures')}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${activeSubTab === 'structures' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span>{t('hierarchyTree')}</span>
            {activeSubTab === 'structures' && (
              <motion.div layoutId="subtab_bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${activeSubTab === 'movements' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span>{t('movementHistory')}</span>
            {activeSubTab === 'movements' && (
              <motion.div layoutId="subtab_bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('quarantine')}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${activeSubTab === 'quarantine' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span>{t('quarantineTitle')}</span>
            {activeSubTab === 'quarantine' && (
              <motion.div layoutId="subtab_bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: STRUCTURES */}
      {activeSubTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Hierarchy Tree */}
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                {t('hierarchyTree')}
              </h3>
              <AppButton 
                onClick={() => { setSelectedType('all'); setSelectedId('all'); }}
                variant="text"
                className="text-[10px] p-1 h-auto text-amber-500"
              >
                Tout réinitialiser
              </AppButton>
            </div>

            {facilities.length === 0 ? (
              <AppEmptyState 
                title="Aucune installation"
                description={t('emptyHierarchy')}
              />
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
                {facilities.map(facility => {
                  const nodeKey = `facility-${facility.id}`;
                  const isExpanded = !!expandedNodes[nodeKey];
                  const childZones = zones.filter(z => z.facilityId === facility.id);
                  const isSelected = selectedType === 'facility' && selectedId === facility.id;

                  return (
                    <div key={facility.id} className="space-y-1">
                      <div 
                        onClick={() => { setSelectedType('facility'); setSelectedId(facility.id); }}
                        className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 text-amber-900 border border-amber-200/50' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleNode(nodeKey); }}
                            className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <span>🏨 {facility.nom}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                          {getBirdCountForNode('facility', facility.id)}/{facility.capacite}
                        </span>
                      </div>

                      {/* Expanded Zones */}
                      {isExpanded && (
                        <div className="pl-4 border-l border-slate-100 ml-3 space-y-1 py-1">
                          {childZones.map(zone => {
                            const zoneKey = `zone-${zone.id}`;
                            const isZoneExpanded = !!expandedNodes[zoneKey];
                            const childCages = cages.filter(c => c.zoneId === zone.id);
                            const childAviaries = aviaries.filter(a => a.zoneId === zone.id);
                            const isZoneSelected = selectedType === 'zone' && selectedId === zone.id;

                            return (
                              <div key={zone.id} className="space-y-1">
                                <div 
                                  onClick={() => { setSelectedType('zone'); setSelectedId(zone.id); }}
                                  className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${isZoneSelected ? 'bg-amber-100/60 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                  <div className="flex items-center gap-1 text-xs">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggleNode(zoneKey); }}
                                      className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                                    >
                                      {isZoneExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                    <span>🧭 {zone.nom}</span>
                                    {zone.isQuarantine && <span className="text-[8px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">Quar.</span>}
                                  </div>
                                  <span className="text-[9px] text-slate-400">
                                    {getBirdCountForNode('zone', zone.id)} ois.
                                  </span>
                                </div>

                                {/* Expanded Cages & Aviaries */}
                                {isZoneExpanded && (
                                  <div className="pl-4 border-l border-slate-100 ml-3 space-y-1">
                                    {/* Aviaries first */}
                                    {childAviaries.map(aviary => {
                                      const isAviarySelected = selectedType === 'aviary' && selectedId === aviary.id;
                                      return (
                                        <div 
                                          key={aviary.id}
                                          onClick={() => { setSelectedType('aviary'); setSelectedId(aviary.id); }}
                                          className={`flex items-center justify-between p-1 rounded cursor-pointer text-xs ${isAviarySelected ? 'bg-amber-100/40 text-amber-900 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                                        >
                                          <span>🕊️ {aviary.nom}</span>
                                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded-full">{getBirdCountForNode('aviary', aviary.id)}/{aviary.capacite}</span>
                                        </div>
                                      );
                                    })}
                                    
                                    {/* Cages */}
                                    {childCages.map(cage => {
                                      const isCageSelected = selectedType === 'cage' && selectedId === cage.id;
                                      return (
                                        <div 
                                          key={cage.id}
                                          onClick={() => { setSelectedType('cage'); setSelectedId(cage.id); }}
                                          className={`flex items-center justify-between p-1 rounded cursor-pointer text-xs ${isCageSelected ? 'bg-amber-100/40 text-amber-900 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                                        >
                                          <span>🕸️ {cage.nom}</span>
                                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded-full">{getBirdCountForNode('cage', cage.id)}/{cage.capacite_max}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: List Grid & Action Table */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            
            {/* Table Filters Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {selectedType === 'all' ? t('allStructures') : `${t(selectedType)} : ${selectedId}`}
                </h3>
                <span className="text-[10px] text-slate-400">{filteredStructures.length} éléments correspondants</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <AppButton 
                  onClick={() => {
                    if (selectedType === 'facility') setAddModalType('zone');
                    else if (selectedType === 'zone') setAddModalType('cage');
                    else if (selectedType === 'cage') setAddModalType('compartment');
                    else setAddModalType('facility');
                  }}
                  variant="primary"
                  className="text-xs cursor-pointer py-1 h-auto"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Créer
                </AppButton>
              </div>
            </div>

            {/* Structured Grid Table */}
            {filteredStructures.length === 0 ? (
              <AppEmptyState 
                title="Aucun résultat"
                description="Modifiez vos critères ou créez une nouvelle entité dans cette branche."
              />
            ) : (
              <div className="overflow-x-auto">
                <AppTable
                  data={filteredStructures}
                  keyExtractor={(item: any) => item.id}
                  onRowClick={(item: any) => { setSelectedType(item.type); setSelectedId(item.id); }}
                  columns={[
                    {
                      key: 'type',
                      header: 'Type',
                      render: (item: any) => (
                        <span className="capitalize text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          {t(item.type)}
                        </span>
                      )
                    },
                    {
                      key: 'nom',
                      header: 'Nom',
                      render: (item: any) => (
                        <div>
                          <span className="font-bold text-slate-800 block">{item.nom}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{item.description || 'Pas de description'}</span>
                        </div>
                      )
                    },
                    {
                      key: 'statut',
                      header: 'Statut',
                      render: (item: any) => (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.statut === 'Actif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.statut}
                        </span>
                      )
                    },
                    {
                      key: 'occupation',
                      header: 'Occupation',
                      render: (item: any) => {
                        const count = getBirdCountForNode(item.type, item.id);
                        const max = item.capacite || item.capacite_max || 0;
                        const occupancyPercent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
                        return (
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                              <span>{count} / {max}</span>
                              <span>{occupancyPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div className={`h-full ${occupancyPercent > 100 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${occupancyPercent}%` }}></div>
                            </div>
                          </div>
                        );
                      }
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      className: 'text-right space-x-1.5 whitespace-nowrap',
                      headerClassName: 'text-right',
                      render: (item: any) => (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShowQR(item.type, item.id, item.nom); }}
                            title="Smart QR Code"
                            className="p-1.5 text-slate-400 hover:text-amber-500 bg-slate-50 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOVEMENTS */}
      {activeSubTab === 'movements' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                {t('movementHistory')}
              </h3>
              <p className="text-[10px] text-slate-400">Enregistrement permanent de tous les transferts d'oiseaux dans le complexe</p>
            </div>
            <AppButton 
              onClick={() => setMoveModalOpen(true)}
              variant="primary"
              className="text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nouveau transfert
            </AppButton>
          </div>

          {movements.length === 0 ? (
            <AppEmptyState 
              title="Aucun mouvement"
              description="Aucun transfert d'oiseau n'a été enregistré pour le moment."
            />
          ) : (
            <div className="overflow-x-auto">
              <AppTable
                data={movements}
                keyExtractor={(m: any) => m.id}
                columns={[
                  { key: 'date', header: 'Date', render: (m: any) => <span className="text-slate-500 font-medium whitespace-nowrap">{m.date}</span> },
                  { key: 'oiseau', header: 'Oiseau', render: (m: any) => { const b = birds.find(x => x.id === m.birdId); return <span className="font-bold text-slate-800">{b ? `${b.nom} (${b.bague})` : `Oiseau #${m.birdId}`}</span>; } },
                  { key: 'origine', header: 'Origine', render: (m: any) => { const o = m.fromId ? HabitatRepository.getById(m.fromType as any, m.fromId) : null; return <span className="text-slate-600">{o ? (o as any).nom : 'Externe'}</span>; } },
                  { key: 'arrow', header: '', render: () => <ArrowRightLeft className="w-3 h-3 text-slate-300" /> },
                  { key: 'destination', header: 'Destination', render: (m: any) => { const d = m.toId ? HabitatRepository.getById(m.toType as any, m.toId) : null; return <span className="font-bold text-slate-700">{d ? (d as any).nom : 'Externe'}</span>; } },
                  { key: 'motif', header: 'Motif & Commentaire', render: (m: any) => <div><span className="block text-[10px] font-bold text-slate-600">{m.reason}</span>{m.notes && <span className="block text-[10px] text-slate-400 line-clamp-1">{m.notes}</span>}</div> },
                  { key: 'user', header: 'Utilisateur', render: (m: any) => <span className="text-slate-400">{m.userId}</span> }
                ]}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: QUARANTINE */}
      {activeSubTab === 'quarantine' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                  {t('quarantineTitle')}
                </h3>
                <p className="text-[10px] text-slate-400">Suivi des fiches sanitaires et d'isolation préventive ou curative</p>
              </div>
              <AppButton 
                onClick={() => setQuarantineModalOpen(true)}
                variant="danger"
                className="text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Déclarer une quarantaine
              </AppButton>
            </div>

            {quarantines.length === 0 ? (
              <AppEmptyState 
                title="Aucun dossier"
                description="Aucune quarantaine n'est en cours ou n'a été historiquement archivée."
              />
            ) : (
              <div className="overflow-x-auto">
                <AppTable
                data={quarantines}
                keyExtractor={(q: any) => q.id}
                columns={[
                  { key: 'oiseau', header: 'Oiseau', render: (q: any) => { const b = birds.find(x => x.id === q.birdId); return <span className="font-bold text-slate-800">{b ? `${b.nom} (${b.bague})` : `Oiseau #${q.birdId}`}</span>; } },
                  { key: 'zone', header: 'Zone', render: (q: any) => { const qArea = quarantineAreas.find(x => x.id === q.quarantineAreaId); return <span className="text-slate-600">{qArea ? qArea.nom : '-'}</span>; } },
                  { key: 'debut', header: 'Début', render: (q: any) => <span className="text-slate-500">{q.startDate}</span> },
                  { key: 'fin', header: 'Fin Estimée', render: (q: any) => <span className="text-slate-500 font-bold">{q.endDate}</span> },
                  { key: 'motif', header: 'Motif', render: (q: any) => <div><span className="block text-[10px] font-bold text-amber-600">{q.reason}</span><span className="block text-[10px] text-slate-500">Traitements: {q.treatmentPlan || 'Aucun'}</span></div> },
                  { key: 'statut', header: 'Statut', render: (q: any) => <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${(q.statut === 'En cours' || q.statut === 'Prolongé') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{q.statut}</span> },
                  { key: 'actions', header: 'Actions', className: 'text-right', headerClassName: 'text-right', render: (q: any) => (
                    (q.statut === 'En cours' || q.statut === 'Prolongé') ? (
                      <AppButton variant="outline" size="sm" onClick={() => handleEndQuarantine(q.id)}>
                        Terminer
                      </AppButton>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Terminé</span>
                    )
                  )}
                ]}
              />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART QR DISPLAY MODAL */}
      <AppModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Smart QR Code Permanent"
      >
        {qrEntity && (
          <div className="space-y-6 text-center py-4">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-xl shadow-xs" dangerouslySetInnerHTML={{ __html: qrSvgString }} />
              <h4 className="font-extrabold text-slate-800 text-sm mt-4">{qrEntity.label}</h4>
              <p className="text-[10px] font-mono text-slate-400 mt-1">{QRCodeManager.formatCode(qrEntity.type as any, qrEntity.id)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <AppButton 
                onClick={handleCopyQR}
                variant="secondary"
                className="w-full cursor-pointer py-2"
              >
                <Copy className="w-4 h-4 mr-1.5 text-slate-500" />
                {copied ? 'Copié !' : 'Copier ID'}
              </AppButton>
              <AppButton 
                onClick={handlePrintQR}
                variant="primary"
                className="w-full cursor-pointer py-2 bg-amber-500 hover:bg-amber-600 border-none"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                {t('printQR')}
              </AppButton>
              <AppButton 
                onClick={handleDownloadPNG}
                variant="text"
                className="w-full cursor-pointer py-2 hover:bg-slate-100"
              >
                <Download className="w-4 h-4 mr-1.5 text-slate-500" />
                PNG
              </AppButton>
              <AppButton 
                onClick={handleDownloadSVG}
                variant="text"
                className="w-full cursor-pointer py-2 hover:bg-slate-100"
              >
                <Download className="w-4 h-4 mr-1.5 text-slate-500" />
                SVG
              </AppButton>
            </div>
          </div>
        )}
      </AppModal>

      {/* ADD MODAL: FACILITY */}
      <AppModal
        isOpen={addModalType === 'facility'}
        onClose={() => setAddModalType(null)}
        title="Créer une installation d'élevage"
      >
        <form onSubmit={handleCreateFacility} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nom de l'élevage</label>
            <AppInput 
              placeholder="ex: Volière Principale Sud" 
              value={facilityForm.nom}
              onChange={(e) => setFacilityForm({ ...facilityForm, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
            <AppInput 
              placeholder="Description géographique ou technique..." 
              value={facilityForm.description}
              onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Capacité d'accueil maximale</label>
            <AppInput 
              type="number"
              value={facilityForm.capacite}
              onChange={(e) => setFacilityForm({ ...facilityForm, capacite: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>
          <AppButton type="submit" variant="primary" className="w-full cursor-pointer">Créer</AppButton>
        </form>
      </AppModal>

      {/* ADD MODAL: ZONE */}
      <AppModal
        isOpen={addModalType === 'zone'}
        onClose={() => setAddModalType(null)}
        title="Ajouter une Zone"
      >
        <form onSubmit={handleCreateZone} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Élevage Parent</label>
            <AppSelect
              value={zoneForm.facilityId}
              onChange={(e) => setZoneForm({ ...zoneForm, facilityId: e.target.value })}
              required
            >
              <option value="">Sélectionner l'élevage parent</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </AppSelect>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nom de la zone</label>
            <AppInput 
              placeholder="ex: Zone d'accouplement" 
              value={zoneForm.nom}
              onChange={(e) => setZoneForm({ ...zoneForm, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
            <AppInput 
              placeholder="Détails..." 
              value={zoneForm.description}
              onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isQuarantine" 
              checked={zoneForm.isQuarantine}
              onChange={(e) => setZoneForm({ ...zoneForm, isQuarantine: e.target.checked })}
              className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isQuarantine" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
              Marquer comme zone de quarantaine sanitaire
            </label>
          </div>
          <AppButton type="submit" variant="primary" className="w-full cursor-pointer">Ajouter la Zone</AppButton>
        </form>
      </AppModal>

      {/* ADD MODAL: CAGE */}
      <AppModal
        isOpen={addModalType === 'cage'}
        onClose={() => setAddModalType(null)}
        title="Ajouter une Cage"
      >
        <form onSubmit={handleCreateCage} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Zone Parente</label>
            <AppSelect
              value={cageForm.zoneId}
              onChange={(e) => setCageForm({ ...cageForm, zoneId: e.target.value })}
              required
            >
              <option value="">Sélectionner la zone parente</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.nom}</option>
              ))}
            </AppSelect>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1 font-normal text-slate-400">Volière parente (Optionnel)</label>
            <AppSelect
              value={cageForm.aviaryId}
              onChange={(e) => setCageForm({ ...cageForm, aviaryId: e.target.value })}
            >
              <option value="">Aucune volière</option>
              {aviaries.filter(a => a.zoneId === cageForm.zoneId).map(a => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </AppSelect>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nom ou Numéro de la cage</label>
            <AppInput 
              placeholder="ex: Cage 105" 
              value={cageForm.nom}
              onChange={(e) => setCageForm({ ...cageForm, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
            <AppInput 
              placeholder="Détails..." 
              value={cageForm.description}
              onChange={(e) => setCageForm({ ...cageForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Capacité maximale d'oiseaux</label>
            <AppInput 
              type="number"
              value={cageForm.capacite}
              onChange={(e) => setCageForm({ ...cageForm, capacite: parseInt(e.target.value, 10) || 6 })}
              required
            />
          </div>
          <AppButton type="submit" variant="primary" className="w-full cursor-pointer">Ajouter la Cage</AppButton>
        </form>
      </AppModal>

      {/* ADD MODAL: COMPARTMENT */}
      <AppModal
        isOpen={addModalType === 'compartment'}
        onClose={() => setAddModalType(null)}
        title="Ajouter un Compartiment"
      >
        <form onSubmit={handleCreateCompartment} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Cage Parente</label>
            <AppSelect
              value={compartmentForm.cageId}
              onChange={(e) => setCompartmentForm({ ...compartmentForm, cageId: e.target.value })}
              required
            >
              <option value="">Sélectionner la cage parente</option>
              {cages.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </AppSelect>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Nom du Compartiment</label>
            <AppInput 
              placeholder="ex: Compartiment Gauche" 
              value={compartmentForm.nom}
              onChange={(e) => setCompartmentForm({ ...compartmentForm, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Capacité d'oiseaux</label>
            <AppInput 
              type="number"
              value={compartmentForm.capacite}
              onChange={(e) => setCompartmentForm({ ...compartmentForm, capacite: parseInt(e.target.value, 10) || 2 })}
              required
            />
          </div>
          <AppButton type="submit" variant="primary" className="w-full cursor-pointer">Ajouter le Compartiment</AppButton>
        </form>
      </AppModal>

      {/* BIRD MOVEMENT MODAL */}
      <AppModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="Déplacement d'Oiseau (Contrôlé)"
      >
        <form onSubmit={handleMoveSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Oiseau à transférer</label>
            <AppSelect
              value={moveForm.birdId}
              onChange={(e) => setMoveForm({ ...moveForm, birdId: e.target.value })}
              required
            >
              <option value="">Sélectionner un oiseau</option>
              {birds.map(b => (
                <option key={b.id} value={b.id}>{b.nom} ({b.bague}) - {b.statut_sante}</option>
              ))}
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Type de Destination</label>
            <AppSelect
              value={moveForm.destType}
              onChange={(e) => setMoveForm({ ...moveForm, destType: e.target.value as any, destId: '' })}
              required
            >
              <option value="cage">Cage</option>
              <option value="aviary">Volière</option>
              <option value="compartment">Compartiment</option>
              <option value="zone">Zone libre</option>
              <option value="quarantineArea">Zone de Quarantaine</option>
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Destination Exacte</label>
            <AppSelect
              value={moveForm.destId}
              onChange={(e) => setMoveForm({ ...moveForm, destId: e.target.value })}
              required
            >
              <option value="">Choisir l'emplacement cible</option>
              {moveForm.destType === 'cage' && cages.map(c => <option key={c.id} value={c.id}>{c.nom} (Cap. {c.capacite_max})</option>)}
              {moveForm.destType === 'aviary' && aviaries.map(a => <option key={a.id} value={a.id}>{a.nom} (Cap. {a.capacite})</option>)}
              {moveForm.destType === 'compartment' && compartments.map(comp => <option key={comp.id} value={comp.id}>{comp.nom} (Cap. {comp.capacite})</option>)}
              {moveForm.destType === 'zone' && zones.map(z => <option key={z.id} value={z.id}>{z.nom}</option>)}
              {moveForm.destType === 'quarantineArea' && quarantineAreas.map(q => <option key={q.id} value={q.id}>{q.nom} (Cap. {q.capacite})</option>)}
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Motif du transfert</label>
            <AppSelect
              value={moveForm.motif}
              onChange={(e) => setMoveForm({ ...moveForm, motif: e.target.value })}
              required
            >
              <option value="Optimisation de couple">Optimisation de couple</option>
              <option value="Ajustement de densité">Ajustement de densité</option>
              <option value="Traitement Sanitaire">Isolement Sanitaire</option>
              <option value="Nettoyage et Maintenance">Nettoyage / Maintenance</option>
              <option value="Autre">Autre</option>
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Commentaires</label>
            <AppInput 
              placeholder="Précisions..." 
              value={moveForm.comment}
              onChange={(e) => setMoveForm({ ...moveForm, comment: e.target.value })}
            />
          </div>

          <AppButton type="submit" variant="primary" className="w-full cursor-pointer py-2.5">
            Enregistrer le déplacement
          </AppButton>
        </form>
      </AppModal>

      {/* START QUARANTINE MODAL */}
      <AppModal
        isOpen={quarantineModalOpen}
        onClose={() => setQuarantineModalOpen(false)}
        title="Mettre en Quarantaine Sanitaire"
      >
        <form onSubmit={handleQuarantineSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Oiseau à isoler</label>
            <AppSelect
              value={quarantineForm.birdId}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, birdId: e.target.value })}
              required
            >
              <option value="">Sélectionner l'oiseau</option>
              {birds.filter(b => b.statut_sante !== 'Quarantaine').map(b => (
                <option key={b.id} value={b.id}>{b.nom} ({b.bague}) - {b.statut_sante}</option>
              ))}
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Zone d'isolement</label>
            <AppSelect
              value={quarantineForm.quarantineAreaId}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, quarantineAreaId: e.target.value })}
              required
            >
              <option value="">Sélectionner la zone de quarantaine</option>
              {quarantineAreas.map(q => (
                <option key={q.id} value={q.id}>{q.nom} (Places: {q.capacite - getBirdCountForNode('quarantineArea', q.id)})</option>
              ))}
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Durée d'isolement prévue (Jours)</label>
            <AppInput 
              type="number"
              value={quarantineForm.duration}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, duration: parseInt(e.target.value, 10) || 30 })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Raison de l'isolement</label>
            <AppSelect
              value={quarantineForm.raison}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, raison: e.target.value })}
              required
            >
              <option value="Suspicion de gale">Suspicion de gale / Parasites</option>
              <option value="Nouvelle acquisition">Nouvelle acquisition (Préventif)</option>
              <option value="Blessure ou Convalescence">Blessure ou Convalescence</option>
              <option value="Symptômes respiratoires">Symptômes respiratoires</option>
              <option value="Autre">Autre</option>
            </AppSelect>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Traitements prescrits</label>
            <AppInput 
              placeholder="ex: Ivomec 1 goutte sur la nuque..." 
              value={quarantineForm.traitements}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, traitements: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Observations initiales</label>
            <AppInput 
              placeholder="ex: Oiseau léthargique..." 
              value={quarantineForm.observations}
              onChange={(e) => setQuarantineForm({ ...quarantineForm, observations: e.target.value })}
            />
          </div>

          <AppButton type="submit" variant="danger" className="w-full cursor-pointer py-2.5">
            Démarrer la Quarantaine
          </AppButton>
        </form>
      </AppModal>
    </div>
  );
}
