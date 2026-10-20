/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const AGAPORNIS_ROSEICOLLIS_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'agapornis_roseicollis',
    code: 'AGAP-ROSE',
    scientificName: 'Agapornis roseicollis',
    names: {
      fr: 'Inséparable rosegorge',
      en: 'Peach-faced Lovebird',
      ar: 'طائر الحب روزيكوليس',
      es: 'Inseparable de Namibia / Inseparable de cara melocotón',
      it: 'Inseparabile dal collo rosa / Inseparabile di Roseicollis'
    },
    family: 'Psittaculidae',
    genus: 'Agapornis',
    origin: {
      fr: 'Afrique australe (Namibie, sud-ouest de l\'Angola, bassin du fleuve Orange)',
      en: 'Southwestern Africa (Namibia, southwestern Angola, Orange River basin)',
      ar: 'جنوب غرب إفريقيا (ناميبيا، جنوب غرب أنغولا، حوض نهر أورانج)',
      es: 'África sudoccidental (Namibia, suroeste de Angola, cuenca del río Orange)',
      it: 'Africa sudoccidentale (Namibia, sud-ovest dell\'Angola, bacino del fiume Orange)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 12, // 10-15 ans en moyenne en captivité
    averageLength: 15, // 15-17 cm
    minWeight: 45, // 45-55 g (sauvage 45-50g, sélection avicole jusqu'à 55-60g)
    maxWeight: 60,
    sexualDimorphism: {
      fr: 'Absence de dimorphisme sexuel visuel fiable (monomorphe). Le mâle et la femelle présentent le même plumage vert intense, masque facial rose-pêche à rouge carmin et croupion bleu vif. Le sexage visuel est impossible avec certitude : le sexage par ADN (plumes/sang) ou l\'écartement des os pubiens (palpation pelvienne chez la femelle mature) sont les seules méthodes fiables.',
      en: 'No reliable visual sexual dimorphism (monomorphic). Both sexes exhibit identical bright green plumage, peach-to-carmine red facial mask, and vivid blue rump. Visual sexing is unreliable: DNA sexing (feathers/blood) or pelvic bone spacing in mature females are the only dependable methods.',
      ar: 'غياب التمايز الجنسي البصري المؤكد (أحادي الشكل). يمتلك الذكر والأنثى نفس الريش الأخضر الزاهي وقناع الوجه الوردي/الخوخي والكفل الأزرق الساطع. تحديد الجنس بالنظر غير موثوق به: الفحص بالحمض النووي (DNA) أو فحص تباعد عظام الحوض لدى الأنثى البالغة هما الطريقتان المعتمدتان.',
      es: 'Ausencia de dimorfismo sexual visual fiable (monomórfico). Ambos sexos presentan idéntico plumaje verde brillante, máscara facial rosa melocotón a rojo carmín y obispillo azul intenso. El sexaje visual es inviable: el sexaje por ADN o la palpación de los huesos pélvicos en hembras adultas son los únicos métodos seguros.',
      it: 'Assenza di dimorfismo sessuale visivo affidabile (monomorfismo). Maschio e femmina esibiscono identico piumaggio verde brillante, maschera facciale rosa pesca-rosso carminio e codrione blu vivo. Il sessaggio visivo non è attendibile: il sessaggio molecolare DNA o la palpazione delle ossa pubiche nelle femmine adulte sono i soli metodi affidabili.'
    },
    sexualMaturity: {
      fr: 'Maturité physiologique vers 8 à 10 mois, mais la première mise en reproduction doit impérativement être différée à 12 mois minimum pour prévenir l\'épuisement, l\'abandon du nid et la rétention d\'œuf (distocie).',
      en: 'Physiological maturity at 8-10 months, but breeding must strictly be delayed until at least 12 months of age to prevent physical depletion, nest abandonment, and egg binding.',
      ar: 'نضج فسيولوجي بين 8 و10 أشهر، ولكن يجب تأخير أول تزاوج حتى عمر 12 شهراً على الأقل لتفادي الإجهاد، هجر العش، واحتباس البيض.',
      es: 'Madurez fisiológica a los 8-10 meses, pero la primera reproducción debe posponerse obligatoriamente hasta los 12 meses como mínimo para evitar distocias y agotamiento.',
      it: 'Maturità fisiologica a 8-10 mesi, ma la prima riproduzione deve essere rigorosamente posticipata ad almeno 12 mesi per prevenire ritenzione dell\'uovo e abbandono.'
    },
    minAgeReproduction: 10, // Âge minimal absolu en mois
    recommendedAgeReproduction: 12, // Recommandation zootechnique éthique
    maxAgeReproduction: 72 // 6 ans max en reproduction intensive
  },
  reproduction: {
    breedingSeason: {
      fr: 'Printemps et début d\'été en intérieur tempéré (mars à juillet) ; déclenchée par un apport lumineux de 12 à 14 heures et une humidité relative adaptée.',
      en: 'Spring and early summer indoors (March to July); triggered by 12-14 hours of photoperiod and appropriate humidity.',
      ar: 'الربيع وبداية الصيف في الأماكن المغلقة المعتدلة (مارس إلى يوليو)؛ يحفزها 12 إلى 14 ساعة إضاءة ورطوبة ملائمة.',
      es: 'Primavera y principios de verano en interior controlado (marzo a julio); estimulada por 12-14 horas de luz diaria y humedad adecuada.',
      it: 'Primavera e inizio estate in ambiente controllato (marzo-luglio); stimolata da 12-14 ore di luce e umidità appropriata.'
    },
    incubationPeriod: 23, // 22-24 jours (23 jours en moyenne chez roseicollis)
    avgEggsPerClutch: 5, // 4 à 6 œufs
    maxEggsPerClutch: 6,
    avgClutchesPerYear: 2, // Limiter à 2 couvées par an pour la préservation de la femelle
    feedingPeriod: 42, // Élevage au nid : 40 à 45 jours
    bandingAge: 9, // Bague fermée posée entre le 8e et 10e jour (optimal 9e jour)
    weaningAge: 55 // Sevrage alimentaire complet vers 50-60 jours
  },
  breeding: {
    bandSize: '4.5 mm', // Bague réglementaire C.O.M. / UOF pour Agapornis roseicollis (4.5 mm)
    minIdealTemp: 16,
    maxIdealTemp: 24,
    minHumidity: 55,
    maxHumidity: 70, // Humidité essentielle durant l'incubation pour éviter le dessèchement de la membrane coquillière
    minCageSize: {
      fr: 'Cage de reproduction 80 × 40 × 40 cm minimum par couple ; volière spacieuse recommandée hors période de reproduction pour l\'exercice physique.',
      en: 'Breeding cage 80 × 40 × 40 cm minimum per pair; spacious aviary recommended outside breeding season for flying exercise.',
      ar: 'قفص تزاوج 80 × 40 × 40 سم كحد أدنى لكل زوج؛ ويفضل مطير واسع خارج موسم التزاوج للطيران والنشاط.',
      es: 'Jaula de cría 80 × 40 × 40 cm mínimo por pareja; voladera espaciosa recomendada fuera de época de cría.',
      it: 'Gabbia cova 80 × 40 × 40 cm minimo per coppia; voliera spaziosa raccomandata fuori dal periodo riproduttivo.'
    },
    nestType: {
      fr: 'Nichoir boîte fermé en bois rigide à ouverture supérieure ou latérale (type perruche/inséparable, dimensions approx. 20 × 15 × 15 cm avec trou d\'envol de 5 cm). Fournir impérativement des matériaux de construction (rameaux de saule frais, feuilles de palmier, herbes propres) que la femelle transporte dans son croupion.',
      en: 'Enclosed wooden nestbox with top or side inspection door (lovebird type, approx. 20 × 15 × 15 cm with 5 cm entrance hole). Fresh nesting material (willow branches, palm fronds) must be provided, which females carry tucked into rump feathers.',
      ar: 'صندوق عش خشبي مغلق مع فتحة مراقبة علوية أو جانبية (مقاسات حوالي 20 × 15 × 15 سم وفتحة دخول 5 سم). يجب توفير مواد التعشيش (أغصان الصفصاف الطازجة، سعف النخيل) التي تنقلها الأنثى محشوة في ريش كفلها.',
      es: 'Caja nido cerrada de madera con puerta de inspección (tipo agapornis, aprox. 20 × 15 × 15 cm con orificio de 5 cm). Indispensable aportar material (ramas frescas de sauce, hojas de palmera) que la hembra transporta insertadas en su obispillo.',
      it: 'Nido a cassetta chiusa in legno con apertura d\'ispezione (tipo inseparabili, circa 20 × 15 × 15 cm con foro d\'involo di 5 cm). Indispensabile fornire materiale fresco (rami di salice, foglie di palma) che la femmina trasporta infilato tra le penne del codrione.'
    },
    difficultyLevel: 'facile' // Reproduction accessible en élevage avicole
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique de graines pour petites perruches/inséparables (alpiste, millet blanc, millet rouge, avoine pelée, cardon, faible teneur en tournesol pour prévenir la stéatose hépatique) ou extrudés formulés de qualité.',
      en: 'Specific seed blend for small parrots/lovebirds (canary seed, white/red millet, groats, safflower, minimal sunflower seeds to prevent hepatic lipidosis) or quality formulated pellets.',
      ar: 'خليط بذور مخصص للطيور المعقوفة الصغيرة (فلارس، دخن أبيض وأحمر، شوفان مقشور، بذور القرطم، ونسبة ضئيلة من دوار الشمس لتفادي تشحم الكبد) أو حبيبات بيلت غذائية متوازنة.',
      es: 'Mezcla específica para pequeños psitácidos (alpiste, mijo blanco/rojo, avena, cártamo, mínimo girasol para evitar lipidosis hepática) o pienso extrusionado de calidad.',
      it: 'Miscela specifica per piccoli parrocchetti/inseparabili (scagliola, miglio bianco/rosso, avena decorticata, cartamo, minimo girasole per prevenire lipidosi epatica) o estrusi formulati di qualità.'
    },
    recommendedSupplements: {
      fr: 'Pâtée aux œufs fortifiée lors de la reproduction, os de seiche et bloc minéral permanents (apport en calcium vital), légumes verts frais (épinards, brocoli), carotte, pomme.',
      en: 'Eggfood during breeding, cuttlebone and mineral block at all times (vital calcium supply), fresh green leafy vegetables (spinach, broccoli), carrot, apple.',
      ar: 'باتيه البيض أثناء التكاثر، عظم الحبار وحجر الكالسيوم باستمرار (مصدر كالسيوم حيوي)، خضروات ورقية طازجة (سبانخ، بروكلي)، جزر، تفاح.',
      es: 'Pasta de cría fortificada en reproducción, jibia y bloque mineral constantes (calcio vital), verduras frescas (espinacas, brócoli), zanahoria, manzana.',
      it: 'Pastoncino all\'uovo durante la riproduzione, osso di seppia e blocco minerale sempre a disposizione (calcio indispensabile), verdure fresche a foglia, carota, mela.'
    },
    vitaminFrequency: {
      fr: 'Complexe vitaminique (A, D3, E) 1 à 2 fois par semaine en période de mue et de préparation des reproducteurs ; eau fraîche renouvelée quotidiennement.',
      en: 'Multivitamin complex (A, D3, E) 1-2 times weekly during moult and breeding preparation; fresh water renewed daily.',
      ar: 'فيتامينات متعددة (A, D3, E) مرة إلى مرتين أسبوعياً خلال تبديل الريش والاستعداد للتفريخ؛ ماء عذب يجدد يومياً.',
      es: 'Complejo vitamínico (A, D3, E) 1-2 veces por semana en muda y preparación a la cría; agua limpia renovada a diario.',
      it: 'Complesso multivitaminico (A, D3, E) 1-2 volte alla settimana durante la muta e preparazione alle cove; acqua fresca rinnovata quotidianamente.'
    },
    specificNeeds: {
      fr: 'Besoins accrus en calcium lors de la ponte pour éviter le mal de ponte. Matériaux végétaux frais riches en humidité (saule, noisetier) indispensables pour que la femelle régule l\'hygrométrie de la chambre de ponte.',
      en: 'Increased calcium requirements during oviposition to prevent egg binding. Fresh moisture-rich branches (willow, hazel) essential for female to regulate nest chamber humidity.',
      ar: 'احتياج متزايد للكالسيوم أثناء وضع البيض لتفادي احتباسه. أغصان نباتية طازجة غنية بالرطوبة (صفصاف، بندق) ضرورية لتنظيم رطوبة غرفة البيض.',
      es: 'Demanda aumentada de calcio durante la puesta para prevenir distocia. Ramas frescas con humedad (sauce) indispensables para que la hembra regule la humedad del nido.',
      it: 'Fabbisogno aumentato di calcio durante la deposizione per prevenire ritenzione dell\'uovo. Rami freschi (salice) indispensabili per consentire alla femmina di regolare l\'umidità della camera di cova.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Circovirose aviaire (PBFD)', 'Chlamydiose aviaire (psittacose)', 'Stéatose hépatique (surcharge en lipides/tournesol)', 'Rétention d\'œuf (distocie)', 'Picage chronique'],
      en: ['Psittacine Beak and Feather Disease (PBFD)', 'Avian Chlamydiosis (psittacosis)', 'Hepatic lipidosis (seed fat overload)', 'Egg binding (dystocia)', 'Feather plucking'],
      ar: ['مرض منقار وريش الببغاء (PBFD)', 'داء المتدثرات الطيري (الكلاميديا/حمى الببغاوات)', 'تشحم الكبد (بسبب بذور دوار الشمس)', 'احتباس البيض', 'افتراس ونتف الريش'],
      es: ['Enfermedad del pico y las plumas (PBFD)', 'Clamidiosis aviar (psitacosis)', 'Lipidosis hepática', 'Distocia (huevo retenido)', 'Picaje de plumas'],
      it: ['Malattia del becco e delle piume (PBFD)', 'Clamidiosi aviaria (psittacosi)', 'Lipidosi epatica', 'Ritenzione dell\'uovo (distocia)', 'Autodeplumazione / picaggio']
    },
    frequentParasites: {
      fr: ['Gale des pattes et du bec (Knemidokoptes pilae)', 'Poux rouges (Dermanyssus gallinae)', 'Coccidiose', 'Ascaridose intestinale'],
      en: ['Scaly leg and face mites (Knemidokoptes pilae)', 'Red mites (Dermanyssus gallinae)', 'Coccidiosis', 'Intestinal ascarids'],
      ar: ['جرب الأرجل والمنقار (كنيميدوكوبتيس)', 'الفاش الأحمر', 'الكوكسيديا', 'ديدان الأسكاريس المعوية'],
      es: ['Sarna del pico y patas (Knemidokoptes pilae)', 'Ácaro rojo', 'Coccidiosis', 'Áscaris intestinales'],
      it: ['Acariasi del becco e delle zampe (Knemidokoptes pilae)', 'Acaro rosso', 'Coccidiosi', 'Ascaridi intestinali']
    },
    sensitiveToCold: true,
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Dépistage PBFD / Chlamydiose conseillé à l\'introduction de tout nouvel oiseau. Quarantaine stricte de 30 jours. Éviter l\'excès de graines grasses. Nettoyage et désinfection minutieuse des perchoirs et nichoirs après chaque couvée.',
      en: 'Screening for PBFD and Chlamydiosis advised for any new bird. Strict 30-day quarantine. Limit high-fat seed intake. Thorough cleaning and disinfection of perches and nestboxes after each clutch.',
      ar: 'فحص مسبق لـ PBFD والكلاميديا عند إدخال طائر جديد. حجر صحي صارم لمدة 30 يوماً. تجنب الإفراط في البذور الدهنية. تنظيف وتعقيم المجاثم وصناديق التعشيش بعد كل تفريخ.',
      es: 'Control veterinario de PBFD y Clamidiosis en aves nuevas. Cuarentena de 30 días. Limitar grasas en la dieta. Desinfección estricta de posaderos y nidos tras cada nidada.',
      it: 'Screening preventivo PBFD e Clamidiosi per ogni nuovo soggetto. Quarantena rigorosa di 30 giorni. Limitare l\'apporto di grassi. Disinfezione accurata di posatoi e nidi dopo ogni covata.'
    }
  },
  management: {
    hybridizationPossible: true, // Hybridation possible avec d'autres espèces du genre Agapornis (personatus, fischeri), mais formellement déconseillée car produit des sujets stériles et pollue le patrimoine génétique
    compatibleSpecies: [], // Maintenir en couples isolés lors de la reproduction (agressivité intraspécifique et territoriale marquée chez roseicollis)
    breedingTips: {
      fr: 'Oiseau très territorial et au tempérament vigoureux : ne jamais loger deux couples dans la même cage de reproduction sous peine de combats violents et mutilations. Fournir quotidiennement du saule frais ou des branches non traitées pendant la confection du nid.',
      en: 'Strongly territorial species: never house two pairs in the same breeding cage due to risk of severe fighting and toe biting. Provide fresh pesticide-free willow or leafy branches daily during nest building.',
      ar: 'طائر إقليمي قوي الطبع: يمنع منعاً باتاً وضع زوجين في نفس قفص التزاوج لتفادي النزاعات العنيفة وبتر الأصابع. قدم أغصان الصفصاف الطازجة غير المعالجة يومياً أثناء بناء العش.',
      es: 'Especie fuertemente territorial: nunca alojar dos parejas en la misma jaula de cría para evitar peleas graves. Suministrar ramas frescas sin pesticidas a diario durante la construcción del nido.',
      it: 'Specie molto territoriale: non alloggiare mai due coppie nella stessa gabbia da riproduzione per evitare lotte cruente. Fornire quotidianamente salice fresco non trattato durante la costruzione del nido.'
    }
  },
  traceability: {
    source: 'Confédération Ornithologique Mondiale (C.O.M.) / Standards CDE & UOF Psittacidés / Dirk Van den Abeele (Agapornis - The Genus)',
    revisionDate: '2026-10-08',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique certifiée conforme aux standards avicoles internationaux (C.O.M. / UOF / BVA) pour Agapornis roseicollis. Bague officielle 4.5 mm, incubation moyenne 23 jours.',
      en: 'Certified biological sheet compliant with international avicultural standards (C.O.M. / UOF / BVA) for Agapornis roseicollis. Official band size 4.5 mm, average incubation 23 days.',
      ar: 'بطاقة بيولوجية معتمدة ومطابقة للمعايير الدولية لتربية الطيور (C.O.M. / UOF / BVA) لطائر الروزيكوليس. مقاس الحجل الرسمي 4.5 مم، ومتوسط الحضانة 23 يوماً.',
      es: 'Ficha biológica certificada según estándares internacionales (C.O.M. / UOF / BVA) para Agapornis roseicollis. Anilla oficial 4.5 mm, incubación media 23 días.',
      it: 'Scheda biologica certificata conforme agli standard avicoli internazionali (C.O.M. / UOF / BVA) per Agapornis roseicollis. Anello ufficiale 4.5 mm, incubazione media 23 giorni.'
    }
  }
};
