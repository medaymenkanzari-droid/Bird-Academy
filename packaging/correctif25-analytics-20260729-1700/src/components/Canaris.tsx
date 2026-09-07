/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, X, Check, ArrowRight, User, Info, Grid, 
  ShieldAlert, AlertTriangle, Award, Workflow, Dna, Calendar, Camera, FileText, ChevronDown, 
  ChevronUp, Copy, Archive, RefreshCw, Upload, FileCheck, ClipboardList, LogOut
} from 'lucide-react';
import { Canari, Cage } from '../types';
import { calculateAgeString, buildGenealogyTree, calculateInbreedingCOI, getInbreedingCategory } from '../utils/genealogy';
import { useLanguage } from '../context/LanguageContext';
import { SPECIES_REGISTRY, getSpeciesById } from '../data/speciesRegistry';
import { BirdService } from '../features/birds/services/BirdService';
import { BirdEngine } from '../business/BirdEngine';
import { ActivityLogger, EventType } from '../storage/ActivityLogger';

import { 
  AppInput, AppSelect, AppCard, AppAlert, AppButton, AppTable, AppBadge, SpeciesBadge, AppEmptyState
} from './design-system';

// Local translation dictionary for French, English, Arabic, Spanish, Italian
export const LOCAL_I18N: Record<string, Record<string, string>> = {
  fr: {
    title: "Module Oiseaux V2",
    subtitle: "Architecture native de gestion de cheptel, généalogie structurée, historique d'activité, galerie et documents.",
    searchPlaceholder: "Rechercher par nom, bague, race, mutation, couleur...",
    addBirdBtn: "Ajouter un oiseau",
    advancedFilters: "Recherche avancée & Filtres combinables",
    allSpecies: "Toutes les espèces",
    allCategories: "Toutes les catégories",
    allBreeds: "Toutes les races",
    allGenders: "Tous les sexes",
    allCages: "Toutes les cages",
    resetFilters: "Réinitialiser",
    selectedCount: "{count} sélectionné(s)",
    bulkArchive: "Archiver la sélection",
    bulkDelete: "Supprimer la sélection",
    bulkDuplicate: "Dupliquer la sélection",
    desktopView: "Vue Tableau",
    mobileView: "Vue Cartes",
    photoCol: "Photo",
    ringCol: "Bague",
    nameCol: "Nom",
    speciesCol: "Espèce",
    breedCol: "Race",
    genderCol: "Sexe",
    ageCol: "Âge",
    locationCol: "Localisation",
    statusCol: "Statut",
    actionsCol: "Actions",
    noBirdsFound: "Aucun oiseau ne correspond à vos critères.",
    addFormTitle: "Fiche d'identification biologique V2",
    editFormTitle: "Modifier l'oiseau : {name}",
    tabIdentity: "1. Identité",
    tabOrigin: "2. Origine",
    tabLocalisation: "3. Localisation",
    tabState: "4. État & Obs.",
    tabTimeline: "Historique",
    tabGallery: "Galerie Photos",
    tabDocuments: "Documents",
    labelName: "Nom usuel / Surnom *",
    labelRing: "Numéro de bague (Unique) *",
    labelSpecies: "Espèce *",
    labelCategory: "Catégorie d'élevage *",
    labelBreed: "Race / Variété *",
    labelMutation: "Mutation",
    labelColor: "Couleur de base *",
    labelGender: "Sexe de l'oiseau *",
    labelBirthDate: "Date de naissance / Acquisition *",
    labelIsAcquisition: "Oiseau issu d'une acquisition extérieure ?",
    labelOriginalBreeder: "Éleveur d'origine",
    quarantineProtocol: "Protocole de quarantaine",
    quarantineCage: "Cage de quarantaine",
    quarantineAssignLater: "Créer / Assigner plus tard",
    quarantineEntryDate: "Date d'entrée",
    quarantineDuration: "Durée recommandée",
    quarantineDays: "{count} jours",
    labelBiologicalFather: "Père Biologique",
    labelBiologicalMother: "Mère Biologique",
    labelFosterFather: "Père Nourricier (Adoption)",
    labelFosterMother: "Mère Nourricière (Adoption)",
    sectionBiologicalAncestry: "Ascendance biologique",
    sectionFosterLineage: "Lignée nourricière (Adoption)",
    labelElevageName: "Nom de l'élevage / Établissement",
    labelZone: "Zone / Secteur",
    labelVoliere: "Volière / Grand espace",
    labelCage: "Cage d'affectation *",
    labelCompartiment: "Compartiment / Box",
    labelStatus: "Statut actuel *",
    labelObservations: "Observations & Notes libres",
    labelAgeCalculated: "Âge calculé automatiquement",
    labelConsanguinityCheck: "Analyse de consanguinité (Calculateur COI)",
    consanguinityWarn: "Attention : Ce croisement présente un taux de consanguinité de {coi}% ({level}). Recommandation : {rec}.",
    consanguinitySuccess: "Excellent : Aucun lien de parenté direct détecté ou taux très faible ({coi}%). Recommandation : {rec}.",
    statusActive: "Actif / En élevage",
    statusQuarantine: "En quarantaine",
    statusSick: "En traitement / Malade",
    statusReproduction: "En cours de reproduction",
    statusSold: "Vendu",
    statusDeceased: "Décédé",
    statusRest: "En repos",
    btnSaveBird: "Enregistrer l'oiseau",
    btnCancel: "Annuler le formulaire",
    btnDuplicate: "Dupliquer",
    btnArchive: "Archiver",
    btnRestore: "Restaurer",
    btnDelete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer définitivement cet oiseau ? Cette action est irréversible.",
    confirmArchive: "Archiver cet oiseau ? Il n'apparaîtra plus dans les listes actives.",
    galleryTitle: "Galerie Photos (Haute Résolution)",
    gallerySub: "Gérez l'album d'images de l'oiseau. La première image est la photo principale.",
    galleryMakePrincipal: "Définir comme principale",
    galleryDeleteLogical: "Supprimer de la galerie",
    galleryCloudReady: "Image préparée pour la synchronisation Cloud",
    galleryUploadBtn: "Ajouter des photos",
    documentsTitle: "Gestion des Documents d'Élevage",
    documentsSub: "Associez des pièces jointes officielles sans transfert cloud (Stockage local sécurisé).",
    docTypeCert: "Certificat de cession / de sexage",
    docTypeAnalyse: "Analyse vétérinaire (PCR, fientes...)",
    docTypeFacture: "Facture d'achat",
    docTypeAutre: "Document libre",
    docName: "Nom du document *",
    docDate: "Date du document",
    docDesc: "Description rapide / Notes",
    btnAddDoc: "Associer le document",
    docEmptyList: "Aucun document associé à cet oiseau.",
    successMsg: "Opération réussie !",
    errorMsg: "Veuillez corriger les erreurs du formulaire.",
    showArchivedOnly: "Afficher les oiseaux archivés uniquement",
    showActiveAndArchived: "Inclure les oiseaux archivés",
    reproDispoLabel: "Disponibilité pour la reproduction (Âge >= 10m)",
    quarantineLabel: "Quarantaine active",
    male: "Mâle",
    female: "Femelle",
    undetermined: "Indéterminé"
  },
  en: {
    title: "Birds Module V2",
    subtitle: "Native flock management architecture, structured genealogy, activity history, gallery and documents.",
    searchPlaceholder: "Search by band, name, breed, mutation, color...",
    addBirdBtn: "Add bird",
    advancedFilters: "Advanced Search & Combinable Filters",
    allSpecies: "All species",
    allCategories: "All categories",
    allBreeds: "All breeds",
    allGenders: "All genders",
    allCages: "All cages",
    resetFilters: "Reset",
    selectedCount: "{count} selected",
    bulkArchive: "Archive selected",
    bulkDelete: "Delete selected",
    bulkDuplicate: "Duplicate selected",
    desktopView: "Table View",
    mobileView: "Card View",
    photoCol: "Photo",
    ringCol: "Band",
    nameCol: "Name",
    speciesCol: "Species",
    breedCol: "Breed",
    genderCol: "Gender",
    ageCol: "Age",
    locationCol: "Location",
    statusCol: "Status",
    actionsCol: "Actions",
    noBirdsFound: "No birds match the search criteria.",
    addFormTitle: "Biological Profile Form V2",
    editFormTitle: "Edit bird: {name}",
    tabIdentity: "1. Identity",
    tabOrigin: "2. Origin",
    tabLocalisation: "3. Location",
    tabState: "4. State & Obs.",
    tabTimeline: "History",
    tabGallery: "Photo Gallery",
    tabDocuments: "Documents",
    labelName: "Usual Name / Nickname *",
    labelRing: "Band number (Unique) *",
    labelSpecies: "Species *",
    labelCategory: "Category *",
    labelBreed: "Breed / Variety *",
    labelMutation: "Mutation",
    labelColor: "Base Color *",
    labelGender: "Bird's Gender *",
    labelBirthDate: "Birth / Acquisition Date *",
    labelIsAcquisition: "Is this bird an external acquisition?",
    labelOriginalBreeder: "Original Breeder",
    quarantineProtocol: "Quarantine protocol",
    quarantineCage: "Quarantine cage",
    quarantineAssignLater: "Create / Assign later",
    quarantineEntryDate: "Entry date",
    quarantineDuration: "Recommended duration",
    quarantineDays: "{count} days",
    labelBiologicalFather: "Biological Father",
    labelBiologicalMother: "Biological Mother",
    labelFosterFather: "Foster Father (Adoption)",
    labelFosterMother: "Foster Mother (Adoption)",
    sectionBiologicalAncestry: "Biological ancestry",
    sectionFosterLineage: "Foster lineage (Adoption)",
    labelElevageName: "Aviary Name / Facility",
    labelZone: "Zone / Sector",
    labelVoliere: "Voliary / Aviary",
    labelCage: "Assigned Cage *",
    labelCompartiment: "Compartment / Box",
    labelStatus: "Current Status *",
    labelObservations: "Observations & Free notes",
    labelAgeCalculated: "Age automatically calculated",
    labelConsanguinityCheck: "Inbreeding Analysis (COI Calculator)",
    consanguinityWarn: "Warning: This breeding pairing has an inbreeding coefficient of {coi}% ({level}). Recommendation: {rec}.",
    consanguinitySuccess: "Excellent: No direct kinship detected or very low coefficient ({coi}%). Recommendation: {rec}.",
    statusActive: "Active / Breeding",
    statusQuarantine: "In quarantine",
    statusSick: "Under treatment / Sick",
    statusReproduction: "Currently breeding",
    statusSold: "Sold",
    statusDeceased: "Deceased",
    statusRest: "Resting",
    btnSaveBird: "Save Bird Data",
    btnCancel: "Cancel Form",
    btnDuplicate: "Duplicate",
    btnArchive: "Archive",
    btnRestore: "Restore",
    btnDelete: "Delete",
    confirmDelete: "Are you sure you want to permanently delete this bird? This action is irreversible.",
    confirmArchive: "Archive this bird? It will no longer appear in active lists.",
    galleryTitle: "Photo Gallery (High Resolution)",
    gallerySub: "Manage the bird's image album. The first image is always the main cover photo.",
    galleryMakePrincipal: "Set as main",
    galleryDeleteLogical: "Remove from gallery",
    galleryCloudReady: "Image prepared for Cloud synchronization",
    galleryUploadBtn: "Add Photos",
    documentsTitle: "Breeding Document Manager",
    documentsSub: "Attach official PDF files or images locally without cloud transfer (Secure Local Storage).",
    docTypeCert: "Acquisition / Sexing Certificate",
    docTypeAnalyse: "Veterinary PCR or Fecal analysis",
    docTypeFacture: "Purchase Invoice",
    docTypeAutre: "Miscellaneous document",
    docName: "Document name *",
    docDate: "Document date",
    docDesc: "Short description / Notes",
    btnAddDoc: "Attach Document",
    docEmptyList: "No documents attached to this bird.",
    successMsg: "Operation successful!",
    errorMsg: "Please fix the form errors.",
    showArchivedOnly: "Show archived birds only",
    showActiveAndArchived: "Include archived birds",
    reproDispoLabel: "Availability for breeding (Age >= 10m)",
    quarantineLabel: "Active quarantine",
    male: "Male",
    female: "Female",
    undetermined: "Undetermined"
  },
  ar: {
    title: "وحدة الطيور الإصدار 2",
    subtitle: "بنية إدارة الطيور الأصلية، الأنساب المهيكلة، سجل النشاط، معرض الصور والمستندات.",
    searchPlaceholder: "البحث برقم الحجل، الاسم، السلالة، الطفرة، اللون...",
    addBirdBtn: "إضافة طائر",
    advancedFilters: "البحث المتقدم والفلاتر المشتركة",
    allSpecies: "جميع الأنواع",
    allCategories: "جميع الفئات",
    allBreeds: "جميع السلالات",
    allGenders: "جميع الجنسين",
    allCages: "جميع الأقفاص",
    resetFilters: "إعادة ضبط",
    selectedCount: "تم تحديد {count}",
    bulkArchive: "أرشفة المحدد",
    bulkDelete: "حذف المحدد",
    bulkDuplicate: "نسخ المحدد",
    desktopView: "عرض الجدول",
    mobileView: "عرض البطاقات",
    photoCol: "الصورة",
    ringCol: "الحجل",
    nameCol: "الاسم",
    speciesCol: "النوع",
    breedCol: "السلالة",
    genderCol: "الجens",
    ageCol: "العمر",
    locationCol: "الموقع",
    statusCol: "الحالة",
    actionsCol: "الإجراءات",
    noBirdsFound: "لا توجد طيور تطابق معايير البحث.",
    addFormTitle: "نموذج التعريف البيولوجي (الإصدار 2)",
    editFormTitle: "تعديل الطائر: {name}",
    tabIdentity: "1. الهوية",
    tabOrigin: "2. الأصل",
    tabLocalisation: "3. الموقع",
    tabState: "4. الحالة والملاحظات",
    tabTimeline: "السجل التاريخي",
    tabGallery: "معرض الصور",
    tabDocuments: "المستندات",
    labelName: "الاسم الشائع / اللقب *",
    labelRing: "رقم الحجل (فريد) *",
    labelSpecies: "النوع *",
    labelCategory: "الفئة *",
    labelBreed: "السلالة / الصنف *",
    labelMutation: "الطفرة",
    labelColor: "اللون الأساسي *",
    labelGender: "جنس الطائر *",
    labelBirthDate: "تاريخ الميلاد / الشراء *",
    labelIsAcquisition: "هل الطائر مقتنى من خارج المزرعة؟",
    labelOriginalBreeder: "المربي الأصلي",
    quarantineProtocol: "بروتوكول الحجر الصحي",
    quarantineCage: "قفص الحجر الصحي",
    quarantineAssignLater: "إنشاء / تعيين لاحقًا",
    quarantineEntryDate: "تاريخ الدخول",
    quarantineDuration: "المدة الموصى بها",
    quarantineDays: "{count} يومًا",
    labelBiologicalFather: "الأب البيولوجي",
    labelBiologicalMother: "الأم البيولوجية",
    labelFosterFather: "الأب الحاضن (تبني)",
    labelFosterMother: "الأم الحاضنة (تبني)",
    sectionBiologicalAncestry: "الأصل البيولوجي",
    sectionFosterLineage: "سلالة الحضانة (التبني)",
    labelElevageName: "اسم المزرعة / المنشأة",
    labelZone: "المنطقة / القطاع",
    labelVoliere: "المطير / المسكن",
    labelCage: "القفص المخصص *",
    labelCompartiment: "القسم / الصندوق",
    labelStatus: "الحالة الحالية *",
    labelObservations: "الملاحظات والتدوينات الحرة",
    labelAgeCalculated: "العمر المحسوب تلقائيًا",
    labelConsanguinityCheck: "تحليل صلة القرابة (حاسبة COI)",
    consanguinityWarn: "تنبيه: هذا التزاوج يظهر نسبة قرابة تبلغ {coi}% ({level}). التوصية: {rec}.",
    consanguinitySuccess: "ممتاز: لا يوجد رابط قرابة مباشر أو النسبة منخفضة جدًا ({coi}%). التوصية: {rec}.",
    statusActive: "نشط / في التربية",
    statusQuarantine: "في الحجر الصحي",
    statusSick: "تحت العلاج / مريض",
    statusReproduction: "في مرحلة التكاثر",
    statusSold: "مباع",
    statusDeceased: "ميت",
    statusRest: "في فترة راحة",
    btnSaveBird: "حفظ بيانات الطائر",
    btnCancel: "إلغاء النموذج",
    btnDuplicate: "نسخ",
    btnArchive: "أرشفة",
    btnRestore: "استعادة",
    btnDelete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا الطائر نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.",
    confirmArchive: "أرشفة هذا الطائر؟ لن يظهر مجدداً في قوائم النشطين.",
    galleryTitle: "معرض الصور (دقة عالية)",
    gallerySub: "إدارة ألبوم صور الطائر. الصورة الأولى هي دائماً الصورة الرئيسية.",
    galleryMakePrincipal: "تعيين كصورة رئيسية",
    galleryDeleteLogical: "حذف من المعرض",
    galleryCloudReady: "الصورة جاهزة للمزامنة السحابية",
    galleryUploadBtn: "إضافة صور",
    documentsTitle: "إدارة مستندات التربية",
    documentsSub: "ربط المرفقات الرسمية محلياً دون رفع سحابي (تخزين محلي آمن).",
    docTypeCert: "شهادة نقل ملكية / تحديد جنس",
    docTypeAnalyse: "تحليل بيطري (PCR، عينات...)",
    docTypeFacture: "فاتورة شراء",
    docTypeAutre: "مستند حر",
    docName: "اسم المستند *",
    docDate: "تاريخ المستند",
    docDesc: "وصف سريع / ملاحظات",
    btnAddDoc: "ربط المستند",
    docEmptyList: "لا توجد مستندات مرتبطة بهذا الطائر.",
    successMsg: "نجحت العملية بنجاح!",
    errorMsg: "يرجى تصحيح أخطاء النموذج.",
    showArchivedOnly: "عرض الطيور المؤرشفة فقط",
    showActiveAndArchived: "عرض الطيور المؤرشفة أيضاً",
    reproDispoLabel: "متاح للتزاوج (العمر >= 10 أشهر)",
    quarantineLabel: "الحجر الصحي النشط",
    male: "ذكر",
    female: "أنثى",
    undetermined: "غير محدد"
  },
  es: {
    title: "Módulo Aves V2",
    subtitle: "Arquitectura nativa de gestión del plantel, genealogía estructurada, historial de actividad, galería y documentos.",
    searchPlaceholder: "Buscar por anilla, nombre, raza, mutación, color...",
    addBirdBtn: "Añadir ave",
    advancedFilters: "Búsqueda Avanzada & Filtros Combinables",
    allSpecies: "Todas las especies",
    allCategories: "Todas las categorías",
    allBreeds: "Todas las razas",
    allGenders: "Todos los sexos",
    allCages: "Todas las jaulas",
    resetFilters: "Restablecer",
    selectedCount: "{count} seleccionado(s)",
    bulkArchive: "Archivar selección",
    bulkDelete: "Eliminar selección",
    bulkDuplicate: "Duplicar selección",
    desktopView: "Vista Tabla",
    mobileView: "Vista Tarjetas",
    photoCol: "Foto",
    ringCol: "Anilla",
    nameCol: "Nombre",
    speciesCol: "Especie",
    breedCol: "Raza",
    genderCol: "Sexo",
    ageCol: "Edad",
    locationCol: "Ubicación",
    statusCol: "Estado",
    actionsCol: "Acciones",
    noBirdsFound: "Ningún ave coincide con sus criterios de búsqueda.",
    addFormTitle: "Ficha de Identificación Biológica V2",
    editFormTitle: "Editar ave: {name}",
    tabIdentity: "1. Identidad",
    tabOrigin: "2. Origen",
    tabLocalisation: "3. Localización",
    tabState: "4. Estado & Obs.",
    tabTimeline: "Historial",
    tabGallery: "Galería de Fotos",
    tabDocuments: "Documentos",
    labelName: "Nombre común / Apodo *",
    labelRing: "Número de anilla (Único) *",
    labelSpecies: "Especie *",
    labelCategory: "Categoría de cría *",
    labelBreed: "Raza / Variedad *",
    labelMutation: "Mutación",
    labelColor: "Color de base *",
    labelGender: "Sexo del ave *",
    labelBirthDate: "Fecha de nacimiento / adquisición *",
    labelIsAcquisition: "¿Ave proveniente de adquisición exterior?",
    labelOriginalBreeder: "Criador de origen",
    quarantineProtocol: "Protocolo de cuarentena",
    quarantineCage: "Jaula de cuarentena",
    quarantineAssignLater: "Crear / asignar más tarde",
    quarantineEntryDate: "Fecha de entrada",
    quarantineDuration: "Duración recomendada",
    quarantineDays: "{count} días",
    labelBiologicalFather: "Padre Biológico",
    labelBiologicalMother: "Madre Biológica",
    labelFosterFather: "Padre Adoptivo (Nodriza)",
    labelFosterMother: "Madre Adoptiva (Nodriza)",
    sectionBiologicalAncestry: "Ascendencia biológica",
    sectionFosterLineage: "Linaje adoptivo (Adopción)",
    labelElevageName: "Nombre del criadero / Establecimiento",
    labelZone: "Zona / Sector",
    labelVoliere: "Voladero / Aviario",
    labelCage: "Jaula asignada *",
    labelCompartiment: "Compartimento / Box",
    labelStatus: "Estado actual *",
    labelObservations: "Observaciones & Notas libres",
    labelAgeCalculated: "Edad calculada automáticamente",
    labelConsanguinityCheck: "Análisis de consanguinidad (Calculador COI)",
    consanguinityWarn: "Atención: Este cruce presenta un coeficiente de consanguinidad del {coi}% ({level}). Recomendación: {rec}.",
    consanguinitySuccess: "Excelente: Sin parentesco directo detectado o coeficiente muy bajo ({coi}%). Recomendación: {rec}.",
    statusActive: "Activo / En cría",
    statusQuarantine: "En cuarentena",
    statusSick: "En tratamiento / Enfermo",
    statusReproduction: "En reproducción",
    statusSold: "Vendido",
    statusDeceased: "Fallecido",
    statusRest: "En reposo",
    btnSaveBird: "Guardar datos del ave",
    btnCancel: "Cancelar Formulario",
    btnDuplicate: "Duplicar",
    btnArchive: "Archivar",
    btnRestore: "Restaurar",
    btnDelete: "Eliminar",
    confirmDelete: "¿Está seguro de querer eliminar definitivamente esta ave? Esta acción es irreversible.",
    confirmArchive: "¿Archivar esta ave? Ya no aparecerá en las listas activas.",
    galleryTitle: "Galería de Fotos (Alta Resolución)",
    gallerySub: "Gestione el álbum de imágenes del ave. La primera imagen es la foto principal.",
    galleryMakePrincipal: "Definir como principal",
    galleryDeleteLogical: "Eliminar de la galería",
    galleryCloudReady: "Imagen preparada para sincronización en la Nube",
    galleryUploadBtn: "Añadir Fotos",
    documentsTitle: "Gestión de Documentos de Cría",
    documentsSub: "Asocie archivos locales sin subirlos a la nube (Almacenamiento local seguro).",
    docTypeCert: "Certificado de cesión / sexado",
    docTypeAnalyse: "Análisis veterinario (PCR, heces...)",
    docTypeFacture: "Factura de compra",
    docTypeAutre: "Documento libre",
    docName: "Nombre del documento *",
    docDate: "Fecha del documento",
    docDesc: "Breve descripción / Notas",
    btnAddDoc: "Asociar Documento",
    docEmptyList: "Ningún documento asociado a esta ave.",
    successMsg: "¡Operación completada con éxito!",
    errorMsg: "Por favor, corrija los errores del formulario.",
    showArchivedOnly: "Mostrar solo aves archivadas",
    showActiveAndArchived: "Incluir aves archivadas",
    reproDispoLabel: "Disponibilidad para la reproducción (Edad >= 10m)",
    quarantineLabel: "Cuarentena activa",
    male: "Macho",
    female: "Hembra",
    undetermined: "Indeterminado"
  },
  it: {
    title: "Modulo Uccelli V2",
    subtitle: "Architettura nativa di gestione del patrimonio, genealogia strutturata, cronologia delle attività, galleria e documenti.",
    searchPlaceholder: "Cerca per anello, nome, razza, mutazione, colore...",
    addBirdBtn: "Aggiungi uccello",
    advancedFilters: "Ricerca Avanzata & Filtri Combinabili",
    allSpecies: "Tutte le specie",
    allCategories: "Tutte le categorie",
    allBreeds: "Tutte le razze",
    allGenders: "Tutti i sessi",
    allCages: "Tutte le gabbie",
    resetFilters: "Reimposta",
    selectedCount: "{count} selezionato/i",
    bulkArchive: "Archivia selezione",
    bulkDelete: "Elimina selezione",
    bulkDuplicate: "Duplica selezione",
    desktopView: "Vista Tabella",
    mobileView: "Vista Carte",
    photoCol: "Foto",
    ringCol: "Anello",
    nameCol: "Nome",
    speciesCol: "Specie",
    breedCol: "Razza",
    genderCol: "Sesso",
    ageCol: "Età",
    locationCol: "Posizione",
    statusCol: "Stato",
    actionsCol: "Azioni",
    noBirdsFound: "Nessun uccello corrisponde ai criteri di ricerca.",
    addFormTitle: "Scheda di Identificazione Biologica V2",
    editFormTitle: "Modifica uccello: {name}",
    tabIdentity: "1. Identità",
    tabOrigin: "2. Origine",
    tabLocalisation: "3. Posizione",
    tabState: "4. Stato & Obs.",
    tabTimeline: "Cronologia",
    tabGallery: "Galleria Foto",
    tabDocuments: "Documenti",
    labelName: "Nome comune / Soprannome *",
    labelRing: "Numero di anello (Unico) *",
    labelSpecies: "Specie *",
    labelCategory: "Categoria di allevamento *",
    labelBreed: "Razza / Varietà *",
    labelMutation: "Mutazione",
    labelColor: "Colore di base *",
    labelGender: "Sesso dell'uccello *",
    labelBirthDate: "Data di nascita / acquisto *",
    labelIsAcquisition: "Uccello proveniente da acquisto esterno?",
    labelOriginalBreeder: "Allevatore d'origine",
    quarantineProtocol: "Protocollo di quarantena",
    quarantineCage: "Gabbia di quarantena",
    quarantineAssignLater: "Crea / assegna più tardi",
    quarantineEntryDate: "Data di ingresso",
    quarantineDuration: "Durata consigliata",
    quarantineDays: "{count} giorni",
    labelBiologicalFather: "Padre Biologico",
    labelBiologicalMother: "Madre Biologica",
    labelFosterFather: "Padre Adottivo (Balia)",
    labelFosterMother: "Madre Adottiva (Balia)",
    sectionBiologicalAncestry: "Ascendenza biologica",
    sectionFosterLineage: "Linea adottiva (Adozione)",
    labelElevageName: "Nome dell'allevamento / Stabilimento",
    labelZone: "Zona / Settore",
    labelVoliere: "Voliera / Grande spazio",
    labelCage: "Gabbia assegnata *",
    labelCompartiment: "Scompartimento / Box",
    labelStatus: "Stato attuale *",
    labelObservations: "Osservazioni & Note libere",
    labelAgeCalculated: "Età calcolata automaticamente",
    labelConsanguinityCheck: "Analisi di consanguineità (Calcolatore COI)",
    consanguinityWarn: "Attenzione: Questo accoppiamento presenta un coefficiente di consanguineità del {coi}% ({level}). Raccomandazione: {rec}.",
    consanguinitySuccess: "Eccellente: Nessun legame di parentela diretto rilevato o tasso molto basso ({coi}%). Raccomandazione: {rec}.",
    statusActive: "Attivo / In allevamento",
    statusQuarantine: "In quarantena",
    statusSick: "In trattamento / Malato",
    statusReproduction: "In riproduzione",
    statusSold: "Venduto",
    statusDeceased: "Deceduto",
    statusRest: "In riposo",
    btnSaveBird: "Salva dati uccello",
    btnCancel: "Annulla modulo",
    btnDuplicate: "Duplica",
    btnArchive: "Archivia",
    btnRestore: "Ripristina",
    btnDelete: "Elimina",
    confirmDelete: "Sei sicuro di voler eliminare definitivamente questo uccello? L'azione è irreversibile.",
    confirmArchive: "Archiviare questo uccello? Non apparirà più nelle liste attive.",
    galleryTitle: "Galleria Foto (Alta Risoluzione)",
    gallerySub: "Gestisci l'album fotografico dell'uccello. La prima immagine è la foto principale.",
    galleryMakePrincipal: "Imposta come principale",
    galleryDeleteLogical: "Rimuovi dalla galleria",
    galleryCloudReady: "Immagine pronta per la sincronizzazione Cloud",
    galleryUploadBtn: "Aggiungi Foto",
    documentsTitle: "Gestione dei Documenti di Allevamento",
    documentsSub: "Associa file locali in modo sicuro senza trasferimento cloud (Archiviazione locale protetta).",
    docTypeCert: "Certificato di cessione / sessaggio",
    docTypeAnalyse: "Analisi veterinaria (PCR, feci...)",
    docTypeFacture: "Fattura di acquisto",
    docTypeAutre: "Documento libero",
    docName: "Nome del documento *",
    docDate: "Data del documento",
    docDesc: "Breve descrizione / Note",
    btnAddDoc: "Associa Documento",
    docEmptyList: "Nessun documento associato a questo uccello.",
    successMsg: "Operazione completata con successo!",
    errorMsg: "Si prega di correggere gli errori nel modulo.",
    showArchivedOnly: "Mostra solo uccelli archiviati",
    showActiveAndArchived: "Includi uccelli archiviati",
    reproDispoLabel: "Disponibilità per la riproduzione (Età >= 10m)",
    quarantineLabel: "Quarantena attiva",
    male: "Maschio",
    female: "Femmina",
    undetermined: "Indeterminato"
  }
};

