/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const COLOMBE_DIAMANT_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'colombe_diamant',
    code: 'COLO-DIA',
    scientificName: 'Geopelia cuneata',
    names: {
      fr: 'Colombe diamant',
      en: 'Diamond Dove',
      ar: 'حمامة الماس',
      es: 'Tortolita diamante',
      it: 'Colombina diamante'
    },
    family: 'Columbidae',
    genus: 'Geopelia',
    origin: {
      fr: 'Australie (zones arides et semi-arides de l\'intérieur, lisières de broussailles proches des points d\'eau)',
      en: 'Australia (inland arid and semi-arid scrublands near waterholes)',
      ar: 'أستراليا (المناطق الجافة وشبه الجافة الداخلية بالقرب من مصادر المياه)',
      es: 'Australia (zonas interiores áridas y semiáridas cerca de aguadas)',
      it: 'Australia (aree interne aride e semiaride in prossimità di specchi d\'acqua)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 10, // 8 à 12 ans en captivité
    averageLength: 20, // 19 à 21 cm (queue longue et graduée comprise)
    minWeight: 35, // Poids indicatif captivité / ex situ (35 à 45 g)
    maxWeight: 45,
    weightContexts: {
      in_situ: {
        context: 'in_situ',
        minWeight: 23,
        maxWeight: 37,
        averageWeight: 35,
        indicativeAverage: 35,
        label: {
          fr: 'Poids sauvage (in situ)',
          en: 'Wild weight (in situ)',
          ar: 'الوزن البري (in situ)',
          es: 'Peso silvestre (in situ)',
          it: 'Peso selvatico (in situ)'
        },
        notes: {
          fr: 'Poids sauvage / in situ : 23–37 g, moyenne indicative ~35 g (Frith 1982, HANZAB 1996). Ne pas fusionner avec les données de captivité.',
          en: 'Wild / in situ weight: 23–37 g, indicative mean ~35 g (Frith 1982, HANZAB 1996). Do not merge with captive data.',
          ar: 'الوزن في البرية: 23-37 غرام، متوسط تقريبي ~35 غرام.',
          es: 'Peso silvestre / in situ: 23–37 g, promedio indicativo ~35 g.',
          it: 'Peso selvatico / in situ: 23–37 g, media indicativa ~35 g.'
        }
      },
      ex_situ: {
        context: 'ex_situ',
        minWeight: 35,
        maxWeight: 45,
        label: {
          fr: 'Poids en captivité (ex situ)',
          en: 'Captive weight (ex situ)',
          ar: 'الوزن في الأسر (ex situ)',
          es: 'Peso en cautividad (ex situ)',
          it: 'Peso in cattività (ex situ)'
        },
        notes: {
          fr: 'Poids indicatif en captivité / ex situ : 35–45 g. Élevage domestique de sélection.',
          en: 'Indicative captive / ex situ weight: 35–45 g. Domestic aviary stock.',
          ar: 'الوزن النموذجي في الأسر: 35-45 غرام.',
          es: 'Peso indicativo en cautividad / ex situ: 35–45 g.',
          it: 'Peso indicativo in cattività / ex situ: 35–45 g.'
        }
      }
    },
    sexualDimorphism: {
      fr: 'Dimorphisme sexuel basé sur le cercle oculaire charnu périorbitale : chez le mâle adulte mature en période de reproduction, le cercle oculaire est épais (2-3 mm), charnu et d\'une teinte rouge corail vif à orangé éclatant. Chez la femelle, le cercle oculaire est plus mince, moins proéminent et de couleur rouge orangé pâle ou rosâtre. Le mâle parade activement en roucoulant, queue déployée en éventail dressée à la verticale.',
      en: 'Sexual dimorphism based on fleshy periophthalmic eye-ring: adult breeding males display a noticeably thicker (2-3 mm), fleshy, vivid coral-red to bright orange eye-ring. In females, the eye-ring is thinner, flatter, and paler orange-red or pinkish. Males perform distinctive courtship displays with deep cooing and fanned vertical tail feathers.',
      ar: 'مثنوية جنسية تظهر في حلقة العين اللحمية: يمتلك الذكر البالغ حلقة عين أكثر سماكة (2-3 مم) ولحمية ذات لون أحمر مرجاني زاهٍ أو برتقالي فاقع، بينما تكون حلقة العين لدى الأنثى أرق وأبهت لوناً. يقوم الذكر برقصة تودد مميزة مع خفض الرأس ورفع الذيل المروحي والهديل.',
      es: 'Dimorfismo sexual visible en el anillo ocular carnoso: el macho adulto reproductor exhibe un anillo periocular más grueso (2-3 mm), carnoso y de color rojo coral vivo o naranja brillante. En la hembra, el anillo es más fino y de tono naranja pálido o sonrosado. El macho realiza una corte nupcial con arrullo continuo y cola desplegada en abanico vertical.',
      it: 'Dimorfismo sessuale basato sull\'anello perioculare carnoso: il maschio adulto presenta un anello orbitale più spesso (2-3 mm), turgido e di colore rosso corallo vivo o arancio acceso. Nella femmina l\'anello è più sottile, piatto e di colore arancio pallido o rosato. Il maschio esegue una parata con inchini e coda aperta a ventaglio.'
    },
    sexualMaturity: {
      fr: 'Maturité physiologique atteinte dès 4 à 6 mois, mais la première reproduction doit être différée à 8-10 mois pour assurer une calcification optimale et prévenir les risques de rétention d\'œuf.',
      en: 'Physiologically fertile at 4-6 months, but first breeding should be delayed until 8-10 months to prevent egg-binding and ensure robust skeletal maturity.',
      ar: 'بلوغ جنسي فسيولوجي بين 4 و6 أشهر، ولكن يجب تأخير التزاوج الأول حتى 8-10 أشهر لضمان اكتمال نمو الهيكل العظمي وتفادي احتباس البيض.',
      es: 'Fértil desde los 4-6 meses, pero la reproducción debe aplazarse hasta los 8-10 meses para asegurar el desarrollo óseo y evitar distocias.',
      it: 'Fertile a 4-6 mesi, ma è consigliabile attendere gli 8-10 mesi per consentire il completo sviluppo osseo e prevenire ritenzioni d\'uovo.'
    },
    minAgeReproduction: 8,
    recommendedAgeReproduction: 10,
    maxAgeReproduction: 72 // 6 ans en reproduction active
  },
  reproduction: {
    breedingSeason: {
      fr: 'Printemps et été en captivité (avril à août), stimulée par un éclairage naturel prolongé (12 à 14 heures) et une température stabilisée au-dessus de 18°C.',
      en: 'Spring and summer in captivity (April to August), triggered by 12-14 hours of light and stable temperature above 18°C.',
      ar: 'الربيع والصيف في الأسر (أبريل إلى أغسطس)، ويحفزها طول النهار (12-14 ساعة إضاءة) واستقرار الحرارة فوق 18 درجة مئوية.',
      es: 'Primavera y verano en cautividad (abril a agosto), favorecida por 12-14 horas de luz y temperaturas superiores a 18°C.',
      it: 'Primavera ed estate in cattività (aprile-agosto), stimolata da 12-14 ore di luce e temperatura superiore a 18°C.'
    },
    incubationPeriod: 13, // 13 jours en moyenne (12 à 14 jours, couvaison partagée : mâle le jour, femelle la nuit)
    avgEggsPerClutch: 2, // Strictement 2 œufs blancs, caractéristique constante et immuable des Columbidés
    maxEggsPerClutch: 2, // Strictement 2 œufs (toute valeur supérieure est une anomalie biologique pour cette espèce)
    avgClutchesPerYear: 3, // 2 à 3 couvées par an recommandées pour ménager les géniteurs
    feedingPeriod: 14, // Pigeonneaux au nid durant 12 à 15 jours (quittent la soucoupe très précocement)
    bandingAge: 6, // Baguage entre le 5e et le 7e jour
    weaningAge: 28 // Sevrage complet et autonomie vers 28 jours
  },
  breeding: {
    bandSize: '3.5 mm (UOF / COM France) / 3.8 mm (CDE / Aviornis France International)',
    ringStandards: [
      {
        federationCode: 'UOF_COM_FRANCE',
        federationName: 'UOF / COM France',
        diameterMm: 3.5,
        label: '3.5 mm',
        notes: {
          fr: 'Standard officiel UOF / COM France (3,5 mm)',
          en: 'Official UOF / COM France standard (3.5 mm)',
          ar: 'المعيار الرسمي UOF / COM فرنسا (3.5 مم)',
          es: 'Estándar oficial UOF / COM Francia (3.5 mm)',
          it: 'Standard ufficiale UOF / COM Francia (3.5 mm)'
        }
      },
      {
        federationCode: 'CDE_AVIORNIS',
        federationName: 'CDE / Aviornis France International',
        diameterMm: 3.8,
        label: '3.8 mm',
        notes: {
          fr: 'Standard officiel CDE / Aviornis France International (3,8 mm)',
          en: 'Official CDE / Aviornis France International standard (3.8 mm)',
          ar: 'المعيار الرسمي CDE / Aviornis فرنسا الدولية (3.8 مم)',
          es: 'Estándar oficial CDE / Aviornis Francia Internacional (3.8 mm)',
          it: 'Standard ufficiale CDE / Aviornis Francia Internazionale (3.8 mm)'
        }
      }
    ],
    minIdealTemp: 15,
    maxIdealTemp: 26,
    minHumidity: 45,
    maxHumidity: 65,
    minCageSize: {
      fr: 'Cage spacieuse d\'au moins 80x40x50 cm pour un couple, ou idéalement petite volière (les colombes ont besoin d\'espace au sol pour marcher).',
      en: 'Spacious cage minimum 80x40x50 cm for a pair, or small aviary (doves need ample floor space for walking).',
      ar: 'قفص واسع لا يقل عن 80×40×50 سم للزوج، أو سلاكة صغيرة (تحتاج الحماميات لمساحة أرضية كافية للمشي).',
      es: 'Jaula espaciosa de al menos 80x40x50 cm para una pareja, o voladera pequeña con suelo despejado.',
      it: 'Gabbia spaziosa di almeno 80x40x50 cm per una coppia, o piccola voliera con fondo libero.'
    },
    nestType: {
      fr: 'Nid ouvert de type soucoupe ou corbeille peu profonde (diamètre 8-10 cm, rebord bas de 2-3 cm), solidement fixé en hauteur. Fond garni d\'un lit mince de fibres de coco ou de foin court (la colombe ne construit qu\'une plateforme rudimentaire).',
      en: 'Open shallow saucer or basket nest (8-10 cm diameter, 2-3 cm low rim), securely fastened in an elevated quiet corner. Lined with thin layer of coconut fiber or short hay (doves build rudimentary platforms).',
      ar: 'عش مفتوح على شكل صحن أو سلة ضحلة (قطر 8-10 سم، حافة بارتفاع 2-3 سم) مثبت بإحكام في زاوية هادئة، مبطن بألياف جوز هند أو قش قصير.',
      es: 'Nido abierto tipo platillo o canastilla poco profunda (diámetro 8-10 cm, borde de 2-3 cm), fijado firmemente en una esquina tranquila.',
      it: 'Nido aperto a piattello o cestino poco profondo (diametro 8-10 cm, bordo di 2-3 cm), saldamente ancorato in posizione elevata e tranquilla.'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique pour colombes exotiques et petits oiseaux exotiques (Millet blanc, millet rouge, alpiste, panis). Les graines sont avalées entières sans décorticage préalable.',
      en: 'Specific seed mix for exotic doves and small finches (White and red millet, canary seed, panicum). Seeds are swallowed whole without hulling.',
      ar: 'خلطة حبوب مخصصة للحماميات الصغيرة والطيور البرية (دخن أبيض وأحمر، فلارس، بانيس). تبتلع الحبوب كاملة دون تقشير.',
      es: 'Mezcla específica para tórtolas exóticas y pequeñas aves (Mijo blanco y rojo, alpiste, panizo). Las semillas se tragan enteras sin pelar.',
      it: 'Miscela specifica per tortore esotiche e piccoli granivori (Miglio bianco e rosso, scagliola, panico). I semi vengono ingeriti interi.'
    },
    recommendedSupplements: {
      fr: 'Grit marin fin et sable siliceux indispensables pour le broyage musculaire dans le gésier, os de seiche pulvérisé, verdure fraîche occasionnelle et pâtée d\'élevage fine en reproduction.',
      en: 'Fine mineral grit and insoluble sand essential for gizzard muscular grinding, cuttlebone powder, occasional fresh greens and fine eggfood during breeding.',
      ar: 'غريت بحري ناعم ورمل سيليسي ضروري لطحن الحبوب في القانصة، مسحوق عظم الحبار، خضار ورقية وباتيه بيض ناعم.',
      es: 'Grit fino y arena silícea indispensables para la digestión en la molleja, hueso de sepia triturado y pasta fina en cría.',
      it: 'Grit minerale fine e sabbia silicea indispensabili per il ventriglio, osso di seppia polverizzato e pastoncino fine.'
    },
    vitaminFrequency: {
      fr: '1 fois par semaine en entretien, 2 fois par semaine pendant la reproduction.',
      en: 'Once weekly for maintenance, twice weekly during breeding season.',
      ar: 'مرة واحدة أسبوعياً للصيانة، ومرتان أسبوعياً أثناء موسم التكاثر.',
      es: '1 vez por semana en mantenimiento, 2 veces par semana durante la reproducción.',
      it: '1 volta a settimana a riposo, 2 volte a settimana in riproduzione.'
    },
    specificNeeds: {
      fr: 'Apport impératif en grit insoluble pour compenser l\'ingestion des graines entières. Sensibilité marquée à l\'humidité du sol et aux courants d\'air froids.',
      en: 'Strict requirement for insoluble mineral grit to digest unhulled seeds. Marked sensitivity to damp cage floors and cold drafts.',
      ar: 'حاجة حيوية للغريت غير القابل للذوبان لهضم البذور غير المقشرة، مع حساسية شديدة لرطوبة الأرضيات والتيارات الهوائية الباردة.',
      es: 'Necesidad obligatoria de grit insoluble para digerir semillas enteras. Gran sensibilidad a la humedad del suelo y corrientes de aire.',
      it: 'Fabbisogno imperativo di grit insolubile per la digestione dei semi interi. Forte sensibilità all\'umidità del fondo gabbia e alle correnti fredde.'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Trichomonose (muguet du jabot)', 'Coccidiose', 'Coryza et infections respiratoires', 'Rétention d\'œuf (dystocie)', 'Ascaridiose intestinale'],
      en: ['Trichomoniasis (canker)', 'Coccidiosis', 'Coryza and respiratory infections', 'Egg binding (dystocia)', 'Intestinal roundworms'],
      ar: ['داء المشعرات (الكنكر)', 'الكوكسيديا', 'الزكام والالتهابات التنفسية', 'احتباس البيض', 'ديدان الأسكاريس المعوية'],
      es: ['Tricomoniasis (chancro)', 'Coccidiosis', 'Coriza e infecciones respiratorias', 'Retención de huevo (distocia)', 'Ascaridiosis intestinal'],
      it: ['Tricomoniasi (canchero)', 'Coccidiosi', 'Corizza e infezioni respiratorie', 'Ritenzione dell\'uovo', 'Ascaridiosi']
    },
    frequentParasites: {
      fr: ['Pou rouge (Dermanyssus gallinae)', 'Acariens des plumes', 'Vers intestinaux (Capillaria, Ascaridia)'],
      en: ['Red mite (Dermanyssus gallinae)', 'Feather mites', 'Intestinal worms (Capillaria, Ascaridia)'],
      ar: ['الفاش الأحمر (Dermanyssus gallinae)', 'عث الريش', 'الديدان المعوية'],
      es: ['Ácaro rojo (Dermanyssus gallinae)', 'Ácaros de las plumas', 'Lombrices intestinales'],
      it: ['Acaro rosso (Dermanyssus gallinae)', 'Acari delle piume', 'Vermi intestinali']
    },
    sensitiveToCold: true, // Sensible au froid vif et aux sols humides
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Garder le fond de cage parfaitement sec (la colombe passant beaucoup de temps au sol), désinfection semestrielle, vermifugation préventive annuelle.',
      en: 'Keep cage bottom strictly dry (doves spend considerable time on the floor), semi-annual disinfection, annual preventive deworming.',
      ar: 'الحفاظ على جفاف قاع القفص تماماً لقضاء الحمامة وقتاً طويلاً على الأرضية، تعقيم دوري، وطرد سنوي للديدان.',
      es: 'Mantener el fondo de la jaula seco y limpio, desinfección periódica y desparasitación anual.',
      it: 'Mantenere il fondo gabbia rigorosamente asciutto, disinfezione periodica e sverminazione preventiva.'
    }
  },
  management: {
    hybridizationPossible: false, // Genre Geopelia, aucune hybridation fertile documentée en aviculture domestique
    compatibleSpecies: ['canari', 'diamant_gould', 'diamant_mandarin'], // Pacifique en volière communautaire avec de petits passereaux
    breedingTips: {
      fr: 'Oiseau très calme et pacifique mais facilement effarouché. Fixer la soucoupe de nid dans un endroit tranquille et ne jamais la manipuler pendant l\'incubation sous peine d\'abandon immédiat de la ponte.',
      en: 'Gentle and peaceful species, but easily frightened. Secure the saucer nest in a quiet undisturbed spot and never move it during incubation to avoid abandonment.',
      ar: 'طائر هادئ ومسالم للغاية ولكنه سريع الفزع. ثبت صحن العش في مكان هادئ جداً وتجنب تحريكه أثناء الحضن منعاً لهجر البيض.',
      es: 'Ave muy pacífica pero asustadiza. Colocar el nido en una zona tranquila y no manipularlo durante la incubación para evitar abandonos.',
      it: 'Uccello docile e pacifico ma facilmente spaventabile. Posizionare il nido in un angolo quieto e non disturbarlo durante la cova per evitare abbandoni.'
    }
  },
  traceability: {
    source: 'Standards C.O.M. / UOF (3,5 mm) / CDE / Aviornis (3,8 mm) / Monographie Columbidae / Frith 1982 / HANZAB 1996 / Décision scientifique humaine GAP-10-E',
    revisionDate: '2026-10-21',
    validationStatus: 'draft',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique dédiée structurée (2 œufs, incubation 13j, nid soucoupe, bague multi-standard 3.5/3.8 mm, poids in situ 23-37g et ex situ 35-45g). Source bibliographique validée GAP-10-E sous statut draft avant clôture globale (HUMAN_REVIEW_REQUIRED).',
      en: 'Dedicated biological profile structured (2 eggs, 13d incubation, saucer nest, multi-standard band 3.5/3.8 mm, in situ weight 23-37g and ex situ 35-45g). Bibliographic source validated GAP-10-E in draft status pending global closure (HUMAN_REVIEW_REQUIRED).',
      ar: 'بطاقة بيولوجية مخصصة ومحدثة (بيضتان، حضن 13 يوماً، عش صحن، تحجيل متعدد المعايير 3.5/3.8 مم، وزن بيئي 23-37 غ ووزن أسري 35-45 غ).',
      es: 'Ficha biológica dedicada estructurada (2 huevos, incubación 13d, nido plato, anillado multi-estándar 3.5/3.8 mm, peso in situ 23-37g y ex situ 35-45g).',
      it: 'Scheda biologica dedicata strutturata (2 uova, incubazione 13gg, nido a piattello, inanellamento multi-standard 3.5/3.8 mm, peso in situ 23-37g ed ex situ 35-45g).'
    }
  }
};

export const COLOMBE_PROFILE = COLOMBE_DIAMANT_PROFILE;
