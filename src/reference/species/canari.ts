/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const CANARI_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'canari',
    code: 'SER-CAN',
    scientificName: 'Serinus canaria domestica',
    names: {
      fr: 'Canari domestique',
      en: 'Domestic Canary',
      ar: 'الكناري المنزلي',
      es: 'Canario doméstico',
      it: 'Canarino domestico'
    },
    family: 'Fringillidae',
    genus: 'Serinus',
    origin: {
      fr: 'Îles Canaries, Açores et Madère',
      en: 'Canary Islands, Azores and Madeira',
      ar: 'جزر الكناري، الأزور وماديرا',
      es: 'Islas Canarias, Azores y Madeira',
      it: 'Isole Canarie, Azzorre e Madeira'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 10, // 8-12 years on average
    averageLength: 13, // 12-15 cm
    minWeight: 15,
    maxWeight: 30,
    sexualDimorphism: {
      fr: 'Faible dimorphisme visuel. Le mâle chante intensément tandis que la femelle ne produit généralement que de petits cris.',
      en: 'Low visual dimorphism. The male sings intensely while the female generally only produces small chirps.',
      ar: 'الفروق البصرية ضئيلة. يغرد الذكر بقوة بينما تصدر الأنثى عادةً نداءات قصيرة وخفيفة.',
      es: 'Bajo dimorfismo visual. El macho canta intensamente mientras que la hembra generalmente solo emite pequeños píos.',
      it: 'Scarso dimorfismo visivo. Il maschio canta intensamente mentre la femmina emette generalmente solo brevi cinguettii.'
    },
    sexualMaturity: {
      fr: 'Environ 9 à 10 mois, généralement au printemps suivant leur naissance.',
      en: 'Around 9 to 10 months, generally in the spring following their birth.',
      ar: 'حوالي 9 إلى 10 أشهر، عادةً في الربيع التالي لولادتهم.',
      es: 'Alrededor de 9 a 10 meses, generalmente en la primavera siguiente a su nacimiento.',
      it: 'Circa 9-10 mesi, generalmente nella primavera successiva alla nascita.'
    },
    minAgeReproduction: 10,
    recommendedAgeReproduction: 12,
    maxAgeReproduction: 60 // 5 years
  },
  reproduction: {
    breedingSeason: {
      fr: 'De mars à juillet (hémisphère nord), déclenchée par l\'augmentation de la durée du jour (14 heures de lumière requises).',
      en: 'From March to July (northern hemisphere), triggered by increasing day length (14 hours of light required).',
      ar: 'من مارس إلى يوليو (نصف الكرة الشمالي)، يحفزها زيادة طول النهار (يتطلب 14 ساعة من الضوء).',
      es: 'De marzo a julio (hemisferio norte), provocada por el aumento de las horas de luz (se requieren 14 horas).',
      it: 'Da marzo a luglio (emisfero nord), stimolata dall\'aumento della durata del giorno (necessarie 14 ore di luce).'
    },
    incubationPeriod: 13, // 13-14 days
    avgEggsPerClutch: 4,
    maxEggsPerClutch: 6,
    avgClutchesPerYear: 3,
    feedingPeriod: 21, // 18-24 days in nest
    bandingAge: 6, // 5-7 days
    weaningAge: 30 // ~30 days
  },
  breeding: {
    bandSize: '2.9', // 2.9 mm standard
    minIdealTemp: 10, // °C
    maxIdealTemp: 25, // °C
    minHumidity: 50,
    maxHumidity: 70,
    minCageSize: {
      fr: '60cm x 40cm x 40cm pour un couple pendant la reproduction.',
      en: '60cm x 40cm x 40cm for a breeding pair.',
      ar: '60سم × 40سم × 40سم لزوج خلال فترة التكاثر.',
      es: '60cm x 40cm x 40cm para una pareja reproductora.',
      it: '60cm x 40cm x 40cm per una coppia in riproduzione.'
    },
    nestType: {
      fr: 'Nid ouvert en forme de coupe, généralement suspendu, garni de fibres de coco, de coton ou de charpie.',
      en: 'Open cup-shaped nest, usually suspended, lined with coconut fiber, cotton, or burlap.',
      ar: 'عش مفتوح على شكل فنجان، يعلق عادةً، مبطن بألياف جوز الهند أو القطن.',
      es: 'Nido de copa abierta, generalmente suspendido, forrado con fibra de coco, algodón o hilas.',
      it: 'Nido aperto a coppa, solitamente sospeso, imbottito con fibra di cocco, cotone o iuta.'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange de graines équilibré (Alpiste 60-70%, Navette, Millet, Lin, Niger).',
      en: 'Balanced seed mix (Canary seed 60-70%, Rape, Millet, Flax, Niger).',
      ar: 'خلطة حبوب متوازنة (بذور الكناري 60-70٪، اللفت، الدخن، الكتان، النيجر).',
      es: 'Mezcla de semillas equilibrada (Alpiste 60-70%, Nabina, Mijo, Lino, Negrillo).',
      it: 'Miscela di semi bilanciata (Scagliola 60-70%, Ravizzone, Miglio, Lino, Niger).'
    },
    recommendedSupplements: {
      fr: 'Pâtée aux œufs, os de seiche (calcium), légumes frais (brocoli, épinard) et fruits (pomme) modérément.',
      en: 'Egg food, cuttlebone (calcium), fresh vegetables (broccoli, spinach) and fruits (apple) moderately.',
      ar: 'غذاء البيض (البيتيه)، عظم الحبار (الكالسيوم)، الخضروات الطازجة (البروكلي، السبانخ) والفواكه (التفاح) باعتدال.',
      es: 'Pasta de cría, hueso de jibia (calcio), verduras frescas (brócoli, espinacas) y frutas (manzana) con moderación.',
      it: 'Pastoncino all\'uovo, osso di seppia (calcio), verdure fresche (broccoli, spinaci) e frutta (mela) con moderazione.'
    },
    vitaminFrequency: {
      fr: '1 à 2 fois par semaine pendant la mue et la reproduction, mensuellement en période de repos.',
      en: '1 to 2 times a week during molting and breeding, monthly during resting period.',
      ar: 'من 1 إلى 2 مرات في الأسبوع أثناء غيار الريش والتكاثر، وشهرياً خلال فترة الراحة.',
      es: '1 a 2 veces por semana durante la muda y la reproducción, mensualmente en período de descanso.',
      it: '1-2 volte a settimana durante la muta e la riproduzione, mensilmente nel periodo di riposo.'
    },
    specificNeeds: {
      fr: 'Besoin important en vitamine A et en acides aminés soufrés durant la période de repousse des plumes.',
      en: 'High requirement for vitamin A and sulfur-containing amino acids during the feather regrowth period.',
      ar: 'حاجة كبيرة لفيتامين أ والأحماض الأمينية الكبريتية خلال فترة نمو الريش.',
      es: 'Alta necesidad de vitamina A y aminoácidos azufrados durante el período de muda.',
      it: 'Forte fabbisogno di vitamina A e amminoacidi solforati durante il periodo della muta.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Variole du canari', 'Proventriculite', 'Lankesterellose', 'Poxvirus'],
      en: ['Canary pox', 'Proventriculitis', 'Lankesterellosis', 'Poxvirus'],
      ar: ['جدري الكناري', 'التهاب المعدة الغدية', 'داء لانكيسترلا', 'فيروس الجدري'],
      es: ['Viruela del canario', 'Proventriculitis', 'Lankesterelosis', 'Poxvirus'],
      it: ['Vaiolo del canarino', 'Proventricolite', 'Lankesterellosi', 'Poxvirus']
    },
    frequentParasites: {
      fr: ['Pou rouge (Dermanyssus gallinae)', 'Gale des pattes', 'Coccidiose'],
      en: ['Red mite (Dermanyssus gallinae)', 'Scaly leg mite', 'Coccidiosis'],
      ar: ['الفاش الأحمر', 'جرب الساقين', 'الكوكسيديا'],
      es: ['Ácaro rojo (Dermanyssus gallinae)', 'Sarna de las patas', 'Coccidiosis'],
      it: ['Acaro rosso (Dermanyssus gallinae)', 'Rogna delle zampe', 'Coccidiosi']
    },
    sensitiveToCold: false,
    sensitiveToHeat: true,
    preventionRecommendations: {
      fr: 'Nettoyage hebdomadaire des cages, désinfection semestrielle, quarantaine stricte pour les nouveaux arrivants, vaccination contre la variole conseillée.',
      en: 'Weekly cage cleaning, semi-annual disinfection, strict quarantine for newcomers, vaccination against canary pox recommended.',
      ar: 'تنظيف أسبوعي للأقفاص، تعقيم نصف سنوي، حجر صحي صارم للطيور الجديدة، وينصح بالتلقيح ضد الجدري.',
      es: 'Limpieza semanal de jaulas, desinfección semestral, cuarentena estricta para nuevos ejemplares, vacunación recomendada contra la viruela.',
      it: 'Pulizia settimanale delle gabbie, disinfezione semestrale, quarantena rigorosa per i nuovi arrivi, consigliata la vaccinazione contro il vaiolo.'
    }
  },
  management: {
    hybridizationPossible: true,
    compatibleSpecies: ['chardonneret_elegant', 'tarin_du_venezuela', 'verdier_d_europe'],
    regulatoryStatus: {
      fr: 'Espèce domestique en France, aucune démarche administrative requise pour la détention.',
      en: 'Domestic species, no administrative procedures required for possession.',
      ar: 'فصيل منزلي أليف، لا يتطلب أي إجراءات إدارية لتربيته.',
      es: 'Especie doméstica, no se requieren trámites administrativos para su posesión.',
      it: 'Specie domestica, nessuna procedura amministrativa richiesta per la detenzione.'
    },
    breedingTips: {
      fr: 'Éviter les courants d\'air et l\'exposition directe au soleil brûlant. Séparer les mâles chanteurs pour stimuler le chant mélodieux.',
      en: 'Avoid drafts and direct exposure to scorching sun. Separate singing males to stimulate melodious singing.',
      ar: 'تجنب التيارات الهوائية والتعرض المباشر لأشعة الشمس الحارقة. افصل الذكور المغردة لتحفيز التغريد العذب.',
      es: 'Evitar corrientes de aire y exposición directa al sol abrasador. Separar a los machos cantores para estimular su melodía.',
      it: 'Evitare correnti d\'aria ed esposizione directa al sole cocente. Separare i maschi per stimolare il canto melodioso.'
    }
  },
  traceability: {
    source: "Fédération Française d'Oiseauterie (FFO) / C.O.M. International",
    revisionDate: '2026-08-03',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche scientifique validée. Ces informations ne remplacent pas une consultation vétérinaire aviaire.',
      en: 'Validated scientific sheet. This information does not replace an avian veterinary consultation.',
      ar: 'بطاقة علمية معتمدة. لا تغني هذه المعلومات عن استشارة طبيب بيطري متخصص.',
      es: 'Ficha científica validada. Esta información no sustituye a una consulta veterinaria aviar.',
      it: 'Scheda scientifica validata. Le informazioni non sostituiscono una consulenza veterinaria.'
    }
  }
};