// Preset constants for Canaries (backwards compatibility fallback)
export const CANARI_MUTATIONS = [
  "Classique", "Opale", "Pastel", "Jaspe", "Satiné", "Topaze", "Eumo", 
  "Onyx", "Cobalt", "Phaeo", "Rubino", "Lutino", "Albino", "Agate", 
  "Isabelle", "Brun", "Noir"
];

export const CANARI_COULEURS_BASE = [
  "Jaune", "Rouge", "Blanc", "Ivoire Jaune", "Ivoire Rouge", "Orange", 
  "Jaune-Vert", "Gris", "Cannelle"
];

export const CANARI_FACTEURS = [
  "Intensif", "Schimmel (Givré)", "Mosaïque", "Non applicable"
];

interface CanarisProps {
  canaris: Canari[];
  cages: Cage[];
  onAddCanari: (bird: Omit<Canari, 'id'>) => boolean | string;
  onEditCanari: (bird: Canari) => boolean | string;
  onDeleteCanari: (id: number) => boolean | string;
  onBirdsChanged: () => void;
  quickAddOpen?: boolean;
  setQuickAddOpen?: (open: boolean) => void;
}

export default function Canaris({
  canaris: propCanaris,
  cages,
  onAddCanari,
  onEditCanari,
  onDeleteCanari,
  onBirdsChanged,
  quickAddOpen = false,
  setQuickAddOpen
}: CanarisProps) {
  const { language, isRtl } = useLanguage();

  // Pick local i18n
  const localT = useCallback((key: string, vars?: Record<string, any>) => {
    const dict = LOCAL_I18N[language] || LOCAL_I18N.fr;
    let text = dict[key] || key;
    if (vars) {
      Object.keys(vars).forEach(vKey => {
        text = text.replace(`{${vKey}}`, String(vars[vKey]));
      });
    }
    return text;
  }, [language]);

  // Unified State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBird, setSelectedBird] = useState<Canari | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBirdIds, setSelectedBirdIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches
      ? 'mobile'
      : 'desktop'
  );
  
  // Advanced Filters State
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBreed, setFilterBreed] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCage, setFilterCage] = useState('');
  const [filterMutation, setFilterMutation] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterReproDispo, setFilterReproDispo] = useState<boolean | null>(null);
  const [filterQuarantine, setFilterQuarantine] = useState<boolean | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting State
  const [sortField, setSortField] = useState<keyof Canari | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form V2 State and Tabs
  const [formTab, setFormTab] = useState<'identity' | 'origin' | 'localisation' | 'state'>('identity');
  const [formData, setFormData] = useState<Partial<Canari>>({
    nom: '',
    bague: '',
    sexe: 'Mâle',
    espece: 'canari',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: new Date().toISOString().split('T')[0],
    cage_id: undefined,

    pere_id: null,
    mere_id: null,
    photo: '',
    photos: [],
    documents: [],
    elevage: '',
    zone: '',
    voliere: '',
    compartiment: '',
    eleveur_origine: '',
    parent_pere_nourricier_id: null,
    parent_mere_nourriciere_id: null,
    statut_sante: 'Actif',
    observations: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formGeneralError, setFormGeneralError] = useState<string | null>(null);

  // Detailed view secondary features tabs
  const [detailActiveTab, setDetailActiveTab] = useState<'profile' | 'timeline' | 'gallery' | 'documents'>('profile');

  // Document attachments state for Form/Selected Bird
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'certificat' | 'analyse' | 'facture' | 'autre'>('certificat');
  const [newDocDate, setNewDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDocDesc, setNewDocDesc] = useState('');

  // Sync Quick Add trigger from parent context
  React.useEffect(() => {
    if (quickAddOpen) {
      setIsAdding(true);
      setSelectedBird(null);
      setIsEditing(false);
      setFormTab('identity');
      setFormData({
        nom: '',
        bague: '',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: 'canari_couleur',
        race: 'Classique',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune Intensif',
        date_naissance: new Date().toISOString().split('T')[0],
        cage_id: undefined,

        pere_id: null,
        mere_id: null,
        photo: '',
        photos: [],
        documents: [],
        elevage: '',
        zone: '',
        voliere: '',
        compartiment: '',
        eleveur_origine: '',
        parent_pere_nourricier_id: null,
        parent_mere_nourriciere_id: null,
        statut_sante: 'Actif',
        observations: '',
        acquisition: false
      });
      setFormErrors({});
      setFormGeneralError(null);
      if (setQuickAddOpen) setQuickAddOpen(false);
    }
  }, [quickAddOpen, setQuickAddOpen, cages]);

  // Local storage migration & service fetch
  const allBirdsList = useMemo(() => {
    // Migration is run inside repository. Fetch from BirdService for single-point entry
    return BirdService.getAll(true);
  }, [propCanaris]); // Syncs when root state updates

  // Dynamic values based on selected Species/Category in the Formulaire V2
  const currentFormSpeciesData = useMemo(() => {
    return getSpeciesById(formData.espece || 'canari');
  }, [formData.espece]);

  const currentFormCategories = useMemo(() => {
    return currentFormSpeciesData?.categories || [];
  }, [currentFormSpeciesData]);

  const currentFormCategoryData = useMemo(() => {
    return currentFormCategories.find(c => c.id === formData.categorie);
  }, [currentFormCategories, formData.categorie]);

  const currentFormBreeds = useMemo(() => {
    return currentFormCategoryData?.breeds || [];
  }, [currentFormCategoryData]);

  // Adjust options automatically when species/category changes
  const handleSpeciesChange = useCallback((speciesId: string) => {
    const spec = getSpeciesById(speciesId);
    const firstCat = spec?.categories[0]?.id || '';
    const specInfo = spec?.categories[0];
    const firstBreed = specInfo?.breeds[0]?.id || '';

    setFormData(prev => ({
      ...prev,
      espece: speciesId,
      categorie: firstCat,
      race: firstBreed
    }));
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    const cat = currentFormCategories.find(c => c.id === catId);
    const firstBreed = cat?.breeds[0]?.id || '';

    setFormData(prev => ({
      ...prev,
      categorie: catId,
      race: firstBreed
    }));
  }, [currentFormCategories]);

  // Sorting & Combined Filtering Engine (useMemo optimized)
  const filteredBirds = useMemo(() => {
    const criteria = {
      nom: searchQuery ? undefined : undefined, // Handled separately for instant search
      bague: undefined,
      espece: filterSpecies || undefined,
      categorie: filterCategory || undefined,
      race: filterBreed || undefined,
      sexe: filterGender ? (filterGender as any) : undefined,
      cage_id: filterCage ? Number(filterCage) : undefined,
      mutation: filterMutation || undefined,
      couleur: filterColor || undefined,
      repro_dispo: filterReproDispo !== null ? filterReproDispo : undefined,
      quarantaine: filterQuarantine !== null ? filterQuarantine : undefined
    };

    // Apply combined filters from BirdService/Repository
    let list = BirdService.filter(criteria, showArchived);

    // Instant search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        (b.nom && b.nom.toLowerCase().includes(q)) ||
        (b.bague && b.bague.toLowerCase().includes(q)) ||
        (b.race && b.race.toLowerCase().includes(q)) ||
        (b.mutation && b.mutation.toLowerCase().includes(q)) ||
        (b.couleur && b.couleur.toLowerCase().includes(q)) ||
        (b.couleur_base && b.couleur_base.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    if (sortField) {
      list.sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        return sortDirection === 'asc' 
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return list;
  }, [allBirdsList, searchQuery, filterSpecies, filterCategory, filterBreed, filterGender, filterCage, filterMutation, filterColor, filterReproDispo, filterQuarantine, showArchived, sortField, sortDirection]);

  // Paginated dataset
  const paginatedBirds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBirds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBirds, currentPage]);

  const totalPages = Math.ceil(filteredBirds.length / itemsPerPage);

  // Form field modification handler
  const handleInputChange = useCallback((field: keyof Canari, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate color summary backwards compatibility automatically
      if (field === 'couleur_base' || field === 'mutation' || field === 'facteur') {
        const parts = [];
        parts.push(updated.couleur_base || '');
        if (updated.mutation && updated.mutation !== "Classique") {
          parts.push(updated.mutation);
        }
        if (updated.facteur && updated.facteur !== "Non applicable" && updated.facteur !== "Intensif") {
          parts.push(updated.facteur);
        }
        updated.couleur = parts.join(" ");
      }

      return updated;
    });

    // Clear field error instantly
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [formErrors]);

  // Run business engine validation suite
  const validateForm = useCallback(() => {
    const result = BirdEngine.validateBird(formData, allBirdsList, formData.id);
    if (!result.isValid) {
      const errorsMap: Record<string, string> = {};
      result.errors.forEach(err => {
        errorsMap[err.field] = err.message;
      });
      setFormErrors(errorsMap);
      setFormGeneralError(localT('errorMsg'));
      return false;
    }
    setFormErrors({});
    setFormGeneralError(null);
    return true;
  }, [formData, allBirdsList, localT]);

  // Submit form data
  const handleSaveForm = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let result;
    if (formData.id) {
      // Edit mode
      result = onEditCanari(formData as Canari);
    } else {
      // Create mode
      result = onAddCanari(formData as Omit<Canari, 'id'>);
    }

    if (result === true) {
      setIsAdding(false);
      setIsEditing(false);
      
      // If we modified selected bird, refresh detailed view reference
      if (formData.id) {
        const updated = BirdService.getById(formData.id);
        if (updated) setSelectedBird(updated);
      }
    } else {
      setFormGeneralError(typeof result === 'string' ? result : "Une erreur inconnue est survenue.");
    }
  }, [formData, validateForm, onAddCanari, onEditCanari]);

  // Multi-selection management
  const handleToggleSelectAll = useCallback(() => {
    const currentIds = paginatedBirds.map(b => b.id);
    const allSelected = currentIds.every(id => selectedBirdIds.has(id));

    setSelectedBirdIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        currentIds.forEach(id => next.delete(id));
      } else {
        currentIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [paginatedBirds, selectedBirdIds]);

  const handleToggleSelectBird = useCallback((id: number) => {
    setSelectedBirdIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Batch actions
  const handleBulkArchive = useCallback(() => {
    selectedBirdIds.forEach(id => {
      BirdService.archive(id);
    });
    // Trigger root refresh by modifying something in state or trigger callback
    onBirdsChanged();
    setSelectedBirdIds(new Set());
  }, [selectedBirdIds, onBirdsChanged]);

  const handleBulkDelete = useCallback(() => {
    if (!window.confirm(localT('confirmDelete'))) return;
    selectedBirdIds.forEach(id => {
      BirdService.delete(id);
    });
    onBirdsChanged();
    setSelectedBirdIds(new Set());
  }, [selectedBirdIds, onBirdsChanged, localT]);

  const handleBulkDuplicate = useCallback(() => {
    selectedBirdIds.forEach(id => {
      BirdService.duplicate(id);
    });
    onBirdsChanged();
    setSelectedBirdIds(new Set());
  }, [selectedBirdIds, onBirdsChanged]);

  // Singular Actions
  const handleDuplicateBird = useCallback((bird: Canari) => {
    const res = BirdService.duplicate(bird.id);
    if (res.success && res.data) {
      onBirdsChanged();
    }
  }, [onBirdsChanged]);

  const handleArchiveBird = useCallback((bird: Canari) => {
    if (!window.confirm(localT('confirmArchive'))) return;
    const res = BirdService.archive(bird.id);
    if (res.success) {
      onBirdsChanged();
      setSelectedBird(null);
    }
  }, [onBirdsChanged, localT]);

  const handleRestoreBird = useCallback((bird: Canari) => {
    const res = BirdService.restore(bird.id);
    if (res.success) {
      onBirdsChanged();
      setSelectedBird(null);
    }
  }, [onBirdsChanged]);

  const handleDeleteBird = useCallback((bird: Canari) => {
    if (!window.confirm(localT('confirmDelete'))) return;
    const res = onDeleteCanari(bird.id);
    if (res === true) {
      setSelectedBird(null);
    } else {
      alert(res);
    }
  }, [onDeleteCanari, localT]);

  // Reset Filters helper
  const handleResetFilters = useCallback(() => {
    setFilterSpecies('');
    setFilterCategory('');
    setFilterBreed('');
    setFilterGender('');
    setFilterCage('');
    setFilterMutation('');
    setFilterColor('');
    setFilterReproDispo(null);
    setFilterQuarantine(null);
    setShowArchived(false);
    setSearchQuery('');
  }, []);

  // Compute genealogy nodes and kinship dynamic check on Form
  const isFormCoupleSelected = formData.pere_id && formData.mere_id;
  const formConsanguinityResult = useMemo(() => {
    if (isFormCoupleSelected) {
      return BirdEngine.checkConsanguinity(formData.pere_id, formData.mere_id, allBirdsList);
    }
    return null;
  }, [formData.pere_id, formData.mere_id, allBirdsList, isFormCoupleSelected]);

  // Fetch chronological timeline entries for selected bird (Part 7)
  const birdTimelineLogs = useMemo(() => {
    if (!selectedBird) return [];
    const allLogs = ActivityLogger.getLogs();
    
    // Filter logs belonging to this bird by checking text or detail payload
    return allLogs.filter(log => {
      const isDirectRef = log.details && (log.details.id === selectedBird.id || log.details.canariId === selectedBird.id || log.details.bague === selectedBird.bague);
      const isMentioned = log.description.includes(selectedBird.bague) || (selectedBird.nom && log.description.includes(selectedBird.nom));
      return isDirectRef || isMentioned;
    });
  }, [selectedBird, propCanaris]);

  // Gallery Management Logic (Part 8)
  const handleAddPhotoToGallery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedBird) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const currentPhotos = selectedBird.photos ? [...selectedBird.photos] : (selectedBird.photo ? [selectedBird.photo] : []);
      
      const updatedPhotos = [...currentPhotos, base64String];
      const updatedBird = {
        ...selectedBird,
        photo: currentPhotos.length === 0 ? base64String : selectedBird.photo,
        photos: updatedPhotos
      };

      // Save via service
      const res = BirdService.update(updatedBird);
      if (res.success && res.data) {
        onEditCanari(res.data);
        setSelectedBird(res.data);
      }
    };
    reader.readAsDataURL(file);
  }, [selectedBird, onEditCanari]);

  const handleMakePhotoPrincipal = useCallback((index: number) => {
    if (!selectedBird || !selectedBird.photos) return;
    const currentPhotos = [...selectedBird.photos];
    if (index <= 0 || index >= currentPhotos.length) return;

    // Swap index to 0
    const [targetPhoto] = currentPhotos.splice(index, 1);
    currentPhotos.unshift(targetPhoto);

    const updatedBird = {
      ...selectedBird,
      photo: targetPhoto,
      photos: currentPhotos
    };

    const res = BirdService.update(updatedBird);
    if (res.success && res.data) {
      onEditCanari(res.data);
      setSelectedBird(res.data);
    }
  }, [selectedBird, onEditCanari]);

  const handleRemovePhoto = useCallback((index: number) => {
    if (!selectedBird || !selectedBird.photos) return;
    const currentPhotos = [...selectedBird.photos];
    if (index < 0 || index >= currentPhotos.length) return;

    currentPhotos.splice(index, 1);

    const updatedBird = {
      ...selectedBird,
      photo: currentPhotos.length > 0 ? currentPhotos[0] : '',
      photos: currentPhotos
    };

    const res = BirdService.update(updatedBird);
    if (res.success && res.data) {
      onEditCanari(res.data);
      setSelectedBird(res.data);
    }
  }, [selectedBird, onEditCanari]);

  // Documents Management Logic (Part 9)
  const handleAddDocument = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBird || !newDocName.trim()) return;

    const newDoc = {
      id: Math.random().toString(36).substring(2, 9),
      nom: newDocName,
      type: newDocType,
      date: newDocDate,
      description: newDocDesc
    };

    const currentDocs = selectedBird.documents ? [...selectedBird.documents] : [];
    const updatedBird = {
      ...selectedBird,
      documents: [...currentDocs, newDoc]
    };

    const res = BirdService.update(updatedBird);
    if (res.success && res.data) {
      onEditCanari(res.data);
      setSelectedBird(res.data);
      
      // Reset doc form
      setNewDocName('');
      setNewDocDesc('');
    }
  }, [selectedBird, newDocName, newDocType, newDocDate, newDocDesc, onEditCanari]);

  const handleRemoveDocument = useCallback((docId: string) => {
    if (!selectedBird || !selectedBird.documents) return;
    
    const updatedDocs = selectedBird.documents.filter(d => d.id !== docId);
    const updatedBird = {
      ...selectedBird,
      documents: updatedDocs
    };

    const res = BirdService.update(updatedBird);
    if (res.success && res.data) {
      onEditCanari(res.data);
      setSelectedBird(res.data);
    }
  }, [selectedBird, onEditCanari]);

  // Computed potential parents lists
  const potentialFathers = useMemo(() => {
    return allBirdsList.filter(b => b.sexe === 'Mâle' && b.id !== formData.id);
  }, [allBirdsList, formData.id]);

  const potentialMothers = useMemo(() => {
    return allBirdsList.filter(b => b.sexe === 'Femelle' && b.id !== formData.id);
  }, [allBirdsList, formData.id]);

  // Handle cage name resolution helper
  const getCageName = useCallback((cageId?: number) => {
    const cg = cages.find(c => c.id === cageId);
    return cg ? cg.nom : `Cage #${cageId}`;
  }, [cages]);

  // Sort utility helper to set header indicators
  const handleSort = useCallback((field: keyof Canari) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // AppTable Columns Configuration (Part 1)
  const columns = useMemo(() => [
    {
      key: 'checkbox',
      header: (
        <input 
          type="checkbox" 
          checked={paginatedBirds.length > 0 && paginatedBirds.every(b => selectedBirdIds.has(b.id))}
          onChange={handleToggleSelectAll}
          className="w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer"
        />
      ),
      render: (row: Canari) => (
        <input 
          type="checkbox" 
          checked={selectedBirdIds.has(row.id)}
          onChange={() => handleToggleSelectBird(row.id)}
          onClick={(e) => e.stopPropagation()} // prevent opening detail
          className="w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer"
        />
      ),
      className: 'w-10'
    },
    {
      key: 'photo',
      header: localT('photoCol'),
      render: (row: Canari) => (
        <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden shadow-2xs bg-slate-50 flex items-center justify-center shrink-0">
          {row.photo || (row.photos && row.photos[0]) ? (
            <img src={row.photo || row.photos?.[0]} alt={row.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
        </div>
      ),
      className: 'w-16'
    },
    {
      key: 'bague',
      header: (
        <button onClick={() => handleSort('bague')} className="flex items-center gap-1 hover:text-slate-800 transition-colors font-bold cursor-pointer">
          {localT('ringCol')} {sortField === 'bague' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
        </button>
      ),
      render: (row: Canari) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold border border-slate-200 shadow-2xs">
          <Award className="w-3 h-3 text-slate-500" />
          {row.bague}
        </span>
      )
    },
    {
      key: 'nom',
      header: (
        <button onClick={() => handleSort('nom')} className="flex items-center gap-1 hover:text-slate-800 transition-colors font-bold cursor-pointer">
          {localT('nameCol')} {sortField === 'nom' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
        </button>
      ),
      render: (row: Canari) => (
        <div className="font-bold text-slate-800 tracking-tight">
          {row.nom}
        </div>
      )
    },
    {
      key: 'espece',
      header: localT('speciesCol'),
      render: (row: Canari) => {
        return <SpeciesBadge speciesId={row.espece || 'canari'} size="sm" />;
      }
    },
    {
      key: 'race',
      header: localT('breedCol'),
      render: (row: Canari) => <span className="text-xs text-slate-600 font-semibold">{row.race}</span>
    },
    {
      key: 'sexe',
      header: localT('genderCol'),
      render: (row: Canari) => {
        const isMale = row.sexe === 'Mâle';
        const isFemale = row.sexe === 'Femelle';
        return (
          <AppBadge 
            variant={isMale ? 'primary' : isFemale ? 'danger' : 'outline'}
            className="text-2xs uppercase tracking-wider font-bold"
          >
            {isMale ? '♂ ' + localT('male') : isFemale ? '♀ ' + localT('female') : '❓ ' + localT('undetermined')}
          </AppBadge>
        );
      }
    },
    {
      key: 'age',
      header: localT('ageCol'),
      render: (row: Canari) => {
        const { stringVal } = BirdEngine.calculateAge(row.date_naissance);
        return <span className="text-xs text-slate-600 font-semibold">{stringVal}</span>;
      }
    },
    {
      key: 'location',
      header: localT('locationCol'),
      render: (row: Canari) => (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-semibold">
          <Grid className="w-3.5 h-3.5 text-emerald-500" />
          {getCageName(row.cage_id)}
        </span>
      )
    },
    {
      key: 'statut',
      header: localT('statusCol'),
      render: (row: Canari) => {
        const isQuarantine = row.nom?.toLowerCase().includes('quarantaine') || row.facteur?.toLowerCase().includes('quarantaine') || row.statut_sante === 'Quarantaine';
        return (
          <AppBadge 
            variant={isQuarantine ? 'warning' : row.archived ? 'outline' : 'success'}
            className="text-2xs"
          >
            {isQuarantine ? localT('statusQuarantine') : row.archived ? 'Archivé' : localT('statusActive')}
          </AppBadge>
        );
      }
    }
  ], [paginatedBirds, selectedBirdIds, sortField, sortDirection, handleToggleSelectAll, handleToggleSelectBird, localT, handleSort, getCageName]);

  // Active form view structure
  if (isAdding || isEditing) {
    return (
      <div className="space-y-6 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {formData.id ? localT('editFormTitle', { name: formData.nom }) : localT('addFormTitle')}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {localT('subtitle')}
            </p>
          </div>
          <AppButton variant="outline" startIcon={<X className="w-4 h-4" />} onClick={() => { setIsAdding(false); setIsEditing(false); }}>
            {localT('btnCancel')}
          </AppButton>
        </div>

        {formGeneralError && (
          <AppAlert type="danger" onClose={() => setFormGeneralError(null)}>
            {formGeneralError}
          </AppAlert>
        )}

        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* Sub tabs for Form categories */}
          <div className="grid grid-cols-2 sm:flex border-b border-slate-100 overflow-x-visible sm:overflow-x-auto shrink-0 pb-1 gap-2">
            {(['identity', 'origin', 'localisation', 'state'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFormTab(tab)}
                className={`
                  w-full sm:w-auto px-2 sm:px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer whitespace-normal sm:whitespace-nowrap
                  ${formTab === tab ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-600'}
                `}
              >
                {tab === 'identity' ? localT('tabIdentity') : tab === 'origin' ? localT('tabOrigin') : tab === 'localisation' ? localT('tabLocalisation') : localT('tabState')}
              </button>
            ))}
          </div>

          <AppCard padding="xl">
            {formTab === 'identity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppInput 
                  label={localT('labelName')}
                  value={formData.nom || ''}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  error={formErrors.nom}
                  placeholder="ex. Rubis"
                />

                <AppInput 
                  label={localT('labelRing')}
                  value={formData.bague || ''}
                  onChange={(e) => handleInputChange('bague', e.target.value)}
                  error={formErrors.bague}
                  placeholder="ex. BE-2026-908"
                />

                <AppSelect 
                  label={localT('labelSpecies')}
                  value={formData.espece || 'canari'}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  error={formErrors.espece}
                  options={SPECIES_REGISTRY.map(s => ({ value: s.id, label: s.defaultLabel }))}
                />

                <AppSelect 
                  label={localT('labelCategory')}
                  value={formData.categorie || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  error={formErrors.categorie}
                  options={currentFormCategories.map(c => ({ value: c.id, label: c.defaultLabel }))}
                />

                <AppSelect 
                  label={localT('labelBreed')}
                  value={formData.race || ''}
                  onChange={(e) => handleInputChange('race', e.target.value)}
                  error={formErrors.race}
                  options={currentFormBreeds.map(b => ({ value: b.id, label: b.defaultLabel }))}
                />

                <AppInput 
                  label={localT('labelMutation')}
                  value={formData.mutation || ''}
                  onChange={(e) => handleInputChange('mutation', e.target.value)}
                  placeholder="ex. Satiné, Opale (Optionnel)"
                />

                <AppInput 
                  label={localT('labelColor')}
                  value={formData.couleur_base || ''}
                  onChange={(e) => handleInputChange('couleur_base', e.target.value)}
                  error={formErrors.couleur_base}
                  placeholder="ex. Jaune Mosaïque"
                />

                <AppSelect 
                  label={localT('labelGender')}
                  value={formData.sexe || 'Mâle'}
                  onChange={(e) => handleInputChange('sexe', e.target.value)}
                  options={[
                    { value: 'Mâle', label: '♂ ' + localT('male') },
                    { value: 'Femelle', label: '♀ ' + localT('female') },
                    { value: 'Indéterminé', label: '❓ ' + localT('undetermined') }
                  ]}
                />

                <div className="flex flex-col gap-1 w-full">
                  <AppInput 
                    label={localT('labelBirthDate')}
                    type="date"
                    value={formData.date_naissance || ''}
                    onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                    error={formErrors.date_naissance}
                  />
                  <span className="text-3xs text-slate-400 mt-1 font-semibold">
                    {localT('labelAgeCalculated')} : {BirdEngine.calculateAge(formData.date_naissance || '').stringVal}
                  </span>
                </div>
              </div>
            )}

            {formTab === 'origin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="acquisition"
                      checked={!!formData.acquisition}
                      onChange={(e) => handleInputChange('acquisition', e.target.checked)}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="acquisition" className="text-xs font-bold text-slate-700 cursor-pointer">
                      {localT('labelIsAcquisition')}
                    </label>
                  </div>

                  {formData.acquisition && (
                    <div className="space-y-4">
                      <AppInput 
                        label={localT('labelOriginalBreeder')}
                        value={formData.eleveur_origine || ''}
                        onChange={(e) => handleInputChange('eleveur_origine', e.target.value)}
                        placeholder="Nom de l'éleveur d'origine"
                      />
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-4">
                        <h5 className="text-xs font-bold text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {localT('quarantineProtocol')}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AppSelect
                            label={localT('quarantineCage')}
                            value={formData.cage_id || ''}
                            onChange={(e) => {
                              handleInputChange('cage_id', e.target.value ? Number(e.target.value) : undefined);
                              handleInputChange('statut_sante', 'Quarantaine');
                            }}
                            options={[
                              { value: '', label: localT('quarantineAssignLater') },
                              ...cages.filter(c => c.nom.toLowerCase().includes('quarant')).map(c => ({ value: c.id, label: c.nom }))
                            ]}
                          />
                          <AppInput 
                            label={localT('quarantineEntryDate')}
                            type="date"
                            value={formData.quarantaine?.date_entree || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleInputChange('quarantaine', { ...formData.quarantaine, date_entree: e.target.value, duree_recommandee: formData.quarantaine?.duree_recommandee || 30 })}
                          />
                          <AppSelect
                            label={localT('quarantineDuration')}
                            value={formData.quarantaine?.duree_recommandee || 30}
                            onChange={(e) => handleInputChange('quarantaine', { ...formData.quarantaine, duree_recommandee: Number(e.target.value), date_entree: formData.quarantaine?.date_entree || new Date().toISOString().split('T')[0] })}
                            options={[
                              { value: 7, label: localT('quarantineDays', { count: 7 }) },
                              { value: 14, label: localT('quarantineDays', { count: 14 }) },
                              { value: 21, label: localT('quarantineDays', { count: 21 }) },
                              { value: 30, label: localT('quarantineDays', { count: 30 }) }
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs uppercase font-black tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4" /> {localT('sectionBiologicalAncestry')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppSelect 
                      label={localT('labelBiologicalFather')}
                      value={formData.pere_id || ''}
                      onChange={(e) => handleInputChange('pere_id', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Inconnu / Non spécifié --</option>
                      {potentialFathers.map(b => (
                        <option key={b.id} value={b.id}>{b.nom} ({b.bague})</option>
                      ))}
                    </AppSelect>

                    <AppSelect 
                      label={localT('labelBiologicalMother')}
                      value={formData.mere_id || ''}
                      onChange={(e) => handleInputChange('mere_id', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Inconnue / Non spécifiée --</option>
                      {potentialMothers.map(b => (
                        <option key={b.id} value={b.id}>{b.nom} ({b.bague})</option>
                      ))}
                    </AppSelect>
                  </div>

                  {/* Consanguinity warning prepared but NOT blocking (Part 4) */}
                  {formConsanguinityResult && (
                    <div className="mt-4">
                      {formConsanguinityResult.isConsanguineous ? (
                        <AppAlert type="warning" title="Consanguinité Détectée (Calculateur COI)">
                          {localT('consanguinityWarn', {
                            coi: formConsanguinityResult.coi.toFixed(2),
                            level: formConsanguinityResult.level,
                            rec: formConsanguinityResult.recommendation
                          })}
                        </AppAlert>
                      ) : (
                        <AppAlert type="success" title="Accouplement Sécurisé">
                          {localT('consanguinitySuccess', {
                            coi: formConsanguinityResult.coi.toFixed(2),
                            rec: formConsanguinityResult.recommendation
                          })}
                        </AppAlert>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs uppercase font-black tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {localT('sectionFosterLineage')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppSelect 
                      label={localT('labelFosterFather')}
                      value={formData.parent_pere_nourricier_id || ''}
                      onChange={(e) => handleInputChange('parent_pere_nourricier_id', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Aucun --</option>
                      {potentialFathers.map(b => (
                        <option key={b.id} value={b.id}>{b.nom} ({b.bague})</option>
                      ))}
                    </AppSelect>

                    <AppSelect 
                      label={localT('labelFosterMother')}
                      value={formData.parent_mere_nourriciere_id || ''}
                      onChange={(e) => handleInputChange('parent_mere_nourriciere_id', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">-- Aucune --</option>
                      {potentialMothers.map(b => (
                        <option key={b.id} value={b.id}>{b.nom} ({b.bague})</option>
                      ))}
                    </AppSelect>
                  </div>
                </div>
              </div>
            )}

            {formTab === 'localisation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppInput 
                  label={localT('labelElevageName')}
                  value={formData.elevage || ''}
                  onChange={(e) => handleInputChange('elevage', e.target.value)}
                  placeholder="ex. Volière Principale Ouest"
                />

                <AppInput 
                  label={localT('labelZone')}
                  value={formData.zone || ''}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  placeholder="ex. Zone A (Reproduction)"
                />

                <AppInput 
                  label={localT('labelVoliere')}
                  value={formData.voliere || ''}
                  onChange={(e) => handleInputChange('voliere', e.target.value)}
                  placeholder="ex. Volière extérieure #2"
                />

                <AppSelect 
                  label={localT('labelCage')}
                  value={formData.cage_id || ''}
                  onChange={(e) => handleInputChange('cage_id', e.target.value ? Number(e.target.value) : undefined)}
                  error={formErrors.cage_id}
                  options={[
                    { value: '', label: 'Aucune affectation' },
                    ...cages.map(c => ({ value: c.id, label: `${c.nom} (max ${c.capacite_max})` }))
                  ]}
                />

                <AppInput 
                  label={localT('labelCompartiment')}
                  value={formData.compartiment || ''}
                  onChange={(e) => handleInputChange('compartiment', e.target.value)}
                  placeholder="ex. Box Supérieur Droit"
                />
              </div>
            )}

            {formTab === 'state' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AppSelect 
                    label={localT('labelStatus')}
                    value={formData.statut_sante || 'Actif'}
                    onChange={(e) => handleInputChange('statut_sante', e.target.value)}
                    options={[
                      { value: 'Actif', label: localT('statusActive') },
                      { value: 'Quarantaine', label: localT('statusQuarantine') },
                      { value: 'Malade', label: localT('statusSick') },
                      { value: 'Reproduction', label: localT('statusReproduction') },
                      { value: 'Vendu', label: localT('statusSold') },
                      { value: 'Décédé', label: localT('statusDeceased') },
                      { value: 'Repos', label: localT('statusRest') }
                    ]}
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-xs font-bold text-slate-500 mb-2">{localT('labelObservations')}</label>
                  <textarea
                    value={formData.observations || ''}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    className="w-full h-32 text-sm border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 outline-none transition-colors"
                    placeholder="Saisissez des notes sur le phénotype, le comportement..."
                  />
                </div>
              </div>
            )}
          </AppCard>

          <div className="flex justify-end gap-3 pt-4">
            <AppButton variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); }}>
              {localT('btnCancel')}
            </AppButton>
            <AppButton type="submit" variant="primary">
              {localT('btnSaveBird')}
            </AppButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-emerald-600" />
            {localT('title')}
          </h1>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-2xl">
            {localT('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <AppButton 
            variant="outline"
            onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
            startIcon={viewMode === 'desktop' ? <Grid className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
          >
            {viewMode === 'desktop' ? localT('mobileView') : localT('desktopView')}
          </AppButton>
          <AppButton 
            variant="primary" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              setIsAdding(true);
              setIsEditing(false);
              setSelectedBird(null);
              setFormTab('identity');
              setFormData({
                nom: '',
                bague: '',
                sexe: 'Mâle',
                espece: 'canari',
                categorie: 'canari_couleur',
                race: 'Classique',
                mutation: 'Classique',
                couleur_base: 'Jaune',
                facteur: 'Intensif',
                couleur: 'Jaune Intensif',
                date_naissance: new Date().toISOString().split('T')[0],
                cage_id: undefined,

                pere_id: null,
                mere_id: null,
                photo: '',
                photos: [],
                documents: [],
                elevage: '',
                zone: '',
                voliere: '',
                compartiment: '',
                eleveur_origine: '',
                parent_pere_nourricier_id: null,
                parent_mere_nourriciere_id: null,
                statut_sante: 'Actif',
                observations: '',
                acquisition: false
              });
              setFormErrors({});
              setFormGeneralError(null);
            }}
          >
            {localT('addBirdBtn')}
          </AppButton>
        </div>
      </div>

      {/* Advanced Filters Panel (Part 2) */}
      <AppCard padding="none" className="overflow-visible">
        <button 
          onClick={() => setIsFiltersExpanded(prev => !prev)}
          className="w-full px-5 py-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-wider text-slate-600 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4.5 h-4.5 text-slate-500" />
            {localT('advancedFilters')}
          </span>
          {isFiltersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isFiltersExpanded && (
          <div className="p-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <AppInput 
              label={localT('labelName')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Surnom libre..."
              startIcon={<Search className="w-4 h-4" />}
            />

            <AppSelect 
              label={localT('labelSpecies')}
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
            >
              <option value="">{localT('allSpecies')}</option>
              {SPECIES_REGISTRY.map(s => (
                <option key={s.id} value={s.id}>{s.defaultLabel}</option>
              ))}
            </AppSelect>

            <AppSelect 
              label={localT('labelCategory')}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">{localT('allCategories')}</option>
              <option value="canari_couleur">Canari Couleur</option>
              <option value="canari_posture">Canari Posture</option>
              <option value="canari_chant">Canari Chant</option>
            </AppSelect>

            <AppSelect 
              label={localT('labelGender')}
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="">{localT('allGenders')}</option>
              <option value="Mâle">♂ Mâle</option>
              <option value="Femelle">♀ Femelle</option>
              <option value="Indéterminé">❓ Indéterminé</option>
            </AppSelect>

            <AppSelect 
              label={localT('labelCage')}
              value={filterCage}
              onChange={(e) => setFilterCage(e.target.value)}
            >
              <option value="">{localT('allCages')}</option>
              {cages.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </AppSelect>

            <AppSelect 
              label={localT('reproDispoLabel')}
              value={filterReproDispo === null ? '' : String(filterReproDispo)}
              onChange={(e) => setFilterReproDispo(e.target.value === '' ? null : e.target.value === 'true')}
            >
              <option value="">Tous</option>
              <option value="true">Disponible (Age &gt;= 10m)</option>
              <option value="false">Indisponible / Trop jeune</option>
            </AppSelect>

            <div className="flex flex-col justify-end gap-3 py-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showArchived"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="showArchived" className="text-xs font-bold text-slate-700 cursor-pointer">
                  {localT('showActiveAndArchived')}
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <AppButton variant="outline" className="w-full" startIcon={<RefreshCw className="w-4 h-4" />} onClick={handleResetFilters}>
                {localT('resetFilters')}
              </AppButton>
            </div>
          </div>
        )}
      </AppCard>

      {/* Bulk actions panel */}
      {selectedBirdIds.size > 0 && (
        <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            {localT('selectedCount', { count: selectedBirdIds.size })}
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton size="sm" variant="success" startIcon={<Archive className="w-3.5 h-3.5" />} onClick={handleBulkArchive}>
              {localT('bulkArchive')}
            </AppButton>
            <AppButton size="sm" variant="secondary" startIcon={<Copy className="w-3.5 h-3.5" />} onClick={handleBulkDuplicate}>
              {localT('bulkDuplicate')}
            </AppButton>
            <AppButton size="sm" variant="danger" startIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleBulkDelete}>
              {localT('bulkDelete')}
            </AppButton>
          </div>
        </div>
      )}

      {/* Main split view / list area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bird list column (left) */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'desktop' ? (
            <AppTable 
              columns={columns}
              data={paginatedBirds}
              keyExtractor={(row: any) => row.id}
              hoverable={true}
              onRowClick={(row: Canari) => setSelectedBird(row)}
              selectedRowId={selectedBird?.id}
              onClearSelection={() => setSelectedBird(null)}
              className="border border-slate-100"
              isLoading={false}
              pagination={totalPages > 1 ? (
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Page {currentPage} / {totalPages}</span>
                  <div className="flex gap-1.5">
                    <AppButton size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                      Précédent
                    </AppButton>
                    <AppButton size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                      Suivant
                    </AppButton>
                  </div>
                </div>
              ) : null}
            />
          ) : (
            // Mobile responsive cards view (Part 1 & 10)
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginatedBirds.length === 0 ? (
                <div className="col-span-full">
                  <AppEmptyState title={localT('noBirdsFound')} description="Essayez de modifier votre recherche ou ajoutez un oiseau." />
                </div>
              ) : (
                paginatedBirds.map(bird => {
                  const isMale = bird.sexe === 'Mâle';
                  const isFemale = bird.sexe === 'Femelle';
                  return (
                    <AppCard 
                      key={bird.id}
                      hoverable={true}
                      onClick={() => setSelectedBird(bird)}
                      borderColor={selectedBird?.id === bird.id ? 'border-emerald-500' : 'border-slate-100'}
                      padding="md"
                      title={
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-slate-800">{bird.nom}</span>
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">{bird.bague}</span>
                        </div>
                      }
                      subtitle={
                        <div className="flex items-center gap-2">
                          <SpeciesBadge speciesId={bird.espece || 'canari'} size="sm" showLabel={false} />
                          <span>{bird.race}</span>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {bird.photo || (bird.photos && bird.photos[0]) ? (
                            <img src={bird.photo || bird.photos?.[0]} alt={bird.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex gap-2">
                            <AppBadge variant={isMale ? 'primary' : isFemale ? 'danger' : 'outline'} className="text-3xs uppercase font-bold">
                              {bird.sexe}
                            </AppBadge>
                            <AppBadge variant="outline" className="text-3xs">
                              {BirdEngine.calculateAge(bird.date_naissance).stringVal}
                            </AppBadge>
                          </div>
                          <div className="text-slate-400">
                            Cage : <span className="font-bold text-emerald-800">{getCageName(bird.cage_id)}</span>
                          </div>
                        </div>
                      </div>
                    </AppCard>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Detailed bird card (right side) */}
        <div className="lg:col-span-1">
          {selectedBird ? (
            <AppCard padding="none" className="sticky top-6">
              {/* Cover header area */}
              <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                {selectedBird.photo || (selectedBird.photos && selectedBird.photos[0]) ? (
                  <img src={selectedBird.photo || selectedBird.photos?.[0]} alt={selectedBird.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
                <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                  <button 
                    onClick={() => {
                      setFormData({ ...selectedBird });
                      setFormTab('identity');
                      setIsEditing(true);
                    }}
                    className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicateBird(selectedBird)}
                    className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {selectedBird.archived ? (
                    <button 
                      onClick={() => handleRestoreBird(selectedBird)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleArchiveBird(selectedBird)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteBird(selectedBird)}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                  <h3 className="font-black text-base">{selectedBird.nom}</h3>
                  <p className="text-2xs opacity-90 tracking-wider font-mono font-bold mt-0.5">{selectedBird.bague}</p>
                </div>
              </div>

              {/* Sub-tabs for detailed sheet */}
              <div className="flex border-b border-slate-100 text-slate-500 font-sans font-bold text-2xs uppercase tracking-wider shrink-0 overflow-x-auto gap-1 p-2 bg-slate-50/50">
                {(['profile', 'timeline', 'gallery', 'documents'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDetailActiveTab(tab)}
                    className={`
                      px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer
                      ${detailActiveTab === tab ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'}
                    `}
                  >
                    {tab === 'profile' ? 'Profil' : tab === 'timeline' ? localT('tabTimeline') : tab === 'gallery' ? 'Galerie' : localT('tabDocuments')}
                  </button>
                ))}
              </div>

              {/* Detail body */}
              <div className="p-5 max-h-[500px] overflow-y-auto">
                {detailActiveTab === 'profile' && (
                  <div className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Sexe</span>
                        <span className="font-bold text-slate-800">{selectedBird.sexe}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Âge</span>
                        <span className="font-bold text-slate-800">{BirdEngine.calculateAge(selectedBird.date_naissance).stringVal}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Espèce</span>
                        <SpeciesBadge speciesId={selectedBird.espece || 'canari'} size="sm" />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Race / Variété</span>
                        <span className="font-bold text-slate-800">{selectedBird.race}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Mutation</span>
                        <span className="font-bold text-slate-800">{selectedBird.mutation || 'Classique'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Couleur</span>
                        <span className="font-bold text-slate-800">{selectedBird.couleur_base}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <span className="text-slate-400 block mb-1 uppercase tracking-wide text-2xs">Localisation exacte</span>
                      <div className="space-y-1 font-semibold text-slate-700">
                        {selectedBird.elevage && <div className="text-2xs">Élevage : {selectedBird.elevage}</div>}
                        {selectedBird.zone && <div className="text-2xs">Zone : {selectedBird.zone}</div>}
                        {selectedBird.voliere && <div className="text-2xs">Volière : {selectedBird.voliere}</div>}
                        <div className="text-2xs">Cage : {getCageName(selectedBird.cage_id)}</div>
                        {selectedBird.compartiment && <div className="text-2xs">Compartiment : {selectedBird.compartiment}</div>}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Père Biologique</span>
                        <span className="font-bold text-slate-800">
                          {selectedBird.pere_id ? (
                            <span className="text-emerald-800 cursor-pointer hover:underline" onClick={() => {
                              const pNode = allBirdsList.find(b => b.id === selectedBird.pere_id);
                              if (pNode) setSelectedBird(pNode);
                            }}>
                              {allBirdsList.find(b => b.id === selectedBird.pere_id)?.nom || `#${selectedBird.pere_id}`}
                            </span>
                          ) : 'Inconnu'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-wide text-2xs">Mère Biologique</span>
                        <span className="font-bold text-slate-800">
                          {selectedBird.mere_id ? (
                            <span className="text-emerald-800 cursor-pointer hover:underline" onClick={() => {
                              const mNode = allBirdsList.find(b => b.id === selectedBird.mere_id);
                              if (mNode) setSelectedBird(mNode);
                            }}>
                              {allBirdsList.find(b => b.id === selectedBird.mere_id)?.nom || `#${selectedBird.mere_id}`}
                            </span>
                          ) : 'Inconnu'}
                        </span>
                      </div>
                    </div>

                    {selectedBird.observations && (
                      <div className="border-t border-slate-100 pt-4">
                        <span className="text-slate-400 block mb-1 uppercase tracking-wide text-2xs">Observations</span>
                        <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedBird.observations}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Part 7 Activity Chronology Timeline */}
                {detailActiveTab === 'timeline' && (
                  <div className="space-y-4">
                    {birdTimelineLogs.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                        Aucun événement d'historique enregistré.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-5">
                        {birdTimelineLogs.map(log => {
                          const dateObj = new Date(log.timestamp);
                          return (
                            <div key={log.id} className="relative pl-6">
                              {/* Bullets */}
                              <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white shadow-2xs" />
                              <div className="text-slate-400 text-3xs font-bold uppercase tracking-wider">
                                {dateObj.toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <p className="text-slate-700 text-xs font-bold tracking-tight mt-0.5">{log.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Part 8 High-Res Photo Gallery */}
                {detailActiveTab === 'gallery' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase font-black text-slate-400">Photos ({selectedBird.photos?.length || 0})</h4>
                      <label className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        {localT('galleryUploadBtn')}
                        <input type="file" accept="image/*" onChange={handleAddPhotoToGallery} className="hidden" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {(selectedBird.photos || (selectedBird.photo ? [selectedBird.photo] : [])).map((pic, pIdx) => (
                        <div key={pIdx} className="group relative rounded-xl overflow-hidden border border-slate-100 aspect-square bg-slate-50">
                          <img src={pic} alt="" className="w-full h-full object-cover" />
                          
                          {/* Banner indicating cloud preparation (Part 8) */}
                          <div className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded-md font-sans">
                            {pIdx === 0 ? '★ Principal' : '☁️ Local / Prêt Cloud'}
                          </div>

                          <div className="absolute inset-0 bg-slate-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-1.5 p-2 text-center">
                            {pIdx > 0 && (
                              <AppButton size="sm" variant="success" className="text-4xs font-bold uppercase" onClick={() => handleMakePhotoPrincipal(pIdx)}>
                                Principale
                              </AppButton>
                            )}
                            <AppButton size="sm" variant="danger" className="text-4xs font-bold uppercase" onClick={() => handleRemovePhoto(pIdx)}>
                              Supprimer
                            </AppButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Part 9 Local Breeding Documents Attachment */}
                {detailActiveTab === 'documents' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddDocument} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-3.5">
                      <h5 className="text-2xs font-black uppercase text-slate-500">Ajouter un document</h5>
                      <div className="grid grid-cols-1 gap-3">
                        <AppInput 
                          label={localT('docName')}
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="ex. Certificat de Sexage ADN"
                        />

                        <AppSelect 
                          label="Type de document"
                          value={newDocType}
                          onChange={(e: any) => setNewDocType(e.target.value)}
                          options={[
                            { value: 'certificat', label: localT('docTypeCert') },
                            { value: 'analyse', label: localT('docTypeAnalyse') },
                            { value: 'facture', label: localT('docTypeFacture') },
                            { value: 'autre', label: localT('docTypeAutre') }
                          ]}
                        />

                        <AppInput 
                          label={localT('docDate')}
                          type="date"
                          value={newDocDate}
                          onChange={(e) => setNewDocDate(e.target.value)}
                        />

                        <AppInput 
                          label={localT('docDesc')}
                          value={newDocDesc}
                          onChange={(e) => setNewDocDesc(e.target.value)}
                          placeholder="Détails complémentaires (Facultatif)"
                        />
                      </div>
                      <AppButton type="submit" variant="primary" size="sm" fullWidth startIcon={<Plus className="w-3.5 h-3.5" />}>
                        {localT('btnAddDoc')}
                      </AppButton>
                    </form>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs uppercase font-black text-slate-400">Documents enregistrés ({selectedBird.documents?.length || 0})</h4>
                      {(!selectedBird.documents || selectedBird.documents.length === 0) ? (
                        <p className="text-center text-xs text-slate-400 py-4 font-semibold">{localT('docEmptyList')}</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedBird.documents.map(doc => (
                            <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-100 flex justify-between items-start gap-3 shadow-2xs font-sans">
                              <div className="flex gap-2.5 items-start">
                                <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                  <h6 className="font-bold text-slate-700 text-xs leading-tight">{doc.nom}</h6>
                                  <div className="flex gap-2 text-3xs text-slate-400 font-semibold mt-1">
                                    <span className="uppercase tracking-wide">{doc.type}</span>
                                    <span>•</span>
                                    <span>{doc.date}</span>
                                  </div>
                                  {doc.description && <p className="text-3xs text-slate-500 mt-1">{doc.description}</p>}
                                </div>
                              </div>
                              <button onClick={() => handleRemoveDocument(doc.id)} className="text-slate-300 hover:text-red-600 transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AppCard>
          ) : (
            <AppCard padding="lg" className="h-56 flex flex-col justify-center items-center text-center text-slate-400 border border-dashed">
              <User className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-xs font-bold leading-relaxed max-w-[200px]">Sélectionnez un oiseau pour afficher sa fiche complète ou commencez à en ajouter un.</p>
            </AppCard>
          )}
        </div>
      </div>
    </div>
  );
}
