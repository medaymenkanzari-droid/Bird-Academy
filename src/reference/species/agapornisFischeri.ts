/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const AGAPORNIS_FISCHERI_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'agapornis_fischeri',
    code: 'AGAP-FISC',
    scientificName: 'Agapornis fischeri',
    names: {
      fr: 'Inséparable de Fischer',
      en: "Fischer's Lovebird",
      ar: 'طائر الحب فيشر',
      es: 'Inseparable de Fischer',
      it: 'Inseparabile di Fischer'
    },
    family: 'Psittaculidae',
    genus: 'Agapornis',
    origin: {
      fr: 'Afrique orientale (nord de la Tanzanie, sud du lac Victoria, plateaux intérieurs)',
      en: 'East Africa (northern Tanzania, south of Lake Victoria, inland plateaus)',
      ar: 'شرق إفريقيا (شمال تنزانيا، جنوب بحيرة فيكتوريا، الهضاب الداخلية)',
      es: 'África oriental (norte de Tanzania, sur del lago Victoria)',
      it: 'Africa orientale (nord della Tanzania, a sud del lago Vittoria)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 12, // 10-15 ans en captivité
    averageLength: 14, // 14-15 cm
    minWeight: 40, // 40-55 g
    maxWeight: 55,
    sexualDimorphism: {
      fr: 'Absence de dimorphisme sexuel visuel fiable (monomorphe). Les deux sexes présentent un cercle oculaire blanc dénudé très marqué, un bec rouge corail vif intense, un front et des joues rouge orangé vif, et une nuque vert olive/bronze. Le sexage ADN (plumes/sang) ou l\'écartement pelvien chez la femelle mature sont indispensables pour déterminer le sexe.',
      en: 'No reliable visual sexual dimorphism (monomorphic). Both sexes exhibit a prominent bare white eye-ring, intense coral-red beak, bright reddish-orange forehead and cheeks, and olive-green neck. DNA sexing or pelvic palpation in adult females is required for dependable sexing.',
      ar: 'غياب التمايز الجنسي البصري المؤكد (أحادي الشكل). يمتلك كلا الجنسين حلقة عين بيضاء عارية بارزة، منقاراً أحمر مرجانياً فاقعاً، جبهة وخدوداً برتقالية محمرة، وعنقاً زيتونياً. فحص الحمض النووي (DNA) هو الطريقة المعتمدة لتحديد الجنس.',
      es: 'Sin dimorfismo sexual visual fiable (monomórfico). Ambos sexos presentan un marcado anillo ocular blanco desprovisto de plumas, pico rojo coral intenso, frente y mejillas naranja rojizo. El sexaje por ADN o palpación pélvica es indispensable.',
      it: 'Assenza di dimorfismo sessuale visivo affidabile (monomorfico). Entrambi i sessi mostrano un evidente anello perioculare bianco nudo, becco rosso corallo intenso, fronte e guance arancio-rossastre. Il sessaggio molecolare DNA è fondamentale.'
    },
    sexualMaturity: {
      fr: 'Maturité physiologique vers 8 à 10 mois, mais la première mise en reproduction doit être différée à 10-12 mois pour garantir le développement squelettique complet et prévenir le mal de ponte.',
      en: 'Physiological maturity at 8-10 months, but breeding must be delayed until 10-12 months to ensure full skeletal growth and prevent egg binding.',
      ar: 'نضج فسيولوجي بين 8 و10 أشهر، ولكن يجب تأخير أول تزاوج حتى عمر 10-12 شهراً لضمان اكتمال النمو وتفادي احتباس البيض.',
      es: 'Madurez fisiológica a los 8-10 meses, pero la primera reproducción debe posponerse a los 10-12 meses para evitar distocias.',
      it: 'Maturità fisiologica a 8-10 mesi, ma la riproduzione deve attendere i 10-12 mesi per prevenire ritenzioni dell\'uovo.'
    },
    minAgeReproduction: 10,
    recommendedAgeReproduction: 12,
    maxAgeReproduction: 72
  },
  reproduction: {
    breedingSeason: {
      fr: 'Printemps et début d\'été en intérieur tempéré (mars à juillet) ; photopériode de 12 à 14 heures.',
      en: 'Spring and early summer indoors (March to July); 12-14 hours photoperiod.',
      ar: 'الربيع وبداية الصيف داخلياً (مارس إلى يوليو)؛ 12 إلى 14 ساعة إضاءة.',
      es: 'Primavera y principios de verano en interior (marzo a julio); fotoperiodo de 12-14 horas.',
      it: 'Primavera e inizio estate al chiuso (marzo-luglio); fotoperiodo di 12-14 ore.'
    },
    incubationPeriod: 22, // 21-23 jours (moyenne 22-23 jours)
    avgEggsPerClutch: 5,
    maxEggsPerClutch: 6,
    avgClutchesPerYear: 2,
    feedingPeriod: 40, // Élevage au nid : 38 à 42 jours
    bandingAge: 9, // Bague fermée posée entre le 8e et 10e jour (optimal J9)
    weaningAge: 50 // Sevrage alimentaire complet vers 45-55 jours (moyenne 50 jours)
  },
  breeding: {
    bandSize: '4.0 mm', // Standard officiel réglementaire C.O.M. / UOF (4.0 mm, tolérance 4.2 mm - JAMAIS 4.5 mm)
    minIdealTemp: 18,
    maxIdealTemp: 25,
    minHumidity: 55,
    maxHumidity: 70,
    minCageSize: {
      fr: 'Cage de reproduction 80 × 40 × 40 cm minimum par couple ; volière spacieuse recommandée hors période de reproduction.',
      en: 'Breeding cage 80 × 40 × 40 cm minimum per pair; spacious flight aviary outside breeding season.',
      ar: 'قفص تزاوج 80 × 40 × 40 سم كحد أدنى لكل زوج؛ ويفضل مطير واسع خارج موسم التزاوج.',
      es: 'Jaula de cría 80 × 40 × 40 cm mínimo por pareja; voladera espaciosa recomendada fuera de época de cría.',
      it: 'Gabbia cova 80 × 40 × 40 cm minimo per coppia; voliera spaziosa raccomandata fuori stagione.'
    },
    nestType: {
      fr: 'Nichoir boîte fermé en bois rigide (type inséparables, approx. 20 × 15 × 15 cm avec trou d\'envol de 5 cm). Fournir des rameaux frais de saule ou herbes propres que la femelle transporte exclusivement dans son bec (ne transporte JAMAIS les matériaux dans son croupion).',
      en: 'Enclosed wooden nestbox (lovebird type, approx. 20 × 15 × 15 cm with 5 cm entrance hole). Provide fresh willow twigs or grasses that females carry strictly in their bill (never in rump feathers).',
      ar: 'صندوق عش خشبي مغلق (حوالي 20 × 15 × 15 سم بفتحة 5 سم). توفير أغصان الصفصاف الطازجة التي تنقلها الأنثى في منقارها حصراً (لا تنقل المواد في ريش الكفل أبداً).',
      es: 'Caja nido cerrada de madera (aprox. 20 × 15 × 15 cm con orificio de 5 cm). Aportar ramas de sauce que la hembra transporta exclusivamente en su pico.',
      it: 'Nido a cassetta chiusa in legno (circa 20 × 15 × 15 cm con foro di 5 cm). Fornire rami di salice freschi che la femmina trasporta esclusivamente nel becco.'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique de graines pour petites perruches/inséparables (alpiste, millets variés, avoine pelée, cardon, faible teneur en tournesol pour prévenir la stéatose hépatique) ou extrudés de qualité.',
      en: 'Specific seed blend for small parrots/lovebirds (canary seed, varied millets, groats, safflower, minimal sunflower seeds) or quality pellets.',
      ar: 'خليط بذور مخصص للببغاوات الصغيرة (فلارس، دخن متنوع، خرطال مقشور، قرطم، مع تقنين دوار الشمس) أو بيلت عالي الجودة.',
      es: 'Mezcla específica para pequeños psitácidos (alpiste, mijos variados, avena, cártamo, poco girasol) o pienso extrusionado.',
      it: 'Miscela specifica per piccoli parrocchetti/inseparabili (scagliola, vari tipi di miglio, avena decorticata, cartamo, poco girasole) o estrusi.'
    },
    recommendedSupplements: {
      fr: 'Pâtée aux œufs lors de la reproduction, os de seiche et bloc minéral permanents (calcium vital), légumes verts frais (épinards, brocoli), carotte, pomme.',
      en: 'Eggfood during breeding, cuttlebone and mineral block at all times, fresh green vegetables, carrot, apple.',
      ar: 'باتيه البيض أثناء التكاثر، عظم الحبار وحجر المعادن باستمرار، خضروات ورقية طازجة، جزر، تفاح.',
      es: 'Pasta de cría, jibia y bloque mineral constantes, verduras frescas, zanahoria, manzana.',
      it: 'Pastoncino all\'uovo in riproduzione, osso di seppia e blocco minerale sempre disponibili, verdure fresche, carota, mela.'
    },
    vitaminFrequency: {
      fr: 'Complexe vitaminique (A, D3, E) 1 à 2 fois par semaine en période de mue et de préparation des reproducteurs.',
      en: 'Multivitamin complex (A, D3, E) 1-2 times weekly during moult and breeding preparation.',
      ar: 'فيتامينات متعددة (A, D3, E) مرة إلى مرتين أسبوعياً أثناء تبديل الريش والاستعداد للتفريخ.',
      es: 'Complejo vitamínico (A, D3, E) 1-2 veces por semana en muda y preparación a la cría.',
      it: 'Complesso multivitaminico (A, D3, E) 1-2 volte a settimana durante la muta e preparazione alle cove.'
    },
    specificNeeds: {
      fr: 'Besoins accrus en calcium lors de la ponte pour prévenir la rétention d\'œuf. Matériaux végétaux frais humides indispensables pour que la femelle régule l\'hygrométrie du nid.',
      en: 'Increased calcium requirements during oviposition to prevent egg binding. Fresh moist nesting material essential for humidity regulation.',
      ar: 'احتياج متزايد للكالسيوم أثناء وضع البيض لتفادي احتباسه. مواد تعشيش طازجة ورطبة لتنظيم رطوبة غرفة البيض.',
      es: 'Demanda aumentada de calcio en puesta. Ramas frescas húmedas indispensables para regular la humedad del nido.',
      it: 'Fabbisogno aumentato di calcio durante la deposizione. Rami freschi indispensabili per regolare l\'umidità del nido.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Circovirose aviaire (PBFD)', 'Chlamydiose aviaire (psittacose)', 'Stéatose hépatique', 'Rétention d\'œuf (distocie)', 'Picage chronique'],
      en: ['Psittacine Beak and Feather Disease (PBFD)', 'Avian Chlamydiosis (psittacosis)', 'Hepatic lipidosis', 'Egg binding (dystocia)', 'Feather plucking'],
      ar: ['مرض منقار وريش الببغاء (PBFD)', 'داء المتدثرات الطيري (الكلاميديا)', 'تشحم الكبد', 'احتباس البيض', 'افتراس الريش'],
      es: ['Enfermedad del pico y plumas (PBFD)', 'Clamidiosis aviar', 'Lipidosis hepática', 'Distocia', 'Picaje'],
      it: ['Malattia del becco e delle piume (PBFD)', 'Clamidiosi aviaria', 'Lipidosi epatica', 'Ritenzione dell\'uovo', 'Picaggio']
    },
    frequentParasites: {
      fr: ['Gale des pattes et du bec (Knemidokoptes pilae)', 'Poux rouges (Dermanyssus gallinae)', 'Coccidiose', 'Ascaridose intestinale'],
      en: ['Scaly leg and face mites (Knemidokoptes pilae)', 'Red mites (Dermanyssus gallinae)', 'Coccidiosis', 'Intestinal ascarids'],
      ar: ['جرب الأرجل والمنقار', 'الفاش الأحمر', 'الكوكسيديا', 'ديدان الأسكاريس'],
      es: ['Sarna del pico y patas', 'Ácaro rojo', 'Coccidiosis', 'Áscaris'],
      it: ['Acariasi del becco e delle zampe', 'Acaro rosso', 'Coccidiosi', 'Ascaridi']
    },
    sensitiveToCold: true,
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Dépistage PBFD / Chlamydiose conseillé à l\'introduction de tout nouvel oiseau. Quarantaine stricte de 30 jours. Nettoyage et désinfection rigoureuse des perchoirs et nichoirs.',
      en: 'Screening for PBFD and Chlamydiosis advised for new birds. Strict 30-day quarantine. Thorough cleaning and disinfection of perches and nestboxes.',
      ar: 'فحص مسبق لـ PBFD والكلاميديا عند إدخال طائر جديد. حجر صحي 30 يوماً. تنظيف وتعقيم المجاثم وصناديق التعشيش.',
      es: 'Control veterinario de PBFD y Clamidiosis. Cuarentena de 30 días. Desinfección estricta de posaderos y nidos.',
      it: 'Screening preventivo PBFD e Clamidiosi. Quarantena di 30 giorni. Disinfezione accurata di posatoi e nidi.'
    }
  },
  management: {
    hybridizationPossible: true, // Hybridation inter-féconde possible avec Personatus mais formellement proscrite par la C.O.M. (produit des oiseaux intermédiaires bâtards polluant les souches pures). Hybridation avec Roseicollis donne des hybrides stériles.
    compatibleSpecies: [],
    breedingTips: {
      fr: 'Oiseau grégaire mais territorial en reproduction. Fournir des rameaux de saule que la femelle transporte dans son bec (différence comportementale fondamentale avec Roseicollis). Bannir tout croisement avec Personatus ou Roseicollis pour préserver la pureté de l\'espèce.',
      en: 'Colonial but territorial during breeding. Provide willow twigs that females carry in their beak (fundamental behavioral difference from Roseicollis). Avoid any crossbreeding with Personatus or Roseicollis to preserve pure species integrity.',
      ar: 'طائر اجتماعي ولكنه إقليمي أثناء التزاوج. وفر أغصان الصفصاف التي تنقلها الأنثى في منقارها (فارق سلوكي جوهري عن الروزيكوليس). يمنع التزاوج مع البيرسوناتا أو الروزيكوليس للحفاظ على نقاوة الفصيل.',
      es: 'Especie gregaria pero territorial en cría. Suministrar ramas que la hembra transporta en su pico (diferencia etológica clave con Roseicollis). Evitar cruces con Personatus o Roseicollis.',
      it: 'Specie gregaria ma territoriale in cova. Fornire rami che la femmina trasporta nel becco (differenza comportamentale chiave rispetto a Roseicollis). Evitare incroci con Personatus o Roseicollis.'
    }
  },
  traceability: {
    source: 'Standards C.O.M. / UOF Psittacidés / Dirk Van den Abeele (Agapornis - The Genus)',
    revisionDate: '2026-10-20',
    validationStatus: 'draft',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique dédiée structurée pour Agapornis fischeri (bague officielle 4.0 mm, incubation 22-23j, transport des matériaux dans le bec). Homologation bibliographique formelle en attente (GAP-07).',
      en: 'Dedicated biological profile structured for Agapornis fischeri (official 4.0 mm band, 22-23d incubation, bill-carried nesting material). Formal bibliographic homologation pending (GAP-07).',
      ar: 'بطاقة بيولوجية مخصصة ومحدثة لطائر الحب فيشر (حجل رسمي 4.0 مم، حضن 22-23 يوماً، نقل مواد التعشيش بالمنقار). الاعتماد الببليوغرافي بانتظار المراجعة (GAP-07).',
      es: 'Ficha biológica dedicada estructurada para Agapornis fischeri (anilla oficial 4.0 mm, incubación 22-23d, transporte de material en el pico). Homologación bibliográfica pendiente (GAP-07).',
      it: 'Scheda biologica dedicata strutturata per Agapornis fischeri (anello ufficiale 4.0 mm, incubazione 22-23gg, trasporto materiali nel becco). Omologazione bibliografica in attesa (GAP-07).'
    }
  }
};
