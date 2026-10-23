/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const DIAMANT_MANDARIN_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'diamant_mandarin',
    code: 'DIAM-MAN',
    scientificName: 'Taeniopygia guttata',
    names: {
      fr: 'Diamant mandarin',
      en: 'Zebra Finch',
      ar: 'عصفور الزيبرا',
      es: 'Diamante mandarín',
      it: 'Diamante mandarino'
    },
    family: 'Estrildidae',
    genus: 'Taeniopygia',
    origin: {
      fr: 'Australie (zone aride et semi-aride centrale)',
      en: 'Australia (central arid and semi-arid zone)',
      ar: 'أستراليا (المناطق القاحلة وشبه القاحلة الوسطى)',
      es: 'Australia (zona árida y semiárida central)',
      it: 'Australia (zona arida e semiarida centrale)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 7, // 5-8 ans en moyenne en captivité
    averageLength: 11, // 10-12 cm selon souche standard ou classique
    minWeight: 12, // 12-14g sauvage, 15-20g élevage de sélection
    maxWeight: 20,
    sexualDimorphism: {
      fr: 'Dimorphisme sexuel très marqué en phénotype sauvage : le mâle possède des joues orange/rouille, une bavette zébrée noire sur la poitrine, des flancs marron piqués de blanc et un bec rouge corail vif. La femelle est dépourvue de joues et de flancs ornementés, avec un bec orange plus clair. Seul le mâle chante et parade.',
      en: 'Highly distinct sexual dimorphism in wild phenotype: male has orange/chestnut cheek patches, black zebra breast bar, chestnut flanks dotted with white, and bright coral-red beak. Female lacks cheek patches and flank markings, has paler orange beak. Only the male sings and courts.',
      ar: 'مثنوية جنسية واضحة جداً في الطراز البري: يمتلك الذكر خدوداً برتقالية/صدئية، وتخطيطاً أسود كالحمار الوحشي على الصدر، وجوانب بنية منقطة بالأبيض، ومنقاراً أحمر مرجانياً فاقعاً. تفتقر الأنثى إلى الخدود الملونة ونقاط الجوانب، ومنقارها برتقالي فاتح. الذكر وحده يغرد ويغازل.',
      es: 'Dimorfismo sexual muy marcado en fenotipo ancestral: el macho posee mejillas anaranjadas/óxido, pecho cebrado negro, flancos castaños moteados de blanco y pico rojo coral vivo. La hembra carece de mejillas y flancos coloreados, con pico naranja claro. Solo el macho canta y corteja.',
      it: 'Dimorfismo sessuale molto marcato nel fenotipo ancestrale: il maschio ha guance arancione/ruggine, petto barrato di nero, fianchi castani punteggiati di bianco e becco rosso corallo vivo. La femmina è priva di guance e fianchi colorati, con becco arancione chiaro. Solo il maschio canta ed esegue la parata.'
    },
    sexualMaturity: {
      fr: 'Physiologiquement précoce dès 2 à 3 mois, mais la première mise en reproduction doit impérativement être différée à 9-10 mois pour préserver la croissance de l\'oiseau et éviter la rétention d\'œuf.',
      en: 'Physiologically mature from 2-3 months, but first breeding must strictly be delayed until 9-10 months to preserve bird growth and prevent egg binding.',
      ar: 'نضج فسيولوجي مبكر ابتداءً من عمر شهرين إلى 3 أشهر، ولكن يجب تأخير أول تزاوج حتى عمر 9-10 أشهر للحفاظ على نمو الطائر وتجنب احتباس البيض.',
      es: 'Fisiológicamente maduro a los 2-3 meses, pero la primera puesta debe retrasarse obligatoriamente a los 9-10 meses para asegurar el desarrollo del ave y evitar distocias.',
      it: 'Fisiologicamente maturo a 2-3 mesi, ma la prima riproduzione deve essere tassativamente posticipata a 9-10 mesi per salvaguardare lo sviluppo ed evitare la ritenzione dell\'uovo.'
    },
    minAgeReproduction: 6, // Âge biologique minimal absolu
    recommendedAgeReproduction: 9, // Recommandation éthique et zootechnique
    maxAgeReproduction: 48 // 4 ans max en élevage
  },
  reproduction: {
    breedingSeason: {
      fr: 'Opportuniste toute l\'année en intérieur sous conditions contrôlées ; printemps/été recommandé en élevage standard (14 heures d\'éclairage régulier).',
      en: 'Opportunistic year-round indoors under controlled conditions; spring/summer recommended in standard aviculture (14 hours of stable light).',
      ar: 'تفريخ مرن طوال العام داخلياً في ظروف مهيأة؛ يفضل فصل الربيع/الصيف في التربية القياسية (14 ساعة إضاءة منتظمة).',
      es: 'Oportunista todo el año en interior bajo condiciones controladas; primavera/verano recomendado en cría reglada (14 horas de luz regular).',
      it: 'Opportunista tutto l\'anno al chiuso in condizioni controllate; primavera/estate raccomandata nell\'allevamento standard (14 ore di luce stabile).'
    },
    incubationPeriod: 13, // 12-14 jours (commence souvent au 3e œuf)
    avgEggsPerClutch: 5,
    maxEggsPerClutch: 7,
    avgClutchesPerYear: 3, // 3 pontes max par saison pour la santé de la femelle
    feedingPeriod: 21, // 18-21 jours au nid
    bandingAge: 6, // 5-7 jours selon la taille de la nichée
    weaningAge: 32 // Sevrage complet entre 30 et 35 jours
  },
  breeding: {
    bandSize: '2.5 mm', // Standard officiel COM / FFO pour Taeniopygia guttata (2.7 mm pour souches géantes d'exposition)
    minIdealTemp: 16,
    maxIdealTemp: 25,
    minHumidity: 50,
    maxHumidity: 70,
    minCageSize: {
      fr: 'Cage de reproduction minimale 60x35x40 cm pour un couple.',
      en: 'Minimum breeding cage 60x35x40 cm for a pair.',
      ar: 'قفص تفريخ لا يقل عن 60×35×40 سم للزوج.',
      es: 'Jaula de cría mínima 60x35x40 cm para una pareja.',
      it: 'Gabbia da cova minima 60x35x40 cm per una coppia.'
    },
    nestType: {
      fr: 'Nid boîte fermé ou semi-ouvert en bois/plastique pour exotiques (bannir la coupelle ouverte de canari). Fournir fibres de coco et herbes sèches (bannir le coton hydrophile).',
      en: 'Enclosed or semi-open nest box for finches (ban open canary cup nest). Provide coconut fibers and dry grasses (ban raw cotton threads).',
      ar: 'صندوق عش مغلق أو شبه مفتوح لطيور الزيبرا (لا تستخدم أبداً أعشاش الكناري المفتوحة). وفر ألياف جوز الهند والأعشاب الجافة (يمنع القطن الطبي الخيطي).',
      es: 'Nido caja cerrado o semiabierto para exóticos (nunca nido abierto de canario). Proporcionar fibra de coco y pelo de cabra (prohibido algodón hilado).',
      it: 'Nido a cassetta chiuso o semichiuso per esotici (mai nido aperto a coppa da canarino). Fornire fibra di cocco ed erbe secche (vietato cotone idrofilo).'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique pour petits exotiques composé majoritairement d\'alpiste et de divers millets (millet blanc, panis, millet rouge, millet jaune).',
      en: 'Specific seed mix for small finches predominantly consisting of canary seed and varied millets (white millet, pannicum, red and yellow millet).',
      ar: 'خلطة حبوب مخصصة للطيور الإفريقية والأسترالية الصغيرة تتكون أساساً من الفلارس والأنواع المختلفة من الدخن (الدخن الأبيض، البانيس، الأحمر والأصفر).',
      es: 'Mezcla específica para pequeños exóticos compuesta mayoritariamente por alpiste y diversos mijos (mijo blanco, panizo, mijo rojo y amarillo).',
      it: 'Miscela specifica per piccoli esotici composta prevalentemente da scagliola e vari tipi di miglio (miglio bianco, panico, miglio rosso e giallo).'
    },
    recommendedSupplements: {
      fr: 'Pâtée d\'élevage aux œufs pour exotiques, millet en grappe, os de seiche, grit insoluble et bloc minéral riches en calcium indispensables.',
      en: 'Eggfood for exotic finches, spray millet, cuttlebone, insoluble grit and calcium mineral block essential.',
      ar: 'باتيه البيض المخصص لطيور الزيبرا، عناقيد الدخن (السبول)، عظم الحبار، الحصى الهضمي وبلوك المعادن الغني بالكالسيوم الضروري.',
      es: 'Pasta de cría al huevo para exóticos, mijo en rama (panizo), hueso de sepia, grit y bloque mineral rico en calcio indispensable.',
      it: 'Pastoncino all\'uovo per esotici, spighe di panico, osso di seppia, grit insolubile e blocco minerale ricco di calcio indispensabile.'
    },
    vitaminFrequency: {
      fr: 'Complexe vitaminique polyvitaminé une fois par semaine en entretien, 2 à 3 fois par semaine en période de ponte et de nourrissage.',
      en: 'Multivitamin complex once a week for maintenance, 2-3 times weekly during laying and chick rearing.',
      ar: 'مكمل فيتاميني متعدد مرة أسبوعياً للحفاظ على الحيوية، ومن مرتين إلى 3 مرات أسبوعياً أثناء وضع البيض وإطعام الفراخ.',
      es: 'Complejo polivitamínico una vez por semana en mantenimiento, 2 a 3 veces por semana durante la puesta y cría.',
      it: 'Complesso polivitaminico una volta a settimana a riposo, 2-3 volte a settimana durante la deposizione e lo svezzamento.'
    },
    specificNeeds: {
      fr: 'Besoin constant en calcium assimilable pour prévenir la rétention d\'œuf chez la femelle très prolifique.',
      en: 'Constant requirement for bioavailable calcium to prevent egg binding in highly prolific females.',
      ar: 'حاجة دائمة للكالسيوم سهل الامتصاص لتفادي احتباس البيض لدى الإناث عالية الإنتاجية.',
      es: 'Necesidad constante de calcio biodisponible para prevenir la distocia en hembras muy prolíficas.',
      it: 'Costante fabbisogno di calcio biodisponibile per prevenire la ritenzione dell\'uovo nelle femmine molto prolifiche.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Coccidiose', 'Rétention d\'œuf (hypocalcémie)', 'Gale des pattes (Knemidokoptes)', 'Atoxoplasmose'],
      en: ['Coccidiosis', 'Egg binding (hypocalcemia)', 'Scaly leg mite (Knemidokoptes)', 'Atoxoplasmosis'],
      ar: ['الكوكسيديا', 'احتباس البيض (نقص الكالسيوم)', 'جرب الساق (Knemidokoptes)', 'الأتوكسوبلازما'],
      es: ['Coccidiosis', 'Retención de huevo (hipocalcemia)', 'Sarna de las patas (Knemidokoptes)', 'Atoxoplasmosis'],
      it: ['Coccidiosi', 'Ritenzione dell\'uovo (ipocalcemia)', 'Scabbia delle zampe (Knemidokoptes)', 'Atoxoplasmosi']
    },
    frequentParasites: {
      fr: ['Pou rouge (Dermanyssus gallinae)', 'Acariens des plumes', 'Vers intestinaux (Ascaridia)'],
      en: ['Red mite (Dermanyssus gallinae)', 'Feather mites', 'Intestinal worms (Ascaridia)'],
      ar: ['الفاش الأحمر (عث الدواجن)', 'عث الريش', 'الديدان المعوية (الأسكاريس)'],
      es: ['Piojillo rojo (Dermanyssus gallinae)', 'Ácaros de la pluma', 'Lombrices intestinales (Ascaridia)'],
      it: ['Acaro rosso (Dermanyssus gallinae)', 'Acari delle piume', 'Vermi intestinali (Ascaridi)']
    },
    sensitiveToCold: false, // Résistant si hors-gel, sec et abrité
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Contrôle strict de l\'humidité ambiante (< 70%), hygiène rigoureuse du fond de cage et des perchoirs, désinfection systématique des nids entre chaque nichée.',
      en: 'Strict humidity control (< 70%), thorough cleaning of cage bottom and perches, systematic nest disinfection between clutches.',
      ar: 'مراقبة دقيقة للرطوبة (< 70%)، نظافة صارمة لأرضية القفص والمجاثم، وتعقيم منهجي للأعشاش بين كل دورة تفريخ.',
      es: 'Control riguroso de la humedad (< 70%), higiene meticulosa del fondo de jaula y posaderos, desinfección sistemática del nido entre nidadas.',
      it: 'Controllo rigoroso dell\'umidità (< 70%), pulizia meticolosa del fondo gabbia e dei posatoi, disinfezione sistematica dei nidi tra le covate.'
    }
  },
  management: {
    hybridizationPossible: true,
    compatibleSpecies: ['diamant_de_bicheno', 'moineau_du_japon', 'padda_de_java'],
    breedingTips: {
      fr: 'Oiseau très sociable pouvant vivre en colonie, mais la reproduction contrôlée par sélection génétique exige impérativement des cages individuelles par couple pour garantir la traçabilité du pedigree.',
      en: 'Highly gregarious bird suitable for colony life, but controlled pedigree and color genetics breeding strictly requires individual pair breeding cages.',
      ar: 'طائر اجتماعي جداً يمكنه العيش في جماعات، ولكن التربية الموجهة للتحكم في الأنساب والطفرات الجينية تتطلب حتماً أقفاصاً فردية لكل زوج.',
      es: 'Ave muy gregaria apta para colonia, pero la cría selectiva para control de mutaciones y pedigrí exige obligatoriamente jaulas individuales por pareja.',
      it: 'Uccello molto socievole adatto alla vita di gruppo, ma l\'allevamento selettivo per mutazioni e genealogia richiede tassativamente gabbie individuali da cova.'
    }
  },
  traceability: {
    source: 'Confédération Ornithologique Mondiale (C.O.M.) / Union Ornithologique de France (U.O.F.) / Zann (1996)',
    revisionDate: '2026-10-08',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique certifiée conforme aux standards d\'élevage avicoles internationaux (C.O.M.).',
      en: 'Certified biological sheet compliant with international avicultural standards (C.O.M.).',
      ar: 'بطاقة بيولوجية معتمدة ومتوافقة مع المعايير الدولية لتربية الطيور (C.O.M.).',
      es: 'Ficha biológica certificada conforme a los estándares ornitológicos internacionales (C.O.M.).',
      it: 'Scheda biologica certificata conforme agli standard ornitologici internazionali (C.O.M.).'
    }
  }
};
