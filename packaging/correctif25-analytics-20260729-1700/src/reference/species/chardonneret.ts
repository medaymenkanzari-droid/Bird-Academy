/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const CHARDONNERET_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'chardonneret_elegant',
    code: 'CAR-CAR',
    scientificName: 'Carduelis carduelis',
    names: {
      fr: 'Chardonneret élégant',
      en: 'European Goldfinch',
      ar: 'الحسون الأنيق',
      es: 'Jilguero elegante',
      it: 'Cardellino elegante'
    },
    family: 'Fringillidae',
    genus: 'Carduelis',
    origin: {
      fr: 'Europe, Afrique du Nord et Moyen-Orient',
      en: 'Europe, North Africa and Middle East',
      ar: 'أوروبا، شمال أفريقيا والشرق الأوسط',
      es: 'Europa, Norte de África y Oriente Medio',
      it: 'Europa, Nord Africa e Medio Oriente'
    },
    status: 'sauvage'
  },
  biology: {
    lifespan: 8, // can live up to 12-15 in captivity
    averageLength: 12, // 12-13 cm
    minWeight: 14,
    maxWeight: 19,
    sexualDimorphism: {
      fr: 'Le masque rouge dépasse l\'arrière de l\'œil chez le mâle et s\'arrête au milieu ou au premier tiers de l\'œil chez la femelle. Les petites couvertures alaires (épaules) sont d\'un noir de jais chez le mâle, et brun-verdâtre chez la femelle.',
      en: 'The red mask extends past the back of the eye in the male and stops in the middle or first third of the eye in the female. The lesser wing coverts (shoulders) are jet black in the male, and greenish-brown in the female.',
      ar: 'يتجاوز القناع الأحمر خلف العين لدى الذكر ويتوقف في منتصف العين أو ثلثها الأول لدى الأنثى. كتف الجناح أسود داكن لدى الذكر، وبني مخضر لدى الأنثى.',
      es: 'El madroño rojo supera la parte posterior del ojo en el macho y se detiene en el medio o primer tercio del ojo en la hembra. Los hombros del ala son de color negro azabache en el macho y pardo-verdosos en la hembra.',
      it: 'La maschera rossa supera il bordo posteriore dell\'occhio nel maschio e si ferma a metà o al primo terzo dell\'occhio nella femmina. Le "spalline" (spalle dell\'ala) sono nero lucido nel maschio, bruno-verdastre nella femmina.'
    },
    sexualMaturity: {
      fr: 'Environ 10 à 12 mois. Les chardonnerets sauvages se reproduisent au printemps suivant leur premier hiver.',
      en: 'About 10 to 12 months. Wild goldfinches breed in the spring following their first winter.',
      ar: 'حوالي 10 إلى 12 شهراً. تتكاثر طيور الحسون البرية في الربيع الذي يلي شتاءها الأول.',
      es: 'Aproximadamente de 10 a 12 meses. Los jilgueros silvestres se reproducen en la primavera siguiente a su primer invierno.',
      it: 'Circa 10-12 mesi. I cardellini selvatici si riproducono nella primavera successiva al loro primo inverno.'
    },
    minAgeReproduction: 11,
    recommendedAgeReproduction: 12,
    maxAgeReproduction: 48 // 4 years in intensive breeding
  },
  reproduction: {
    breedingSeason: {
      fr: 'D\'avril à août, nécessitant une température stable et au moins 14,5 heures de luminosité.',
      en: 'From April to August, requiring stable temperature and at least 14.5 hours of light.',
      ar: 'من أبريل إلى أغسطس، وتطلب درجة حرارة مستقرة وما لا يقل عن 14.5 ساعة من الإضاءة.',
      es: 'De abril a agosto, requiriendo temperatura estable y al menos 14,5 horas de luz.',
      it: 'Da aprile ad agosto, richiede temperatura stabile e almeno 14,5 ore di luce.'
    },
    incubationPeriod: 12, // 12-13 days
    avgEggsPerClutch: 5,
    maxEggsPerClutch: 6,
    avgClutchesPerYear: 2,
    feedingPeriod: 18, // 15-20 days in nest
    bandingAge: 5, // 4-6 days (foot growth is faster than canaries)
    weaningAge: 35 // 30-40 days, require a longer progressive transition
  },
  breeding: {
    bandSize: '2.5', // 2.5 mm standard (2.7 mm for Major)
    minIdealTemp: 15, // °C, more sensitive than canary
    maxIdealTemp: 28, // °C
    minHumidity: 45,
    maxHumidity: 65,
    minCageSize: {
      fr: 'Grandes cages d\'élevage de 90cm ou volières de reproduction fortement recommandées pour limiter le stress.',
      en: 'Large 90cm breeding cages or breeding aviaries are highly recommended to limit stress.',
      ar: 'أقفاص تربية كبيرة بطول 90سم أو سلاكات تفريخ ينصح بها بشدة لتقليل التوتر.',
      es: 'Jaulas grandes de cría de 90cm o aviarios de reproducción muy recomendados para reducir el estrés.',
      it: 'Grandi gabbie da cova da 90cm o voliere da riproduzione vivamente consigliate per ridurre lo stress.'
    },
    nestType: {
      fr: 'Nid suspendu de petite taille camouflé par de fausses plantes vertes artificielles ou du sapin.',
      en: 'Small suspended nest camouflaged with artificial green plants or evergreen branches.',
      ar: 'عش صغير معلق مموه بنباتات خضراء اصطناعية أو أغصان صنوبر.',
      es: 'Nido colgado de pequeño tamaño camuflado con plantas artificiales verdes o ramas.',
      it: 'Nido infrascato di piccole dimensioni, mimetizzato con piante verdi artificiali o rametti d\'abete.'
    },
    difficultyLevel: 'difficile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange de graines très varié et digeste (Alpiste, Niger, Chicorée, Chardon, Onagre, Lin, Millet blanc).',
      en: 'Highly varied and digestible seed mix (Canary seed, Niger, Chicory, Thistle, Evening primrose, Flax, White millet).',
      ar: 'خلطة حبوب متنوعة وسهلة الهضم (بذور الكناري، النيجر، الهندباء، الشوك، بريمروز، الكتان، الدخن الأبيض).',
      es: 'Mezcla de semillas muy variada y digerible (Alpiste, Negrillo, Achicoria, Cardo, Onagra, Lino, Mijo blanco).',
      it: 'Miscela di semi molto varia e digeribile (Scagliola, Niger, Cicoria, Cardo, Enotera, Lino, Miglio bianco).'
    },
    recommendedSupplements: {
      fr: 'Chardons frais, pissenlit entier, graines germées (avec contrôle fongique strict), pâtée aux œufs blanche, herbes sauvages.',
      en: 'Fresh thistles, whole dandelion, germinated seeds (with strict fungal control), white egg food, wild herbs.',
      ar: 'أشواك طازجة، هندباء برية كاملة، حبوب مستنبتة (مع رقابة فطريات صارمة)، باتيه البيض الأبيض، وأعشاب برية.',
      es: 'Cardos frescos, diente de león entero, semillas germinadas (con control estricto de hongos), pasta de cría blanca, hierbas silvestres.',
      it: 'Cardi freschi, tarassaco intero, semi germinati (con rigoroso controllo fungino), pastoncino all\'uovo bianco, erbe prative.'
    },
    vitaminFrequency: {
      fr: 'Régulièrement, 2 fois par semaine en préparation et élevage. Apport en hépatoprotecteur (Choline) capital.',
      en: 'Regularly, twice a week during preparation and breeding. Essential hepatoprotector (Choline) intake.',
      ar: 'بانتظام، مرتين في الأسبوع في فترة التجهيز والتربية. تقديم واقي الكبد (الكولين) ضروري للغاية.',
      es: 'Regularmente, 2 veces por semana en preparación y cría. Aporte capital de protector hepático (Colina).',
      it: 'Regolarmente, 2 volte a settimana in preparazione e riproduzione. Fondamentale l\'apporto di epato-protettori (Colina).'
    },
    specificNeeds: {
      fr: 'Sensible aux excès de graisses. Les graines oléagineuses doivent être distribuées avec parcimonie.',
      en: 'Sensitive to excess fats. Oilseeds must be distributed sparingly.',
      ar: 'حساس للدهون الزائدة. يجب تقديم الحبوب الزيتية بحذر وبكميات محدودة.',
      es: 'Sensible al exceso de grasas. Las semillas oleaginosas deben suministrarse con moderación.',
      it: 'Sensibile agli eccessi di grasso. I semi oleosi devono essere somministrati con parsimonia.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Coccidiose (Isospora lacazei)', 'Atoxoplasmose (très mortelle chez les jeunes)', 'Proventriculite'],
      en: ['Coccidiosis (Isospora lacazei)', 'Atoxoplasmosis (highly fatal in juveniles)', 'Proventriculitis'],
      ar: ['الكوكسيديا', 'الأتوكسوبلازما (قاتلة جداً للفراخ)', 'التهاب المعدة الغدية'],
      es: ['Coccidiosis (Isospora lacazei)', 'Atoxoplasmosis (muy mortal en jóvenes)', 'Proventriculitis'],
      it: ['Coccidiosi (Isospora lacazei)', 'Atoxoplasmosi (altamente letale nei giovani)', 'Proventricolite']
    },
    frequentParasites: {
      fr: ['Pou rouge', 'Acariens des plumes (Syringophilus)', 'Cestodes (vers plats)'],
      en: ['Red mite', 'Feather mites (Syringophilus)', 'Cestodes (flatworms)'],
      ar: ['الفاش الأحمر', 'سوس الريش', 'الديدان الشريطية'],
      es: ['Ácaro rojo', 'Ácaros de las plumas (Syringophilus)', 'Cestodos (gusanos planos)'],
      it: ['Acaro rosso', 'Acari delle piume (Syringophilus)', 'Cestodi (vermi piatti)']
    },
    sensitiveToCold: true,
    sensitiveToHeat: true,
    preventionRecommendations: {
      fr: 'Hygiène drastique de l\'eau, nettoyage quotidien du fond de cage, contrôle absolu de l\'humidité ambiante pour prévenir la prolifération de coccidies. Administration régulière d\'acidifiants (vinaigre de cidre) pour protéger la flore digestive.',
      en: 'Drastic water hygiene, daily cage bottom cleaning, absolute control of ambient humidity to prevent coccidia. Regular administration of acidifiers (apple cider vinegar) to protect the digestive flora.',
      ar: 'نظافة مائية صارمة، تنظيف يومي لأرضية القفص، تحكم مطلق في الرطوبة المحيطة لمنع الكوكسيديا. تقديم الأحماض العضوية (خل التفاح الطبيعي) بانتظام لحماية الفلورا الهضمية.',
      es: 'Higiene drástica del agua, limpieza diaria del fondo de la jaula, control absoluto de la humedad para prevenir la coccidiosis. Administración regular de acidificantes (vinagre de manzana) para proteger la flora digestiva.',
      it: 'Igiene drastica dell\'acqua, pulizia quotidiana del fondo gabbia, controllo assoluto dell\'umidità per prevenire la coccidiose. Somministrazione regolare di acidificanti (aceto di mele) per proteggere la flora intestinale.'
    }
  },
  management: {
    hybridizationPossible: true,
    compatibleSpecies: ['canari', 'tarin_du_venezuela', 'bouvreuil_pivoine'],
    regulatoryStatus: {
      fr: 'Espèce protégée en Europe. La détention d\'individus phénotypiquement sauvages nécessite un certificat de capacité et une autorisation préfectorale de détention (APD) en France. Les mutations de couleur reconnues sont considérées comme domestiques.',
      en: 'Protected species in Europe. Ownership of wild-phenotype birds requires certificates of competence depending on the state. Officially recognized color mutations are classified as domestic.',
      ar: 'فصيل محمي في أوروبا. حيازة طيور ذات مظهر بري تتطلب ترخيصاً رسمياً أو شهادة أهلية في بعض الدول. الطيور ذات الطفرات الملونة المعترف بها تعتبر منزلية أليفة.',
      es: 'Especie protegida en Europa. La posesión de ejemplares de fenotipo silvestre requiere licencias de capacitación según el país. Las mutaciones de color oficialmente reconocidas se consideran domésticas.',
      it: 'Specie protetta in Europa. La detenzione di soggetti ancestrali richiede autorizzazioni regionali/provinciali. Le mutazioni di colore riconosciute sono classificate legalmente come domestiche.'
    },
    breedingTips: {
      fr: 'Exige calme et patience. Éviter d\'introduire des personnes inconnues dans la pièce d\'élevage. Les parents ont un instinct d\'élevage sensible et peuvent abandonner le nid au moindre stress.',
      en: 'Requires quietness and patience. Avoid introducing strangers into the breeding room. Parents have a sensitive rearing instinct and can abandon the nest at the slightest stress.',
      ar: 'يتطلب الهدوء والصبر. تجنب إدخال الغرباء إلى غرف التربية. طيور الحسون تملك غريزة حساسة للغاية وقد تهجر العش عند حدوث أي توتر.',
      es: 'Exige calma y paciencia. Evitar introducir personas desconocidas en el aviario. Los padres tienen un instinto sensible de cría y pueden abandonar el nido ante el menor estrés.',
      it: 'Richiede massima calma e pazienza. Evitare l\'ingresso di estranei nel locale allevamento. I genitori hanno un istinto di allevamento delicato e possono abbandonare la covata al minimo stress.'
    }
  }
};
