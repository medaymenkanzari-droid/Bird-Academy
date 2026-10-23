/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const PERRUCHE_ONDULEE_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'perruche_ondulee',
    code: 'PERR-OND',
    scientificName: 'Melopsittacus undulatus',
    names: {
      fr: 'Perruche ondulée',
      en: 'Budgerigar',
      ar: 'الدرة الأسترالية (الببغاء المموج)',
      es: 'Periquito común',
      it: 'Pappagallino ondulato'
    },
    family: 'Psittaculidae',
    genus: 'Melopsittacus',
    origin: {
      fr: 'Australie (régions intérieures arides et semi-arides, steppes et prairies)',
      en: 'Australia (arid and semi-arid inland regions, grasslands and savannas)',
      ar: 'أستراليا (المناطق الداخلية القاحلة وشبه القاحلة والمروج)',
      es: 'Australia (regiones interiores áridas y semiáridas, sabanas y praderas)',
      it: 'Australia (regioni interne aride e semiaride, praterie e savane)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 10, // 7 à 12 ans en moyenne en captivité, parfois jusqu'à 15 ans
    averageLength: 19, // 18-20 cm chez la standard, 22-25 cm chez l'ondulée anglaise/posture
    minWeight: 30, // Plage de poids adulte standard : 30-45 g ; ondulée anglaise de posture : 50-65 g
    maxWeight: 65,
    sexualDimorphism: {
      fr: 'Dimorphisme sexuel net par la couleur de la cire nasale chez l\'adulte (dès 6-8 mois) : la cire est bleu vif/outremer chez le mâle en condition de reproduction. Chez la femelle mature, la cire est beige clair, blanchâtre ou brun foncé croûteux en période de reproduction. Chez les jeunes, la cire est rose violacé pâle chez le mâle et bleuâtre pâle cerclée de blanc chez la femelle. Variétés documentées : Standard (30-45 g) et Anglaise de posture (50-65 g). (Note : chez certaines mutations comme Ino, Fallow et Panaché récessif, la cire du mâle adulte reste rose violacé).',
      en: 'Distinct sexual dimorphism through cere color in adult birds (from 6-8 months): cere is vivid royal blue in breeding males. In mature females, cere is pale beige, whitish, or dark crusty brown during breeding condition. Juveniles show pinkish-purple cere in males and pale chalky blue with white nostrils in females. Documented varieties: Standard (30-45 g) and English exhibition posture (50-65 g). (Note: in Ino, Fallow and Recessive Pied mutations, adult male cere remains fleshy pinkish-purple).',
      ar: 'مثنوية جنسية واضحة عبر لون القير الأنفي لدى البالغين (من 6-8 أشهر): يكون القير أزرق ساطعاً لدى الذكر البالغ الجاهز للتزاوج، بينما يكون بيج فاتحاً أو ضارباً للبياض أو بنياً غامقاً مجعداً لدى الأنثى في موسم التفريخ. الفراخ تملك قيراً وردياً ضارباً للبنفسجي لدى الذكور وزرقاوياً شاحباً بحواف بيضاء لدى الإناث. السلالات الموثقة: القياسية (30-45 غ) والإنجليزية الاستعراضية (50-65 غ).',
      es: 'Dimorfismo sexual claro por el color de la cera nasal en adultos (a partir de los 6-8 meses): la cera es azul intenso brillante en machos en celo. En hembras maduras, es beige claro, blanquecina o marrón oscuro rugoso en época de cría. En juveniles, la cera es rosa violáceo pálido en machos y azul pálido con halos blancos en hembras. Variedades documentadas: Estándar (30-45 g) e Inglesa de postura (50-65 g).',
      it: 'Dimorfismo sessuale evidente tramite il colore della cera nasale negli adulti (da 6-8 mesi): la cera è blu brillante uniforme nel maschio in riproduzione. Nelle femmine mature, è beige chiaro, biancastra o marrone rugosa in estro. Nei giovani la cera è rosa violacea pallida nel maschio e azzurrina pallida con anelli bianchi nella femmina. Varietà documentate: Standard (30-45 g) e Inglese di postura (50-65 g).'
    },
    sexualMaturity: {
      fr: 'Maturité physiologique atteinte dès 4 à 6 mois, mais la première mise en reproduction doit impérativement être différée à 10-12 mois pour prévenir la ponte claire, la rétention d\'œuf et l\'épuisement prématuré.',
      en: 'Physiologically mature from 4-6 months, but first breeding must strictly be delayed to 10-12 months to avoid clear eggs, egg binding and premature exhaustion.',
      ar: 'بلوغ فسيولوجي مبكر بين 4 و6 أشهر، ولكن يجب تأجيل التزاوج الأول إلى عمر 10-12 شهراً لتفادي البيض غير المخصب واحتباس البيض وإجهاد الإناث.',
      es: 'Madurez fisiológica desde los 4-6 meses, pero la primera cría debe posponerse obligatoriamente a los 10-12 meses para prevenir huevos hueros, distocia y desgaste temprano.',
      it: 'Maturità fisiologica raggiunta a 4-6 mesi, ma il primo accoppiamento deve tassativamente attendere i 10-12 mesi per prevenire uova chiare, ritenzione dell\'uovo e deperimento.'
    },
    minAgeReproduction: 10,
    recommendedAgeReproduction: 12,
    maxAgeReproduction: 72 // 6 ans en reproduction active
  },
  reproduction: {
    breedingSeason: {
      fr: 'Toute l\'année en captivité sous éclairage contrôlé (12-14 heures), période optimale au printemps (mars à juin) pour respecter les rythmes biologiques naturels.',
      en: 'Year-round in captivity under controlled light (12-14 hours), optimal season in spring (March to June) matching natural biological rhythms.',
      ar: 'طوال العام في الأسر تحت إضاءة منتظمة (12-14 ساعة)، والموسم المثالي هو الربيع (مارس إلى يونيو) لمراعاة الدورات البيولوجية الطبيعية.',
      es: 'Todo el año en cautividad con fotoperiodo controlado (12-14 horas), temporada óptima en primavera (marzo a junio) respetando los ciclos biológicos.',
      it: 'Tutto l\'anno in cattività con fotoperiodo controllato (12-14 ore), periodo ideale in primavera (marzo-giugno) per rispettare i ritmi biologici naturali.'
    },
    incubationPeriod: 18, // 18 jours (couvaison assurée exclusivement par la femelle nourrie au nid par le mâle)
    avgEggsPerClutch: 5,
    maxEggsPerClutch: 8,
    avgClutchesPerYear: 2, // 2 couvées par an maximum recommandé
    feedingPeriod: 30, // Séjour au nid de 30 à 35 jours
    bandingAge: 7, // Baguage entre le 6e et le 8e jour
    weaningAge: 35 // Sevrage effectif et autonomie alimentaire vers 35 jours
  },
  breeding: {
    bandSize: '4.0 mm', // 4.0 mm pour standard de couleur, 4.5 mm pour ondulée de posture anglaise (C.O.M. / UOF)
    minIdealTemp: 15,
    maxIdealTemp: 24,
    minHumidity: 50,
    maxHumidity: 70,
    minCageSize: {
      fr: 'Cage spacieuse de dimensions minimales 60x40x50 cm pour un couple, ou batterie de sélection avec perchoirs de diamètres variés.',
      en: 'Spacious cage minimum 60x40x50 cm for a pair, or breeding battery with varied-diameter perches.',
      ar: 'قفص واسع بمقاسات لا تقل عن 60×40×50 سم للزوج، أو بطارية تفريخ مجهزة بمجاثم ذات أقطار متنوعة.',
      es: 'Jaula espaciosa de dimensiones mínimas 60x40x50 cm para una pareja, o batería de cría con posaderos de diferentes diámetros.',
      it: 'Gabbia spaziosa di almeno 60x40x50 cm per una coppia, o batteria da riproduzione con posatoi a diametro variabile.'
    },
    nestType: {
      fr: 'Nichoir boîte en bois fermé (horizontal 20x15x15 cm ou vertical 15x15x25 cm, trou d\'envol diamètre 4,5-5 cm). Fond creusé d\'une cuvette concave pour caler les œufs sans matériaux de rembourrage (la perruche ondulée ne construit pas de nid).',
      en: 'Enclosed wooden nestbox (horizontal 20x15x15 cm or vertical 15x15x25 cm, entry hole 4.5-5 cm). Concave hollowed bottom to hold eggs without nesting material (budgerigars do not build nests).',
      ar: 'صندوق تعشيش خشبي مغلق (أفقي 20×15×15 سم أو عمودي 15×15×25 سم، فتحة دخول 4.5-5 سم). قاع مقعر لتثبيت البيض دون مواد تعشيش (الدرة لا تبني عشاً بالمواد).',
      es: 'Nido caja de madera cerrado (horizontal 20x15x15 cm o vertical 15x15x25 cm, orificio de entrada de 4,5-5 cm). Fondo con concavidad para los huevos sin material de relleno (el periquito no construye nido).',
      it: 'Nido a cassetta in legno chiuso (orizzontale 20x15x15 cm o verticale 15x15x25 cm, foro d\'ingresso 4,5-5 cm). Fondo con concavità scavata per alloggiare le uova senza imbottitura (l\'ondulato non costruisce nido).'
    },
    difficultyLevel: 'facile'
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange spécifique pour perruches ondulées (Millet jaune, blanc, rouge 65-70%, Alpiste 20-25%, Avoine pelée 5-10%).',
      en: 'Specific budgerigar seed mix (Yellow, white, red millet 65-70%, Canary seed 20-25%, Groats 5-10%).',
      ar: 'خلطة حبوب مخصصة للدرة الأسترالية (دخن أصفر، أبيض، أحمر 65-70٪، فلارس 20-25٪، خرطال مقشر 5-10٪).',
      es: 'Mezcla específica para periquitos (Mijo amarillo, blanco, rojo 65-70%, Alpiste 20-25%, Avena pelada 5-10%).',
      it: 'Miscela specifica per pappagallini ondulati (Miglio giallo, bianco, rosso 65-70%, Scagliola 20-25%, Avena decorticata 5-10%).'
    },
    recommendedSupplements: {
      fr: 'Pâtée aux œufs lors de la reproduction, os de seiche, bloc minéral iodé, légumes frais (carotte râpée, courgette, épinard) et herbes sauvages (mouron blanc, pissenlit).',
      en: 'Eggfood during breeding, cuttlebone, iodine mineral block, fresh vegetables (grated carrot, zucchini, spinach) and wild greens (chickweed, dandelion).',
      ar: 'باتيه البيض أثناء التفريخ، عظم الحبار، حجر المعادن واليود، خضار طازجة (جزر مبشور، كوسة، سبانخ) وأعشاب برية (حشيشة القزاز، الهندباء).',
      es: 'Pasta de cría al huevo, hueso de sepia, bloque mineral con yodo, verduras frescas (zanahoria rallada, calabacín, espinacas) y hierbas silvestres (pamplina, diente de león).',
      it: 'Pastoncino all\'uovo in riproduzione, osso di seppia, blocco minerale iodato, verdure fresche (carota grattugiata, zucchina, spinaci) ed erbe prative (centocchio, tarassaco).'
    },
    vitaminFrequency: {
      fr: '1 fois par semaine en entretien, 2 fois par semaine en période de reproduction et durant la mue.',
      en: 'Once weekly for maintenance, twice weekly during breeding and molt.',
      ar: 'مرة واحدة أسبوعياً للصيانة، ومرتان أسبوعياً خلال التزاوج وغيار الريش.',
      es: '1 vez por semana en mantenimiento, 2 veces por semana durante la cría y la muda.',
      it: '1 volta a settimana a riposo, 2 volte a settimana durante la cova e la muta.'
    },
    specificNeeds: {
      fr: 'Apport indispensable en iode pour la thyroïde (prévention du goître fréquent chez Melopsittacus) et calcium biodisponible pour la coquille des œufs. Toxicité mortelle immédiate : émanations de Téflon surchauffé (PTFE) et fumées toxiques.',
      en: 'Crucial requirement for iodine to support thyroid function (preventing budgerigar goiter) and bioavailable calcium for eggshell formation. Lethal hazard: overheated Teflon (PTFE) fumes and toxic aerosols.',
      ar: 'احتياج ضروري لليود لدعم الغدة الدرقية (الوقاية من تضخم الغدة الشائع لدى الببغاء المموج) وكالسيوم نشط لقشرة البيض. تحذير قاتل: أبخرة التيفلون الساخنة (PTFE).',
      es: 'Aporte indispensable de yodo para la tiroides (prevención del bocio frecuente en Melopsittacus) y calcio para la cáscara del huevo. Peligro letal instantáneo: humos de Teflón sobrecalentado (PTFE).',
      it: 'Fabbisogno indispensabile di iodio per la tiroide (prevenzione del gozzo frequente nell\'ondulato) e calcio biodisponibile per il guscio dell\'uovo. Rischio letale immediato: fumi di Teflon (PTFE).'
    }
  },
  health: {
    frequentDiseases: {
      fr: ['Gale du bec et des pattes (Knemidokoptes pilae)', 'Mégabactériose (Macrorhabdus ornithogaster)', 'PBFD (maladie du bec et des plumes)', 'Tumeurs (rénales, gonadiques, lipomes)', 'Goître thyroïdien (carence en iode)'],
      en: ['Scaly face and leg mite (Knemidokoptes pilae)', 'Megabacteriosis (Macrorhabdus ornithogaster)', 'PBFD (Psittacine Beak and Feather Disease)', 'Tumors (renal, testicular, lipomas)', 'Goiter (iodine deficiency)'],
      ar: ['جرب المنقار والأرجل (Knemidokoptes pilae)', 'الميغاباكتيريا (Macrorhabdus ornithogaster)', 'مرض منقار وريش الببغاء (PBFD)', 'الأورام (الكلوية، التناسلية، الشحمية)', 'تضخم الغدة الدرقية (نقص اليود)'],
      es: ['Sarna del pico y patas (Knemidokoptes pilae)', 'Megabacteriosis (Macrorhabdus ornithogaster)', 'PBFD (enfermedad del pico y las plumas)', 'Tumores (renales, gonadales, lipomas)', 'Bocio tiroideo (deficiencia de yodo)'],
      it: ['Scabbia del becco e delle zampe (Knemidokoptes pilae)', 'Megabatteriosi (Macrorhabdus ornithogaster)', 'PBFD (malattia del becco e delle piume)', 'Tumori (renali, gonadici, lipomi)', 'Gozzo tiroideo (carenza di iodio)']
    },
    frequentParasites: {
      fr: ['Acarien de la gale (Knemidokoptes)', 'Pou rouge (Dermanyssus gallinae)', 'Ascaris intestinaux'],
      en: ['Scaly face mite (Knemidokoptes)', 'Red mite (Dermanyssus gallinae)', 'Intestinal roundworms'],
      ar: ['عث الجرب (Knemidokoptes)', 'الفاش الأحمر (Dermanyssus gallinae)', 'ديدان الأسكاريس'],
      es: ['Ácaro de la sarna (Knemidokoptes)', 'Ácaro rojo (Dermanyssus gallinae)', 'Ascárides intestinales'],
      it: ['Acaro della scabbia (Knemidokoptes)', 'Acaro rosso (Dermanyssus gallinae)', 'Ascaridi intestinali']
    },
    sensitiveToCold: false,
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Hygiène hebdomadaire des perchoirs et tiroirs, complémentation iodée régulière, contrôle attentif de l\'état de la cire et du bec, quarantaine stricte.',
      en: 'Weekly cleaning of perches and trays, regular iodine supplementation, careful monitoring of cere and beak condition, strict quarantine.',
      ar: 'نظافة أسبوعية للمجاثم والأرضيات، تزويد منتظم باليود، مراقبة دقيقة لحالة القير والمنقار، وحجر صحي صارم للطيور الجديدة.',
      es: 'Limpieza semanal de posaderos y bandejas, suplementación regular de yodo, control visual de la cera y pico, cuarentena rigurosa.',
      it: 'Pulizia settimanale di posatoi e cassetti, integrazione regolare di iodio, controllo accurato della cera e del becco, quarantena rigorosa.'
    }
  },
  management: {
    hybridizationPossible: false, // Genre monotypique Melopsittacus, aucune hybridation fertile documentée
    compatibleSpecies: [],
    breedingTips: {
      fr: 'Oiseau très sociable et grégaire pouvant vivre en colonie, mais la reproduction de sélection donne de bien meilleurs résultats en cages individuelles de couple. Ne pas placer de paille, copeaux fins ou brindilles dans le nichoir car la femelle évacue tout matériau.',
      en: 'Highly social flock bird, but exhibition and color breeding yields far superior results in individual pair cages. Do not add straw or fine shavings in the nestbox as females typically discard all materials.',
      ar: 'طائر اجتماعي وسرب بامتياز، ولكن الإنتاج الاختياري يعطي نتائج أفضل بكثير في أقفاص فردية لكل زوج. لا تضع قشاً أو نشارة ناعمة داخل العش لأن الأنثى تتخلص من أي مواد تعشيش.',
      es: 'Ave gregaria y sociable, pero la cría selectiva ofrece resultados muy superiores en jaulas individuales de cría. No añadir paja o virutas al nido ya que la hembra expulsa cualquier material.',
      it: 'Uccello gregario e socievole, ma la riproduzione selettiva ottiene risultati nettamente migliori in gabbie singole da cova. Non inserire paglia o trucioli nel nido poiché la femmina espelle qualsiasi materiale.'
    }
  },
  traceability: {
    source: 'Confédération Ornithologique Mondiale (C.O.M.) / Standards Officiels FFO & CDE / Cooke et al. (2017) / Martin (2002)',
    revisionDate: '2026-10-20',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique certifiée conforme aux standards avicoles internationaux (C.O.M.) pour Melopsittacus undulatus.',
      en: 'Certified biological sheet compliant with international avicultural standards (C.O.M.) for Melopsittacus undulatus.',
      ar: 'بطاقة بيولوجية معتمدة ومتوافقة مع المعايير الدولية لتربية الطيور (C.O.M.) لطائر الدرة الأسترالية.',
      es: 'Ficha biológica certificada conforme a los estándares avícolas internacionales (C.O.M.) para Melopsittacus undulatus.',
      it: 'Scheda biologica certificata conforme agli standard avicoli internazionali (C.O.M.) per Melopsittacus undulatus.'
    }
  }
};

export const PERRUCHE_PROFILE = PERRUCHE_ONDULEE_PROFILE;
