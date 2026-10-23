/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const CALOPSITTE_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'calopsitte',
    code: 'CALO-ELE',
    scientificName: 'Nymphicus hollandicus',
    names: {
      fr: 'Calopsitte élégante',
      en: 'Cockatiel',
      ar: 'كوكاتيل',
      es: 'Ninfa / Carolina',
      it: 'Calopsitta'
    },
    family: 'Cacatuidae',
    genus: 'Nymphicus',
    origin: {
      fr: 'Australie (intérieur des terres, savanes et zones semi-arides)',
      en: 'Australia (inland territories, savannas and semi-arid zones)',
      ar: 'أستراليا (المناطق الداخلية، السافانا والمناطق شبه القاحلة)',
      es: 'Australia (interior, sabanas y zonas semiáridas)',
      it: 'Australia (aree interne, savane e zone semiaride)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 18, // 15-20 ans en moyenne, jusqu'à 25 ans
    averageLength: 32, // 30-33 cm queue longue (~15 cm) et huppe érectile comprises
    minWeight: 80, // 75-85g type svelte, 90-110g type standard sélectionné
    maxWeight: 115,
    sexualDimorphism: {
      fr: 'Dimorphisme sexuel net en phénotype sauvage ancestral (gris) : le mâle adulte présente un masque facial jaune d\'or éclatant, des joues orange vif, une huppe jaune et le dessous de la queue gris anthracite uni sans zébrures. La femelle conserve un masque gris-jaunâtre terne, des joues orange pâle et des zébrures/stries transversales jaunes sous la queue et les rémiges. Le mâle est très vocal, siffle des mélodies et parade ailes écartées. (Attention : dimorphisme visuel altéré chez les mutations Lutino, Face Blanche et Panaché).',
      en: 'Distinct sexual dimorphism in wild-type grey plumage: adult male displays bright yellow facial mask, vivid orange cheek patches, yellow crest, and solid dark grey underside of tail feathers. Female retains dull greyish-yellow mask, paler orange cheeks, and distinct yellow barring under tail and wings. Males are vocal whistlers and court with heart-shaped wings. (Note: visual dimorphism altered in Lutino, Whiteface and Pied mutations).',
      ar: 'مثنوية جنسية واضحة في اللون الرمادي الأصلي: يمتلك الذكر البالغ قناع وجه أصفر ذهبي ساطع، خدود برتقالية متقدة، عرف أصفر، والسطح السفلي لريش الذيل رمادي داكن موحد دون تموجات. تحتفظ الأنثى بقناع رمادي مصفر باهت، خدود برتقالية فاتحة، وخطوط متموجة صفراء تحت الذيل والجناحين. الذكر يغرد ويصفر بقوة ويغازل. (تنبيه: يتغير التمايز البصري في طفرات اللوتينو، الوجه الأبيض والباناشيه).',
      es: 'Dimorfismo sexual claro en plumaje ancestral gris: el macho adulto luce máscara facial amarillo dorado vivo, mejillas naranja intenso, copete amarillo y parte inferior de la cola gris oscuro lisa. La hembra conserva máscara gris amarillenta apagada, mejillas pálidas y barrado transversal amarillo bajo la cola y alas. El macho silba melodías y corteja con alas en forma de corazón. (Nota: dimorfismo visual modificado en mutaciones Lutino, Carablanca y Arlequín).',
      it: 'Dimorfismo sessuale evidente nel fenotipo ancestrale grigio: il maschio adulto presenta maschera facciale giallo oro brillante, guance arancione vivo, ciuffo giallo e sottocoda grigio scuro uniforme senza barrature. La femmina mantiene maschera grigio-giallastra smorta, guance arancioni tenui e barrature trasversali gialle sotto coda e ali. I maschi fischiano melodie ed eseguono parate a cuore. (Nota: dimorfismo visivo alterato nelle mutazioni Lutino, Faccia Bianca e Pezzato).'
    },
    sexualMaturity: {
      fr: 'Physiologiquement fertile dès 9 à 12 mois, mais la première mise en reproduction doit impérativement être différée à 12-15 mois pour éviter les risques de ponte claire, d\'abandon de couvée et de rétention d\'œuf chez la jeune femelle.',
      en: 'Physiologically fertile from 9-12 months, but first breeding must strictly be delayed until 12-15 months to avoid clear eggs, nest abandonment and egg binding in young females.',
      ar: 'نضج جنسي فسيولوجي بين 9 و12 شهراً، ولكن يجب حتماً تأجيل التزاوج الأول حتى عمر 12-15 شهراً لتفادي البيض غير المخصب، هجر العش، واحتباس البيض لدى الإناث الفتية.',
      es: 'Fisiológicamente fértil a partir de los 9-12 meses, pero la primera puesta debe retrasarse obligatoriamente a los 12-15 meses para prevenir huevos hueros, abandono del nido y distocia en hembras jóvenes.',
      it: 'Fisiologicamente fertile a 9-12 mesi, ma la prima riproduzione deve essere tassativamente rinviata a 12-15 mesi per scongiurare uova chiare, abbandono della covata e ritenzione dell\'uovo nelle femmine giovani.'
    },
    minAgeReproduction: 12, // 1 an d'âge minimal absolu
    recommendedAgeReproduction: 15, // Recommandation pour la longévité et la maturité parentale
    maxAgeReproduction: 96 // 8 ans max en reproduction active
  },
  reproduction: {
    breedingSeason: {
      fr: 'Printemps et début d\'été (mars à juillet dans l\'hémisphère nord), déclenchée par un apport de 13 à 14 heures d\'éclairage et une température stabilisée > 18°C.',
      en: 'Spring and early summer (March to July in northern hemisphere), triggered by 13-14 hours of stable lighting and temperature > 18°C.',
      ar: 'الربيع وبداية الصيف (مارس إلى يوليو في النصف الشمالي)، ويحفزها 13 إلى 14 ساعة من الإضاءة المنتظمة ودرجة حرارة مستقرة أعلى من 18 درجة مئوية.',
      es: 'Primavera y principios de verano (marzo a julio en hemisferio norte), estimulada por 13-14 horas de luz y temperatura > 18°C.',
      it: 'Primavera e inizio estate (da marzo a luglio nell\'emisfero nord), stimolata da 13-14 ore di luce stabile e temperatura > 18°C.'
    },
    incubationPeriod: 19, // 18-21 jours (couvaison partagée : mâle durant la journée, femelle la nuit)
    avgEggsPerClutch: 5,
    maxEggsPerClutch: 7,
    avgClutchesPerYear: 2, // 2 pontes par an maximum recommandé pour la santé des reproducteurs
    feedingPeriod: 32, // Séjour au nid de 30 à 35 jours
    bandingAge: 9, // Baguage entre le 8e et le 10e jour
    weaningAge: 55 // Sevrage effectif et autonomie alimentaire entre 50 et 60 jours (7-8 semaines)
  },
  breeding: {
    bandSize: '5.5 mm', // Standard officiel obligatoire COM / UOF pour Nymphicus hollandicus
    minIdealTemp: 15,
    maxIdealTemp: 24,
    minHumidity: 50,
    maxHumidity: 70,
    minCageSize: {
      fr: 'Cage spacieuse de dimensions minimales 100x50x80 cm pour un couple, ou idéalement volière de vol (longueur 2 mètres).',
      en: 'Spacious flight cage minimum 100x50x80 cm for a pair, or ideally flight aviary (length 2 meters).',
      ar: 'قفص واسع بمقاسات لا تقل عن 100×50×80 سم للزوج، أو الأفضل سلاكة طيران بطول مترين.',
      es: 'Jaula espaciosa de dimensiones mínimas 100x50x80 cm para una pareja, o preferentemente voladera de vuelo (longitud 2 metros).',
      it: 'Gabbia spaziosa di almeno 100x50x80 cm per una coppia, o preferibilmente voliera da volo (lunghezza 2 metri).'
    },
    nestType: {
      fr: 'Nichoir boîte en bois fermé de type boîte aux lettres (base 22x22 cm ou 25x25 cm, hauteur 30-35 cm, trou d\'envol diamètre 6,5-7 cm). Fond concave avec litière de copeaux de bois dépoussiérés non traités (bannir la sciure fine et la coupelle ouverte de canari).',
      en: 'Enclosed wooden nestbox (base 22x22 cm or 25x25 cm, height 30-35 cm, entry hole diameter 6.5-7 cm). Concave bottom with untreated dust-free wood shavings (ban fine sawdust and open canary cup).',
      ar: 'صندوق تعشيش خشبي مغلق (قاعدة 22×22 سم أو 25×25 سم، ارتفاع 30-35 سم، فتحة دخول بقطر 6.5-7 سم). قاع مقعر مع نشارة خشب خشنة خالية من الغبار وغير معالجة (يمنع النشارة الناعمة أو الأعشاش المفتوحة).',
      es: 'Nido caja de madera cerrado (base 22x22 cm o 25x25 cm, altura 30-35 cm, orificio de entrada de 6,5-7 cm de diámetro). Fondo con concavidad y virutas de madera no tratadas sin polvo (nunca serrín fino ni nido abierto).',
      it: 'Nido a cassetta in legno chiuso (base 22x22 cm o 25x25 cm, altezza 30-35 cm, foro di ingresso diametro 6,5-7 cm). Fondo concavo con trucioli di legno depolverizzati non trattati (mai segatura fine né nido aperto da canarino).'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique pour grandes perruches composé d\'alpiste, de millets variés, d\'avoine pelée, de cardy et de sarrasin. Les graines de tournesol doivent être strictement limitées pour prévenir l\'obésité hépatique (lipidose).',
      en: 'Specific seed mix for cockatiels and small parrots consisting of canary seed, varied millets, groats, safflower, and buckwheat. Sunflower seeds must be strictly restricted to prevent hepatic lipidosis (fatty liver).',
      ar: 'خلطة حبوب مخصصة للببغاوات المتوسطة تتكون من الفلارس، الدخن المتنوع، الخرطال المقشر، القرطم، والحنطة السوداء. يجب تقنين بذور عباد الشمس بدقة لمنع تشحم الكبد.',
      es: 'Mezcla específica para ninfas compuesta por alpiste, mijos variados, avena pelada, cardo y trigo sarraceno. Las semillas de girasol deben estar estrictamente limitadas para prevenir la lipidosis hepática.',
      it: 'Miscela specifica per parrocchetti composta da scagliola, vari tipi di miglio, avena decorticata, cartamo e grano saraceno. I semi di girasole devono essere rigorosamente limitati per prevenire la steatosi epatica.'
    },
    recommendedSupplements: {
      fr: 'Légumes frais quotidiens (carotte râpée, brocoli, épinard), herbes sauvages (pissenlit), os de seiche, bloc minéral iodé, et pâtée d\'élevage aux œufs lors de la reproduction.',
      en: 'Daily fresh vegetables (grated carrot, broccoli, spinach), wild greens (dandelion), cuttlebone, mineral iodine block, and eggfood during breeding.',
      ar: 'خضار طازجة يومياً (جزر مبشور، بروكلي، سبانخ)، أعشاب برية (الهندباء)، عظم الحبار، حجر المعادن واليود، وباتيه البيض أثناء موسم التكاثر.',
      es: 'Verduras frescas diarias (zanahoria rallada, brócoli, espinacas), hierbas silvestres (diente de león), hueso de sepia, bloque mineral de yodo y pasta al huevo en cría.',
      it: 'Verdure fresche quotidiane (carota grattugiata, broccoli, spinaci), erbe prative (dente di leone), osso di seppia, blocco minerale iodato e pastoncino all\'uovo in cova.'
    },
    vitaminFrequency: {
      fr: 'Vitamines A, D3 et E distribuées une fois par semaine en entretien, deux fois par semaine en période de reproduction.',
      en: 'Vitamins A, D3 and E administered once weekly for maintenance, twice weekly during breeding season.',
      ar: 'فيتامينات A و D3 و E تعطى مرة أسبوعياً للحفاظ على النشاط، ومرتين أسبوعياً خلال موسم التفريخ.',
      es: 'Vitaminas A, D3 y E administradas una vez por semana en mantenimiento, dos veces por semana durante la reproducción.',
      it: 'Vitamine A, D3 ed E somministrate una volta a settimana a riposo, due volte a settimana durante la riproduzione.'
    },
    specificNeeds: {
      fr: 'Apport essentiel en calcium et exposition à la lumière naturelle (UVB) pour synthétiser la vitamine D3 et prévenir la rétention d\'œuf chez la femelle. Toxicité mortelle immédiate : vapeurs de poêles antiadhésives en Téflon (PTFE).',
      en: 'Crucial requirement for bioavailable calcium and natural light (UVB) for vitamin D3 synthesis to prevent egg binding. Lethal hazard: overheated non-stick cookware fumes (PTFE/Teflon).',
      ar: 'احتياج أساسي للكالسيوم والتعرض للضوء الطبيعي (UVB) لتخليق فيتامين D3 وتفادي احتباس البيض. تحذير قاتل: أبخرة مقالي التيفلون الساخنة (PTFE) تسبب التسمم الفوري للرئتين.',
      es: 'Aporte indispensable de calcio y luz natural (UVB) para sintetizar vitamina D3 y prevenir distocias. Peligro letal instantáneo: humos de sartenes antiadherentes de Teflón (PTFE).',
      it: 'Fabbisogno cruciale di calcio e luce naturale (UVB) per la sintesi della vitamina D3 e la prevenzione della ritenzione dell\'uovo. Pericolo letale immediato: vapori di padelle antiaderenti in Teflon (PTFE).'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Chlamydiose (psittacose)', 'Rétention d\'œuf (dystocie)', 'Candidose du jabot', 'Aspergillose respiratoire', 'Lipidose hépatique'],
      en: ['Chlamydiosis (psittacosis)', 'Egg binding (dystocia)', 'Crop candidiasis', 'Respiratory aspergillosis', 'Hepatic lipidosis'],
      ar: ['الكلاميديا (داء الببغائية)', 'احتباس البيض', 'داء المبيضات في الحوصلة', 'داء الرشاشيات التنفسي', 'تشحم الكبد'],
      es: ['Clamidiosis (psitacosis)', 'Retención de huevo (distocia)', 'Candidiasis del buche', 'Aspergilosis respiratoria', 'Lipidosis hepática'],
      it: ['Clamidiosi (psittacosi)', 'Ritenzione dell\'uovo (distocia)', 'Candidosi del gozzo', 'Aspergillosi respiratoria', 'Lipidosi epatica']
    },
    frequentParasites: {
      fr: ['Gale du bec et des pattes (Knemidokoptes pilae)', 'Vers ronds intestinaux (Ascaridia)', 'Giardiase'],
      en: ['Scaly beak and leg mite (Knemidokoptes pilae)', 'Intestinal roundworms (Ascaridia)', 'Giardiasis'],
      ar: ['جرب المنقار والأرجل (Knemidokoptes pilae)', 'ديدان الأسكاريس المعوية', 'الجيارديا'],
      es: ['Sarna del pico y patas (Knemidokoptes pilae)', 'Lombrices intestinales (Ascaridia)', 'Giardiasis'],
      it: ['Scabbia del becco e delle zampe (Knemidokoptes pilae)', 'Ascaridi intestinali', 'Giardiasi']
    },
    sensitiveToCold: false, // Très résistante si abritée du vent direct et de l'humidité
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Aération permanente sans courants d\'air, bannissement absolu des émanations toxiques ménagères (Téflon, encens, aérosols), vermifugation annuelle conseillée.',
      en: 'Permanent ventilation without drafts, complete ban on toxic fumes (Teflon, incense, aerosols), annual deworming recommended.',
      ar: 'تهوية مستمرة دون تيارات هوائية، حظر تام للغازات المنزلية السامة (التيفلون، البخور، المعطرات)، وينصح بطرد الديدان سنوياً.',
      es: 'Ventilación constante sin corrientes de aire, exclusión total de vapores tóxicos (Teflón, aerosoles, incienso), desparasitación interna anual recomendada.',
      it: 'Ventilazione costante senza correnti d\'aria, divieto assoluto di esalazioni tossiche (Teflon, aerosol, incensi), sverminazione annuale consigliata.'
    }
  },
  management: {
    hybridizationPossible: false, // Genre monotypique Nymphicus sans hybridation fertile documentée
    compatibleSpecies: [],
    breedingTips: {
      fr: 'Oiseau monogame et fidèle. Les parents participent tous deux activement à la couvaison et au nourrissage des petits. Éviter d\'inspecter le nid de façon intempestive lors de l\'éclosion pour ne pas affoler les géniteurs.',
      en: 'Strictly monogamous species. Both parents share incubation and chick rearing duties. Avoid excessive nestbox inspections around hatching time to prevent stressing parents.',
      ar: 'طائر أحادي التزاوج ومخلص لشريكه. يتشارك الأبوان بانتظام في حضن البيض وإطعام الفراخ. تجنب فحص العش المتكرر أثناء الفقس لتفادي إفزاع الأبوين.',
      es: 'Ave monógama fiel. Ambos progenitores comparten la incubación y la alimentación de los pichones. Evitar inspecciones invasivas durante la eclosión para no alarmar a la pareja.',
      it: 'Specie rigorosamente monogama. Entrambi i genitori condividono la cova e l\'allevamento dei pulli. Evitare ispezioni invasive del nido durante la schiusa per non spaventare i riproduttori.'
    }
  },
  traceability: {
    source: 'Confédération Ornithologique Mondiale (C.O.M.) / Standards Psittacidés CDE & FFO / Forshaw (Parrots of the World)',
    revisionDate: '2026-10-08',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique certifiée conforme aux standards avicoles internationaux (C.O.M.) pour Nymphicus hollandicus.',
      en: 'Certified biological sheet compliant with international avicultural standards (C.O.M.) for Nymphicus hollandicus.',
      ar: 'بطاقة بيولوجية معتمدة ومتوافقة مع المعايير الدولية لتربية الببغاوات (C.O.M.) لطائر الكوكاتيل.',
      es: 'Ficha biológica certificada conforme a los estándares avícolas internacionales (C.O.M.) para Nymphicus hollandicus.',
      it: 'Scheda biologica certificata conforme agli standard avicoli internazionali (C.O.M.) per Nymphicus hollandicus.'
    }
  }
};
