/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Canari, Cage, Couple, Reproduction, Ponte, Jeune, Sante, Depense, Vente,
  Facility, Zone, Aviary, HabitatCage, Compartment, QuarantineArea, QuarantineRecord, DeplacementRecord
} from '../../../types';
import { CalendarEvent, PlatformNotification } from '../../platform/types';
import { appStorage } from '../../../storage';

export class DemoDataGenerator {
  private static generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'ba-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static generate(size: 'small' | 'medium' | 'large' = 'small'): {
    facilities: Facility[];
    zones: Zone[];
    aviaries: Aviary[];
    cages: HabitatCage[];
    legacyCages: Cage[];
    compartments: Compartment[];
    quarantineAreas: QuarantineArea[];
    quarantineRecords: QuarantineRecord[];
    deplacementRecords: DeplacementRecord[];
    canaris: Canari[];
    couples: Couple[];
    reproductions: Reproduction[];
    pontes: Ponte[];
    jeunes: Jeune[];
    sante: Sante[];
    depenses: Depense[];
    ventes: Vente[];
    calendarEvents: CalendarEvent[];
    notifications: PlatformNotification[];
  } {
    // Determine bounds based on size
    let targetMales = 18;
    let targetFemales = 18;
    let targetTotalBirds = 50;
    let numCages = 6;
    let numExpenses = 15;
    let numSales = 10;
    let numHealth = 10;
    let numCustomEvents = 6;
    let numNotifications = 10;

    if (size === 'medium') {
      targetMales = 110;
      targetFemales = 110;
      targetTotalBirds = 300;
      numCages = 25;
      numExpenses = 60;
      numSales = 40;
      numHealth = 35;
      numCustomEvents = 25;
      numNotifications = 30;
    } else if (size === 'large') {
      targetMales = 450;
      targetFemales = 450;
      targetTotalBirds = 1200;
      numCages = 100;
      numExpenses = 200;
      numSales = 150;
      numHealth = 110;
      numCustomEvents = 75;
      numNotifications = 80;
    }

    // Helper functions for random selection
    const rand = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
    
    // Core setup arrays
    const species = [
      { id: 'canari', name: 'Canari Domestique', category: 'Couleur' },
      { id: 'chardonneret_elegant', name: 'Chardonneret Élégant', category: 'Indigène' },
      { id: 'mandarin', name: 'Diamant Mandarin', category: 'Exotique' },
      { id: 'diamant_gould', name: 'Diamant de Gould', category: 'Exotique' }
    ];

    const racesBySpecies: Record<string, string[]> = {
      canari: ['Gloster Fancy', 'Lizard', 'Border', 'Norwich', 'Fife Fancy', 'Harzois', 'Mosaïque Jaune', 'Rouge Intensif', 'Yorkshire'],
      chardonneret_elegant: ['Chardonneret de Sibérie', 'Chardonneret Classique', 'Chardonneret d\'Europe', 'Chardonneret Parva'],
      mandarin: ['Mandarin Gris', 'Mandarin Brun', 'Mandarin Joues Noires', 'Mandarin Blanc', 'Mandarin Poitrine Noire'],
      diamant_gould: ['Gould Classique', 'Gould Tête Rouge', 'Gould Tête Noire', 'Gould Tête Orange', 'Gould Poitrine Blanche']
    };

    const mutations = ['Classique', 'Pastel', 'Satiné', 'Opale', 'Agate', 'Isabelle', 'Lutino', 'Eumo', 'Topaze', 'Albino'];
    const couleursBase = ['Jaune', 'Rouge', 'Vert', 'Blanc', 'Mélanique', 'Lipochrome', 'Panaché', 'Agate Mosaïque'];
    const facteurs = ['Intensif', 'Schimmel', 'Mosaïque', 'Gloster Corona', 'Consort', 'Simple Facteur', 'Double Facteur'];

    const getPhotoForSpecies = (especeId: string): string => {
      const supportedSpecies = ['canari', 'chardonneret_elegant', 'mandarin', 'diamant_gould'];
      const species = supportedSpecies.includes(especeId) ? especeId : 'oiseau';
      return `/demo-bird.svg#${species}`;
    };

    // --- 1. HABITATS GENERATION ---
    const facilities: Facility[] = [
      { id: 'fac-main', nom: 'Élevage Principal', description: 'Complexe d\'élevage professionnel pour concours', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, customFields: {} },
      { id: 'fac-out', nom: 'Volières Extérieures', description: 'Volières paysagées pour l\'endurcissement', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, customFields: {} }
    ];

    const zones: Zone[] = [
      { id: 'zone-repro', facilityId: 'fac-main', nom: 'Zone de Reproduction', description: 'Salle climatisée avec batteries d\'élevage', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, isQuarantine: false, customFields: {} },
      { id: 'zone-sevrage', facilityId: 'fac-main', nom: 'Zone de Sevrage', description: 'Espace d\'entraînement au vol pour les jeunes', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, isQuarantine: false, customFields: {} },
      { id: 'zone-indigene', facilityId: 'fac-out', nom: 'Volières Indigènes', description: 'Volières extérieures pour chardonnerets', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, isQuarantine: false, customFields: {} },
      { id: 'zone-quar', facilityId: 'fac-main', nom: 'Zone de Quarantaine', description: 'Local d\'isolement sanitaire', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, isQuarantine: true, customFields: {} }
    ];

    const aviaries: Aviary[] = [
      { id: 'aviary-1', zoneId: 'zone-sevrage', nom: 'Grande Volière A', description: 'Volière pour jeunes canaris sevrés', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, capacite_max: 50, customFields: {} },
      { id: 'aviary-2', zoneId: 'zone-indigene', nom: 'Volière Paysagère Nord', description: 'Espace arboré pour chardonnerets', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, capacite_max: 30, customFields: {} }
    ];

    const quarantineAreas: QuarantineArea[] = [
      { id: 'quarantine-area-1', facilityId: 'fac-main', nom: 'Box Sanitaire S1', description: 'Sas sanitaire et quarantaine d\'entrée', statut: 'Actif', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', isArchived: false, capacite_max: 10, customFields: {} }
    ];

    const cages: HabitatCage[] = [];
    const legacyCages: Cage[] = [];
    const compartments: Compartment[] = [];

    // Pre-create some designated cages
    const firstCages = [
      { id: 'cage-repro-1', zoneId: 'zone-repro', nom: 'Cage Repro Est #1', capacite_max: 4, description: 'Cage de reproduction double' },
      { id: 'cage-repro-2', zoneId: 'zone-repro', nom: 'Cage Repro Est #2', capacite_max: 4, description: 'Cage de reproduction double' },
      { id: 'cage-repro-3', zoneId: 'zone-repro', nom: 'Cage Repro Est #3', capacite_max: 4, description: 'Cage de reproduction double' },
      { id: 'cage-quar-1', zoneId: 'zone-quar', nom: 'Cage Quarantaine Q1', capacite_max: 2, description: 'Sas vétérinaire d\'isolement' },
      { id: 'cage-sevrage-1', zoneId: 'zone-sevrage', nom: 'Nurserie Volante #1', capacite_max: 15, description: 'Espace de sevrage intermédiaire' }
    ];

    firstCages.forEach(fc => {
      cages.push({
        id: fc.id,
        zoneId: fc.zoneId,
        nom: fc.nom,
        capacite_max: fc.capacite_max,
        description: fc.description,
        statut: 'Actif',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        isArchived: false,
        customFields: {}
      });
    });

    // Generate dynamic remaining cages to match numCages
    for (let c = 6; c <= numCages; c++) {
      const isRepro = c % 2 === 0;
      const zoneId = isRepro ? 'zone-repro' : 'zone-sevrage';
      const name = isRepro ? `Box Reproduction #${c}` : `Cage Élevage #${c}`;
      const cageId = `cage-dyn-${c}`;

      cages.push({
        id: cageId,
        zoneId,
        nom: name,
        capacite_max: isRepro ? 4 : 10,
        description: isRepro ? 'Batterie métallique galvanisée pour couple' : 'Cage d\'élevage polyvalente',
        statut: rand(['Actif', 'Actif', 'Nettoyage']),
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        isArchived: false,
        customFields: {}
      });

      // Create compartments inside some cages
      if (c % 4 === 0) {
        compartments.push({
          id: `comp-${cageId}-A`,
          cageId,
          nom: `Compartiment A`,
          description: 'Côté gauche amovible',
          statut: 'Actif',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          isArchived: false,
          capacite_max: 2,
          customFields: {}
        });
        compartments.push({
          id: `comp-${cageId}-B`,
          cageId,
          nom: `Compartiment B`,
          description: 'Côté droit amovible',
          statut: 'Actif',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          isArchived: false,
          capacite_max: 2,
          customFields: {}
        });
      }
    }

    // Sync to legacyCages
    cages.forEach(c => {
      let numericId = parseInt(c.id.replace(/[^\d]/g, ''), 10);
      if (isNaN(numericId)) {
        let hash = 0;
        for (let i = 0; i < c.id.length; i++) {
          hash = c.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        numericId = Math.abs(hash % 100000) + 1000;
      }
      legacyCages.push({
        id: numericId,
        nom: c.nom,
        description: c.description,
        capacite_max: c.capacite_max
      });
    });

    // --- 2. MULTI-GENERATIONAL BIRD GENERATION ---
    const canaris: Canari[] = [];
    let birdId = 1;

    // A ring tracking system to avoid duplicates
    const generatedRings = new Set<string>();
    const generateUniqueRing = (year: number, index: number): string => {
      let ring = `FR-${year}-${index}`;
      let counter = 1;
      while (generatedRings.has(ring)) {
        ring = `FR-${year}-${index}-${counter}`;
        counter++;
      }
      generatedRings.add(ring);
      return ring;
    };

    // 2.1 GENERATION 1: GRANDPARENTS (Ancestors)
    const gpMales: Canari[] = [];
    const gpFemales: Canari[] = [];
    const totalGP = Math.ceil((targetMales + targetFemales) * 0.25); // 25% of founders are grandparents

    for (let i = 1; i <= totalGP; i++) {
      const sp = rand(species);
      const sex = i % 2 === 0 ? 'Mâle' : 'Femelle';
      const race = rand(racesBySpecies[sp.id]);
      const mut = rand(mutations);
      const colBase = rand(couleursBase);
      const fact = rand(facteurs);
      
      const birthYear = rand([2023, 2024]);
      const birthDate = `${birthYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
      const ring = generateUniqueRing(birthYear, 5000 + i);

      const bird: Canari = {
        id: birdId++,
        bague: ring,
        nom: sex === 'Mâle' ? `${race} Aïeul #${i}` : `${race} Aïeule #${i}`,
        sexe: sex,
        espece: sp.id,
        categorie: sp.category,
        race,
        mutation: mut,
        couleur_base: colBase,
        facteur: fact,
        couleur: `${colBase} ${fact} ${mut}`,
        date_naissance: birthDate,
        cage_id: legacyCages[randInt(0, 4)].id,
        pere_id: null,
        mere_id: null,
        archived: i % 15 === 0, // some archived / sold
        photo: getPhotoForSpecies(sp.id),
        photos: [],
        documents: [],
        statut_sante: 'Sain'
      };

      canaris.push(bird);
      if (sex === 'Mâle') gpMales.push(bird);
      else gpFemales.push(bird);
    }

    // Pair grandparents to create Generation 2 Parents
    const gpCouples: Couple[] = [];
    const numGPCouples = Math.min(gpMales.length, gpFemales.length);
    let coupleIdCounter = 1;

    for (let c = 0; c < numGPCouples; c++) {
      gpCouples.push({
        id: coupleIdCounter++,
        male_id: gpMales[c].id,
        femelle_id: gpFemales[c].id,
        date_creation: '2024-03-01',
        statut: 'Dissous'
      });
    }

    // 2.2 GENERATION 2: PARENTS (Core Breeders)
    const parentsMales: Canari[] = [];
    const parentsFemales: Canari[] = [];
    const targetFounders = targetMales + targetFemales;

    for (let i = 1; i <= targetFounders; i++) {
      const sp = rand(species);
      const sex = i <= targetMales ? 'Mâle' : 'Femelle';
      const race = rand(racesBySpecies[sp.id]);
      const mut = rand(mutations);
      const colBase = rand(couleursBase);
      const fact = rand(facteurs);
      
      const birthYear = 2025;
      const birthDate = `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
      const ring = generateUniqueRing(birthYear, 1000 + i);

      // 50% chance of having grandparents assigned
      let pereId = null;
      let mereId = null;
      if (gpCouples.length > 0 && Math.random() < 0.5) {
        const matchingGP = gpCouples[randInt(0, gpCouples.length - 1)];
        // Ensure same species heredity for realism
        const father = canaris.find(b => b.id === matchingGP.male_id);
        const mother = canaris.find(b => b.id === matchingGP.femelle_id);
        if (father && mother && father.espece === sp.id) {
          pereId = father.id;
          mereId = mother.id;
        }
      }

      const isQuarantine = i % 12 === 0;
      const bird: Canari = {
        id: birdId++,
        bague: ring,
        nom: sex === 'Mâle' ? `${race} Élite #${i}` : `${race} Belle #${i}`,
        sexe: sex,
        espece: sp.id,
        categorie: sp.category,
        race,
        mutation: mut,
        couleur_base: colBase,
        facteur: fact,
        couleur: `${colBase} ${fact} ${mut}`,
        date_naissance: birthDate,
        cage_id: isQuarantine ? legacyCages[3].id : legacyCages[randInt(0, legacyCages.length - 1)].id, // 3 is Quarantine
        pere_id: pereId,
        mere_id: mereId,
        archived: false,
        photo: getPhotoForSpecies(sp.id),
        photos: [],
        documents: [],
        statut_sante: isQuarantine ? 'En quarantaine' : (i % 25 === 0 ? 'En traitement' : 'Sain')
      };

      canaris.push(bird);
      if (sex === 'Mâle') parentsMales.push(bird);
      else parentsFemales.push(bird);
    }

    // Pair core parents to create couples
    const couples: Couple[] = [];
    const reproductions: Reproduction[] = [];
    const pontes: Ponte[] = [];
    const jeunes: Jeune[] = [];

    const numActiveCouples = Math.min(parentsMales.length, parentsFemales.length);
    let reproIdCounter = 1;
    let ponteIdCounter = 1;
    let jeuneIdCounter = 1;

    for (let c = 0; c < numActiveCouples; c++) {
      const male = parentsMales[c];
      const female = parentsFemales[c];
      
      const isDissolved = c % 10 === 0;
      const coup: Couple = {
        id: coupleIdCounter++,
        male_id: male.id,
        femelle_id: female.id,
        date_creation: '2026-02-15',
        statut: isDissolved ? 'Dissous' : 'Actif'
      };
      couples.push(coup);

      // Create 1 or 2 reproduction seasons for the couples to generate young/chicks
      const isProductive = c % 6 !== 0; // Some couples have breeding failures / clear eggs
      if (isProductive) {
        const numRepros = c % 2 === 0 ? 2 : 1;
        for (let r = 0; r < numRepros; r++) {
          const isClosed = r === 0;
          const repro: Reproduction = {
            id: reproIdCounter++,
            couple_id: coup.id,
            date_debut: r === 0 ? '2026-03-01' : '2026-05-10',
            statut: isClosed ? 'Clôturé' : 'En cours'
          };
          reproductions.push(repro);

          // Clutches (pontes)
          const eggCount = randInt(3, 5);
          const clearEggs = r === 1 && c % 5 === 0 ? eggCount : randInt(0, 1); // some clear eggs
          const fertilized = Math.max(0, eggCount - clearEggs);
          const hatched = Math.max(0, fertilized - randInt(0, 1));
          const weaned = Math.max(0, hatched - randInt(0, 1));

          const p: Ponte = {
            id: ponteIdCounter++,
            reproduction_id: repro.id,
            date: r === 0 ? '2026-03-05' : '2026-05-14',
            oeufs: eggCount,
            oeufs_fecondes: fertilized,
            eclosions: hatched,
            sevrages: weaned
          };
          pontes.push(p);

          // Create Young birds (Generations 3 & 4)
          for (let j = 0; j < hatched; j++) {
            const isWeaned = j < weaned;
            const status = isWeaned ? 'Sevré' : (rand([true, false]) ? 'En sevrage' : 'Décédé');
            const birthDate = r === 0 ? '2026-03-24' : '2026-06-02';

            const jn: Jeune = {
              id: jeuneIdCounter++,
              ponte_id: p.id,
              bague: status === 'Sevré' ? generateUniqueRing(2026, 9000 + jeuneIdCounter) : undefined,
              statut: status,
              date_naissance: birthDate
            };
            jeunes.push(jn);

            if (status !== 'Décédé') {
              // Add to real bird list
              const youngBird: Canari = {
                id: birdId++,
                bague: jn.bague || `TEMP-2026-${jn.id}`,
                nom: `Fils #${jn.id} (${male.race})`,
                sexe: rand(['Mâle', 'Femelle', 'Indéterminé']),
                espece: male.espece,
                categorie: male.categorie,
                race: male.race,
                mutation: rand([male.mutation, female.mutation, 'Porteur']),
                couleur_base: male.couleur_base,
                facteur: female.facteur,
                couleur: `Panaché ${male.couleur_base} ${male.mutation}`,
                date_naissance: birthDate,
                cage_id: legacyCages[4].id, // Nurserie Volante / Sevrage
                pere_id: male.id,
                mere_id: female.id,
                archived: false,
                photo: getPhotoForSpecies(male.espece),
                photos: [],
                documents: [],
                statut_sante: 'Sain'
              };
              canaris.push(youngBird);
            }
          }
        }
      }
    }

    // Founders and breeders are created first, so removing only the surplus tail
    // preserves pair and parent references while respecting the announced profiles.
    if (canaris.length > targetTotalBirds) {
      canaris.splice(targetTotalBirds);
    }

    // Fix up statuses of birds to represent full range
    canaris.forEach((b, index) => {
      // Sante States: Sain, Quarantaine, Traitement, Blessé, Décédé
      if (index % 15 === 0) {
        b.statut_sante = 'En traitement';
      } else if (index % 18 === 0) {
        b.statut_sante = 'En quarantaine';
        b.cage_id = legacyCages[3].id; // Put in quarantine cage
      } else if (index % 25 === 0) {
        b.statut_sante = 'Blessé';
      } else if (index % 50 === 0) {
        b.statut_sante = 'Décédé';
        b.archived = true;
      } else {
        b.statut_sante = 'Sain';
      }
    });

    // --- 3. HEALTH RECORDS (Sante) ---
    const sante: Sante[] = [];
    const healthTreatments = [
      { name: 'Vermifuge Capizol', cat: 'Traitement', desc: 'Seringue buccale collective pour parasites' },
      { name: 'Cure d\'Alvityl vitamines', cat: 'Vaccin', desc: 'Renforcement immunitaire général' },
      { name: 'Plume incarnée kyste', cat: 'Visite Vétérinaire', desc: 'Ablation chirurgicale d\'un kyste folliculaire' },
      { name: 'Suspicion de coccidiose', cat: 'Symptôme', desc: 'Diarrhée aqueuse et bréchet saillant, mis au chaud' },
      { name: 'Vitamines Fertilité', cat: 'Vaccin', desc: 'Préparation des géniteurs à la ponte' },
      { name: 'Traitement anti-acariens', cat: 'Traitement', desc: 'Application de pipettes Stronghold' }
    ] as const;

    let santeIdCounter = 1;
    const sickBirds = canaris.filter(b => b.statut_sante !== 'Sain');
    const healthyBirds = canaris.filter(b => b.statut_sante === 'Sain');

    for (let h = 1; h <= numHealth; h++) {
      const bird = h % 2 === 0 && sickBirds.length > 0 ? rand(sickBirds) : rand(healthyBirds);
      const treat = rand(healthTreatments);
      const mo = String(randInt(1, 6)).padStart(2, '0');
      const dy = String(randInt(1, 28)).padStart(2, '0');

      sante.push({
        id: santeIdCounter++,
        canari_id: bird.id,
        date: `2026-${mo}-${dy}`,
        traitement: treat.name,
        categorie: treat.cat,
        description: `${treat.desc} - Constaté lors du contrôle de routine.`,
        statut: h % 4 === 0 ? 'En attente' : 'Terminé'
      });
    }

    // --- 4. FINANCES (Expenses & Sales) ---
    const depenses: Depense[] = [];
    const expensesMock = [
      { cat: 'Alimentation', desc: 'Alpiste pur Premium Versele-Laga 25kg', amt: 52.40 },
      { cat: 'Alimentation', desc: 'Pâtée d\'élevage sèche aux œufs d\'or 10kg', amt: 41.20 },
      { cat: 'Santé', desc: 'Vitamines Nekton S + Flacon de Calcilux', amt: 29.80 },
      { cat: 'Matériel', desc: 'Nids en cordelette tressée et crochets x20', amt: 35.00 },
      { cat: 'Cages', desc: 'Cage de concours dôme blanc cintrée', amt: 45.00 },
      { cat: 'Autre', desc: 'Frais de transport d\'oiseaux - Messagerie', amt: 60.00 },
      { cat: 'Matériel', desc: 'Bagues officielles CDE millésime 2026 x100', amt: 18.00 },
      { cat: 'Autre', desc: 'Cotisation annuelle Club Ornithologique', amt: 30.00 }
    ] as const;

    let depenseIdCounter = 1;
    for (let e = 1; e <= numExpenses; e++) {
      const mock = rand(expensesMock);
      const mo = String(randInt(1, 6)).padStart(2, '0');
      const dy = String(randInt(1, 28)).padStart(2, '0');

      depenses.push({
        id: depenseIdCounter++,
        date: `2026-${mo}-${dy}`,
        montant: parseFloat((mock.amt + randFloat(-10, 15)).toFixed(2)),
        categorie: mock.cat,
        description: `${mock.desc} (Facture #${202600 + e})`
      });
    }

    const ventes: Vente[] = [];
    const buyers = [
      'Ornitho-Club Provence', 'Jean-Pierre Martin', 'Marc Dubois', 'Cécile Gauthier', 
      'Élevage de la Haute-Somme', 'Pierre-Alain Dunand', 'Isabelle Meyer'
    ];

    let venteIdCounter = 1;
    for (let v = 1; v <= numSales; v++) {
      const bird = rand(canaris);
      const buyer = rand(buyers);
      const mo = String(randInt(2, 6)).padStart(2, '0');
      const dy = String(randInt(1, 28)).padStart(2, '0');

      ventes.push({
        id: venteIdCounter++,
        canari_id: bird.id,
        prix: rand([25, 35, 45, 55, 65, 80, 120, 150]),
        date: `2026-${mo}-${dy}`,
        acheteur: buyer,
        description: `Cession d'élevage agréée pour concours. Certificat d'origine #${1200 + v}.`
      });
    }

    // --- 5. PLANNING EVENTS (Calendar) ---
    const calendarEvents: CalendarEvent[] = [];
    const eventTitles = [
      { title: '🧼 Désinfection complète', type: 'custom', desc: 'Nettoyage des batteries d\'élevage et abreuvoirs' },
      { title: '🩺 Visite vétérinaire', type: 'treatment', desc: 'Contrôle sanitaire annuel et vaccins' },
      { title: '🌾 Distribution graines fraîches', type: 'custom', desc: 'Ravitaillement annuel mélange canari alpiste' },
      { title: '💍 Baguage des oisillons', type: 'custom', desc: 'Mettre les bagues officielles aux jeunes de 6 jours' },
      { title: '⚖️ Séance de pesée', type: 'custom', desc: 'Peser les futurs champions de concours' },
      { title: '🏷️ Inventaire du stock', type: 'custom', desc: 'Vérifier l\'état des cages et sacs de nourriture' }
    ];

    for (let c = 1; c <= numCustomEvents; c++) {
      const et = rand(eventTitles);
      const mo = String(randInt(7, 9)).padStart(2, '0'); // future dates (July, Aug, Sept)
      const dy = String(randInt(1, 28)).padStart(2, '0');

      calendarEvents.push({
        id: `custom-evt-dyn-${c}`,
        title: et.title,
        description: `${et.desc} - Tâche planifiée de l'éleveur.`,
        date: `2026-${mo}-${dy}`,
        type: et.type as any,
        priority: rand(['low', 'medium', 'high'])
      });
    }

    // --- 6. PLATFORM NOTIFICATIONS ---
    const notifications: PlatformNotification[] = [];
    const notificationTemplates = [
      { title: '⚠️ Rappel Traitement', content: 'Cure de vitamines à administrer dans la cage d\'élevage #2.', type: 'treatment' as const },
      { title: '🐣 Éclosion Détectée', content: 'Le couple #4 a vu sa première éclosion ce matin dans le nid.', type: 'repro' as const },
      { title: '🩺 Quarantaine Entrée', content: 'Le nouvel oiseau importé a été placé dans le Sas Sanitaire.', type: 'system' as const },
      { title: '🎂 Anniversaire Oiseau', content: 'Le mâle reproducteur Gloster Royal #1 fête ses 3 ans aujourd\'hui.', type: 'birthday' as const },
      { title: '🧽 Rappel Nettoyage', content: 'La cage de reproduction Est #3 a besoin d\'un nettoyage de fond.', type: 'system' as const }
    ];

    for (let n = 1; n <= numNotifications; n++) {
      const tpl = rand(notificationTemplates);
      const dy = String(randInt(1, 16)).padStart(2, '0');

      notifications.push({
        id: `notif-dyn-${n}`,
        date: `2026-07-${dy}`,
        title: tpl.title,
        content: tpl.content,
        type: tpl.type,
        priority: rand(['low', 'medium', 'high']),
        read: n % 3 === 0,
        archived: false,
        actionUrl: `/qa`
      });
    }

    // --- 7. ADDITIONAL HABITAT ENTITY RECORDS ---
    const quarantineRecords: QuarantineRecord[] = [];
    const deplacementRecords: DeplacementRecord[] = [];

    // Quarantine records
    const quarantinedBirds = canaris.filter(b => b.statut_sante === 'En quarantaine');
    quarantinedBirds.forEach((b, idx) => {
      quarantineRecords.push({
        id: `quar-rec-${idx}`,
        birdId: b.id,
        quarantineAreaId: 'quarantine-area-1',
        dateEntree: '2026-07-01',
        dureePrevue: 30,
        dateSortieEstimee: '2026-07-31',
        raison: 'Nouvel achat en bourse d\'oiseaux',
        traitements: 'Vitamine E + Vermifuge',
        observations: 'Oiseau vif et en bonne santé apparente',
        statut: 'En cours',
        createdAt: '2026-07-01T10:00:00Z',
        updatedAt: '2026-07-01T10:00:00Z',
        isArchived: false
      });
    });

    // Deplacements records
    for (let d = 1; d <= Math.ceil(numCages * 0.5); d++) {
      const b = rand(canaris);
      const cgOrig = rand(legacyCages);
      const cgDest = rand(legacyCages);

      deplacementRecords.push({
        id: `dep-rec-${d}`,
        birdId: b.id,
        origineType: 'Cage',
        origineId: String(cgOrig.id),
        origineNom: cgOrig.nom,
        destinationType: 'Cage',
        destinationId: String(cgDest.id),
        destinationNom: cgDest.nom,
        date: '2026-06-15',
        motif: 'Changement de couple reproducteur',
        utilisateur: 'Éleveur Principal',
        commentaire: 'Mise en contact pour la seconde ponte de l\'année',
        createdAt: '2026-06-15T14:30:00Z'
      });
    }

    return {
      facilities,
      zones,
      aviaries,
      cages,
      legacyCages,
      compartments,
      quarantineAreas,
      quarantineRecords,
      deplacementRecords,
      canaris,
      couples,
      reproductions,
      pontes,
      jeunes,
      sante,
      depenses,
      ventes,
      calendarEvents,
      notifications
    };
  }

  static isDemoActive(): boolean {
    return localStorage.getItem('bird_academy_demo_active') === 'true';
  }

  static toggleDemo(active: boolean, size: 'small' | 'medium' | 'large' = 'small'): void {
    localStorage.setItem('bird_academy_demo_active', active ? 'true' : 'false');
    if (active) {
      // Seed data with size
      this.seed(size);
    }
  }

  static seed(size: 'small' | 'medium' | 'large' = 'small'): void {
    const data = this.generate(size);

    // Save under appropriate demo keys
    localStorage.setItem('demo_ba_facilities', JSON.stringify(data.facilities));
    localStorage.setItem('demo_ba_zones', JSON.stringify(data.zones));
    localStorage.setItem('demo_ba_aviaries', JSON.stringify(data.aviaries));
    localStorage.setItem('demo_ba_cages_v2', JSON.stringify(data.cages));
    localStorage.setItem('demo_ba_compartments', JSON.stringify(data.compartments));
    localStorage.setItem('demo_ba_quarantine_areas', JSON.stringify(data.quarantineAreas));
    localStorage.setItem('demo_ba_quarantine_records', JSON.stringify(data.quarantineRecords));
    localStorage.setItem('demo_ba_deplacements', JSON.stringify(data.deplacementRecords));
    localStorage.setItem('demo_cages', JSON.stringify(data.legacyCages));
    localStorage.setItem('demo_canaris', JSON.stringify(data.canaris));
    localStorage.setItem('demo_couples', JSON.stringify(data.couples));
    localStorage.setItem('demo_reproductions', JSON.stringify(data.reproductions));
    localStorage.setItem('demo_pontes', JSON.stringify(data.pontes));
    localStorage.setItem('demo_jeunes', JSON.stringify(data.jeunes));
    localStorage.setItem('demo_sante', JSON.stringify(data.sante));
    localStorage.setItem('demo_depenses', JSON.stringify(data.depenses));
    localStorage.setItem('demo_ventes', JSON.stringify(data.ventes));
    localStorage.setItem('demo_platform_custom_calendar_events', JSON.stringify(data.calendarEvents));
    localStorage.setItem('demo_platform_notifications', JSON.stringify(data.notifications));
  }
}
