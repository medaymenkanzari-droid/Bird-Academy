/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from './types';

export const DIAMANT_GOULD_PROFILE: BiologicalSpeciesProfile = {
  identity: {
    id: 'diamant_gould',
    code: 'DIAM-GOU',
    scientificName: 'Erythrura gouldiae',
    names: {
      fr: 'Diamant de Gould',
      en: 'Gouldian Finch',
      ar: 'حسون غولد / عصفور غولديان',
      es: 'Diamante de Gould',
      it: 'Diamante di Gould'
    },
    family: 'Estrildidae',
    genus: 'Erythrura',
    origin: {
      fr: 'Australie septentrionale (savanes herbeuses et zones boisées d\'eucalyptus du Kimberley, Territoire du Nord et Queensland)',
      en: 'Northern Australia (grassy savannas and eucalyptus woodlands of the Kimberley, Northern Territory and Queensland)',
      ar: 'شمال أستراليا (سافانا عشبية وغابات الأوكالبتوس في كيمبرلي والإقليم الشمالي وكوينزلاند)',
      es: 'Norte de Australia (sabanas herbáceas y bosques de eucaliptos de Kimberley, Territorio del Norte y Queensland)',
      it: 'Australia settentrionale (savane erbose e boschi di eucalipto del Kimberley, Territorio del Nord e Queensland)'
    },
    status: 'domestique'
  },
  biology: {
    lifespan: 7, // 5 à 8 ans en moyenne en captivité
    averageLength: 13, // 12-14 cm (13 cm en moyenne queue effilée comprise)
    minWeight: 14, // 13-15 g chez les individus sauvages, 15-20 g chez les oiseaux de sélection
    maxWeight: 20,
    sexualDimorphism: {
      fr: 'Dimorphisme sexuel visuel net en phénotype sauvage : le mâle adulte présente des couleurs vives et tranchées (poitrine violet pourpre intense, ventre jaune bouton-d\'or éclatant, collier bleu turquoise lumineux, filet caudal plus long). La femelle est plus terne (poitrine lilas/mauve pâle, ventre jaune plus clair, filet caudal court). Seul le mâle chante et parade en sautillant verticalement. (Attention : le dimorphisme de coloration corporelle peut être atténué chez certaines combinaisons de mutations de poitrine et de corps).',
      en: 'Distinct visual sexual dimorphism in wild phenotype: adult male exhibits vivid and saturated colors (rich deep purple breast, bright golden-yellow belly, radiant turquoise-blue neck band, longer central tail feathers). Female is distinctly duller (pale lilac/mauve breast, lighter yellow belly, shorter tail streamers). Only the male courts with vertical bouncing hops and sings. (Note: dimorphism can be muted in certain breast and body color mutations).',
      ar: 'مثنوية جنسية بصرية واضحة في الطراز البري الأصلي: يمتلك الذكر البالغ ألواناً ساطعة متباينة (صدر بنفسجي قرمزي داكن، بطن أصفر ذهبي متقد، طوق أزرق فيروزي مشع، وخيوط ذيل أطول). الأنثى أبهت بوضوح (صدر بنفسجي/ليلكي فاتح، بطن أصفر باهت، خيوط ذيل قصيرة). الذكر وحده يغرد ويغازل بالقفز العمودي. (تنبيه: قد تقل الفروق اللونية في بعض الطفرات المعدلة للون الصدر والجسم).',
      es: 'Dimorfismo sexual visual evidente en fenotipo ancestral: el macho adulto luce colores intensos y contrastados (pecho púrpura intenso, vientre amarillo vivo, collar azul turquesa brillante, filamentos caudales más largos). La hembra es claramente más apagada (pecho lila/malva pálido, vientre amarillo suave, filamentos caudales cortos). Solo el macho canta y corteja con saltos verticales. (Nota: el dimorfismo puede atenuarse en mutaciones de pecho y cuerpo).',
      it: 'Dimorfismo sessuale visivo evidente nel fenotipo ancestrale: il maschio adulto presenta colori vivaci e netti (petto viola intenso, ventre giallo dorato brillante, collare blu turchese acceso, filamenti caudali più lunghi). La femmina è notevolmente più spenta (petto lilla/malva chiaro, ventre giallo tenue, timoniere centrali corte). Solo il maschio canta ed esegue la parata a saltelli verticali. (Nota: il dimorfismo può attenuarsi in mutazioni di petto e corpo).'
    },
    sexualMaturity: {
      fr: 'Maturité physiologique vers 4 à 6 mois (après la première mue complète du plumage juvénile au plumage adulte), mais la mise en reproduction doit impérativement être différée à 10-12 mois pour garantir la solidité du squelette, prévenir le mal de ponte et éviter l\'abandon précoce des couvées.',
      en: 'Physiological maturity around 4-6 months (following juvenile post-juvenile moult), but breeding must strictly be delayed to 10-12 months to ensure skeletal strength, prevent egg binding, and avoid clutch abandonment.',
      ar: 'نضج فسيولوجي بين 4 و6 أشهر (عقب اكتمال غيار الريش من الطفولي إلى البالغ)، ولكن يجب حتماً تأخير التزاوج حتى عمر 10-12 شهراً لضمان صلابة الهيكل العظمي وتفادي احتباس البيض وهجر الأعشاش.',
      es: 'Madurez fisiológica a los 4-6 meses (tras la primera muda completa), pero la reproducción debe posponerse obligatoriamente hasta los 10-12 meses para asegurar la osificación y prevenir distocias.',
      it: 'Maturità fisiologica a 4-6 mesi (dopo la muta completa del piumaggio giovanile), ma la riproduzione deve essere rigorosamente rinviata a 10-12 mesi per assicurare robustezza ed evitare ritenzioni dell\'uovo.'
    },
    minAgeReproduction: 9, // Âge minimal absolu en mois
    recommendedAgeReproduction: 12, // Âge recommandé zootechnique et éthique
    maxAgeReproduction: 48 // 4 ans max en élevage de reproduction
  },
  reproduction: {
    breedingSeason: {
      fr: 'Période optimale d\'automne/hiver en captivité européenne ou printemps/été contrôlé (14 heures d\'éclairage régulier, température stabilisée > 20°C, hygrométrie 60-70%). Sensible aux baisses brutales de température.',
      en: 'Autumn/winter or controlled spring/summer in captivity (14 hours of stable photoperiod, temperature > 20°C, humidity 60-70%). Highly sensitive to sudden drops in temperature.',
      ar: 'فترة خريف/شتاء أو ربيع/صيف مهيأ ومراقب (14 ساعة إضاءة منتظمة، حرارة مستقرة أعلى من 20 مئوية، رطوبة 60-70%). حساس جداً لانخفاض درجات الحرارة المفاجئ.',
      es: 'Otoño/invierno o primavera/verano controlado (14 horas de luz regular, temperatura > 20°C, humedad 60-70%). Muy sensible a enfriamientos bruscos.',
      it: 'Autunno/inverno o primavera/estate controllata (14 ore di luce regolare, temperatura > 20°C, umidità 60-70%). Molto sensibile agli sbalzi termici.'
    },
    incubationPeriod: 14, // 14 jours (13-15 jours selon régularité de couvaison)
    avgEggsPerClutch: 5, // 4 à 8 œufs (moyenne 5-6 œufs)
    maxEggsPerClutch: 8,
    avgClutchesPerYear: 2, // Recommandé 2 couvées max par an pour préserver la femelle (3 maximum exceptionnel)
    feedingPeriod: 22, // Élevage au nid : 21 à 24 jours avant envol
    bandingAge: 7, // Bague fermée posée entre le 6e et 8e jour (optimal 7e jour)
    weaningAge: 40 // Sevrage alimentaire complet vers 38-45 jours (environ 6 semaines)
  },
  breeding: {
    bandSize: '2.5 mm', // Diamètre officiel réglementaire C.O.M. / UOF / CDE (2.5 mm, tolérance 2.7 mm pour souches lourdes)
    minIdealTemp: 20, // Espèce tropicale xérique exigeant une température minimale de 20°C en période de nidification
    maxIdealTemp: 28,
    minHumidity: 55,
    maxHumidity: 70, // Hygrométrie essentielle pour faciliter l'éclosion et le développement embryonnaire
    minCageSize: {
      fr: 'Cage de reproduction 70 × 40 × 40 cm minimum par couple ; volière intérieure tempérée recommandée pour le vol et la mue complète.',
      en: 'Breeding cage 70 × 40 × 40 cm minimum per pair; heated indoor flight aviary recommended for exercise and moult.',
      ar: 'قفص تزاوج 70 × 40 × 40 سم كحد أدنى لكل زوج؛ ومطير داخلي دافئ يوصى به للطيران وغيار الريش.',
      es: 'Jaula de cría 70 × 40 × 40 cm mínimo por pareja; voladera interior climatizada recomendada para vuelo y muda.',
      it: 'Gabbia cova 70 × 40 × 40 cm minimo per coppia; voliera interna riscaldata raccomandata per volo e muta.'
    },
    nestType: {
      fr: 'Nichoir boîte fermé ou semi-ouvert en bois (type boîte pour exotiques, env. 12 × 12 × 15 cm avec trou d\'envol de 3 à 4 cm et perchoir). Fournir des fibres douces (fibres de coco, herbes sèches, sisal) pour garnir la coupe interne.',
      en: 'Enclosed wooden nestbox (finch nestbox type, approx. 12 × 12 × 15 cm with 3-4 cm entrance hole). Provide clean soft fibers (coconut fiber, dried fine grass, sisal) for inner lining.',
      ar: 'صندوق عش خشبي مغلق أو شبه مفتوح مخصص للطيور الغريبة (حوالي 12 × 12 × 15 سم بفتحة 3-4 سم ومجثم). يجب توفير ألياف ناعمة (ألياف جوز الهند، أعشاب جافة، سيزال) لتبطين العش.',
      es: 'Caja nido de madera cerrada para exóticos (aprox. 12 × 12 × 15 cm con orificio de 3-4 cm). Suministrar fibras suaves (fibra de coco, hierbas secas) para el relleno interior.',
      it: 'Nido a cassetta chiusa in legno per esotici (circa 12 × 12 × 15 cm con foro di 3-4 cm). Fornire fibre morbide (fibra di cocco, fieno fine, sisal) per l\'imbottitura interna.'
    },
    difficultyLevel: 'difficile' // Espèce exigeante en température, stabilité et suivi de couvaison
  },
  nutrition: {
    mainDiet: {
      fr: 'Mélange de graines spécifique pour Diamants de Gould et exotiques d\'Australie (riche en alpiste 40-50%, millet blanc, millet japonais, panis, moha ; faible en matières grasses).',
      en: 'Specific seed blend for Gouldian finches and Australian estrildids (canary seed 40-50%, white millet, Japanese millet, panicum, foxtail millet; low fat content).',
      ar: 'خليط بذور خاص بعصافير الغولد والأستراليات (فلارس 40-50%، دخن أبيض، دخن ياباني، بانيكم، موها؛ قليل الدهون).',
      es: 'Mezcla específica para Diamantes de Gould y exóticos (alpiste 40-50%, mijo blanco, mijo japonés, panizo, moha; bajo en grasa).',
      it: 'Miscela specifica per Diamanti di Gould ed esotici (scagliola 40-50%, miglio bianco, miglio giapponese, panico, moha; povera di grassi).'
    },
    recommendedSupplements: {
      fr: 'Pâtée aux œufs sèche pour exotiques lors de la reproduction, grappes de millet des oiseaux suspendues, bloc minéral, os de seiche et grit fin indispensables pour la calcification des coquilles.',
      en: 'Dry eggfood for exotic finches during breeding, spray millet, mineral block, cuttlebone and fine insoluble grit essential for shell calcification.',
      ar: 'باتيه بيض جاف للطيور الغريبة أثناء التكاثر، عناقيد الدخن، حجر المعادن، عظم الحبار، وغريت ناعم ضروري لتكلس قشور البيض.',
      es: 'Pasta de cría seca para exóticos, mijo en rama, bloque mineral, jibia y grit fino indispensables para la cáscara del huevo.',
      it: 'Pastoncino secco per esotici durante la riproduzione, spighe di panico, blocco minerale, osso di seppia e grit fine indispensabili per la calcificazione del guscio.'
    },
    vitaminFrequency: {
      fr: 'Vitamines A, D3, E et acides aminés essentiels (méthionine, choline) 1 à 2 fois par semaine pendant la mue et la préparation des reproducteurs.',
      en: 'Vitamins A, D3, E and essential amino acids (methionine, choline) 1-2 times weekly during moult and breeding preparation.',
      ar: 'فيتامينات A, D3, E وأحماض أمينية أساسية (ميثيونين، كولين) مرة إلى مرتين أسبوعياً خلال مرحلة تبديل الريش وتجهيز الأزواج.',
      es: 'Vitaminas A, D3, E y aminoácidos esenciales (metionina, colina) 1-2 veces por semana en muda y preparación a la cría.',
      it: 'Vitamine A, D3, E e amminoacidi essenziali (metionina, colina) 1-2 volte alla settimana durante la muta e la preparazione alla cova.'
    },
    specificNeeds: {
      fr: 'Sensibilité extrême aux températures fraîches (< 18°C) et aux courants d\'air. La mue juvénile et la mue adulte demandent un apport calorique et protidique continu sans stress thermique pour éviter la mort par arrêt de mue (« french moult » ou blocage de mue).',
      en: 'Extreme sensitivity to cold temperatures (< 18°C) and drafts. Juvenile and adult moults require continuous caloric and protein support without thermal stress to prevent moult arrest.',
      ar: 'حساسية شديدة جداً لدرجات الحرارة المنخفضة (أقل من 18 مئوية) والتيارات الهوائية. تتطلب مرحلة تبديل ريش الفراخ والبالغين دعماً غذائياً وبروتينياً دون أي صدمات حرارية لتفادي توقف النمو أو احتباس الريش.',
      es: 'Sensibilidad extrema al frío (< 18°C) y a las corrientes de aire. La muda requiere aporte calórico y proteico constante sin estrés térmico para evitar bloqueos de muda.',
      it: 'Sensibilità estrema alle basse temperature (< 18°C) e alle correnti d\'aria. La muta richiede supporto calorico e proteico continuo senza stress termici per evitare blocchi della muta.'
    }
  },
  health: {
    frequentDiseases: {
      fr: [
        'Acariase respiratoire des sacs aériens (Sternostoma tracheacolum)',
        'Cochlosomose (Cochlosoma anatis - protozoose intestinale)',
        'Campylobactériose / Colibacillose des oisillons',
        'Blocage / anomalie de mue (stress thermique)',
        'Rétention d\'œuf (distocie liée au froid ou carence calcique)'
      ],
      en: [
        'Air sac mites (Sternostoma tracheacolum)',
        'Cochlosomosis (Cochlosoma anatis intestinal flagellate)',
        'Campylobacteriosis / Colibacillosis in chicks',
        'Moult arrest / abnormal moult (thermal stress)',
        'Egg binding (dystocia due to chill or calcium deficiency)'
      ],
      ar: [
        'عث الأكياس الهوائية والتنفسية (ستيرنوستوما تراكياكولوم)',
        'داء الكوخلوزوما (طفيليات معوية سوطية)',
        'عدوى الكامبيلوباكتر والإشريكية القولونية للفراخ',
        'احتباس وتوقف غيار الريش (إجهاد حراري)',
        'احتباس البيض (بسبب البرد أو نقص الكالسيوم)'
      ],
      es: [
        'Ácaros de los sacos aéreos (Sternostoma tracheacolum)',
        'Cochlosomiasis (Cochlosoma anatis protozoo intestinal)',
        'Campylobacteriosis / Colibacilosis en pichones',
        'Bloqueo de la muda (estrés térmico)',
        'Distocia (huevo retenido por frío o falta de calcio)'
      ],
      it: [
        'Acariasi respiratoria dei sacchi aerei (Sternostoma tracheacolum)',
        'Cochlosomiasi (Cochlosoma anatis protozoo intestinale)',
        'Campylobacteriosi / Colibacillosi nei pulli',
        'Blocco della muta (stress termico)',
        'Ritenzione dell\'uovo (da raffreddamento o ipocalcemia)'
      ]
    },
    frequentParasites: {
      fr: [
        'Acariens des sacs aériens (Sternostoma tracheacolum)',
        'Poux rouges (Dermanyssus gallinae)',
        'Coccidies (Isospora / Eimeria)',
        'Vers intestinaux (Ascaridia, Capillaria)'
      ],
      en: [
        'Air sac mites (Sternostoma tracheacolum)',
        'Red mites (Dermanyssus gallinae)',
        'Coccidia (Isospora / Eimeria)',
        'Intestinal worms (Ascaridia, Capillaria)'
      ],
      ar: [
        'عث الأكياس الهوائية',
        'الفاش الأحمر',
        'الكوكسيديا',
        'ديدان الأمعاء'
      ],
      es: [
        'Ácaros de los sacos aéreos',
        'Ácaro rojo',
        'Coccidios',
        'Lombrices intestinales'
      ],
      it: [
        'Acari dei sacchi aerei',
        'Acaro rosso',
        'Coccidi',
        'Vermi intestinali'
      ]
    },
    sensitiveToCold: true,
    sensitiveToHeat: false,
    preventionRecommendations: {
      fr: 'Maintien impératif à température tempérée (> 20°C). Traitement antiparasitaire préventif contre les acariens des sacs aériens (Ivermectine/Moxidectine spot-on selon prescription vétérinaire). Quarantaine stricte de 30 jours à l\'introduction de nouveaux oiseaux.',
      en: 'Strict temperature management (> 20°C). Preventive antiparasitic control against air sac mites (spot-on ivermectin/moxidectin under veterinary guidance). Strict 30-day quarantine for all new arrivals.',
      ar: 'الحفاظ الصارم على درجات حرارة معتدلة (أعلى من 20 مئوية). علاج وقائي ضد عث الأكياس الهوائية (إيفرمكتين أو موكسيدكتين موضعي بإشراف بيطري). حجر صحي لمدة 30 يوماً لأي طائر جديد.',
      es: 'Control estricto de temperatura (> 20°C). Desparasitación preventiva contra ácaros respiratorios (ivermectina tópica según pauta veterinaria). Cuarentena estricta de 30 días para ejemplares nuevos.',
      it: 'Controllo rigoroso della temperatura (> 20°C). Trattamento preventivo contro acari dei sacchi aerei (ivermectina spot-on su indicazione veterinaria). Quarantena di 30 giorni per ogni nuovo arrivo.'
    }
  },
  management: {
    hybridizationPossible: false, // Hybridation stérile et exceptionnelle avec d'autres Estrildidés (ex: Diamant quadri/mandarin), formellement déconseillée en élevage conservatoire
    compatibleSpecies: [],
    breedingTips: {
      fr: 'Ne jamais faire reproduire en dessous de 20°C. Les parents naturels bien préparés élèvent parfaitement leurs petits ; l\'usage systématique de Moineaux du Japon comme parents nourriciers doit être évité pour ne pas dénaturer l\'instinct parental naturel de la lignée.',
      en: 'Never breed below 20°C. Properly prepared natural parents rear their chicks successfully; avoid systematic use of Society Finches as foster parents to preserve natural parental instincts.',
      ar: 'يحظر التزاوج في درجات حرارة تقل عن 20 مئوية. الأزواج الطبيعية المجهزة جيداً تربي فراخها بنجاح؛ يفضل تجنب الاعتماد الدائم على الحسون الياباني (الموانو) كحواضن للحفاظ على غريزة الأمومة الطبيعية.',
      es: 'Nunca criar por debajo de 20°C. Las parejas naturales bien acondicionadas crían perfectamente a sus pichones; evitar el uso sistemático de nodrizas (isabelitas de Japón) para conservar el instinto maternal de la estirpe.',
      it: 'Non riprodurre mai sotto i 20°C. I genitori naturali ben preparati allevano perfettamente i pulli; evitare l\'uso sistematico di Passeri del Giappone come balie per non disperdere l\'istinto parentale naturale.'
    }
  },
  traceability: {
    source: 'Confédération Ornithologique Mondiale (C.O.M.) / Standards UOF & CDE Estrildidés / Pryke & Griffith (Ecology & Evolution)',
    revisionDate: '2026-10-08',
    validationStatus: 'verified',
    author: 'Comité Scientifique Bird Academy',
    disclaimer: {
      fr: 'Fiche biologique certifiée conforme aux standards avicoles internationaux (C.O.M. / UOF) pour Erythrura gouldiae. Bague officielle 2.5 mm, incubation moyenne 14 jours, thermophilie stricte.',
      en: 'Certified biological sheet compliant with international avicultural standards (C.O.M. / UOF) for Erythrura gouldiae. Official band size 2.5 mm, average incubation 14 days, strict thermophilia.',
      ar: 'بطاقة بيولوجية معتمدة ومطابقة للمعايير الدولية لتربية الطيور (C.O.M. / UOF) لطائر حسون غولد (Erythrura gouldiae). مقاس الحجل الرسمي 2.5 مم، ومتوسط الحضانة 14 يوماً.',
      es: 'Ficha biológica certificada según estándares internacionales (C.O.M. / UOF) para Erythrura gouldiae. Anilla oficial 2.5 mm, incubación media 14 días.',
      it: 'Scheda biologica certificata conforme agli standard avicoli internazionali (C.O.M. / UOF) per Erythrura gouldiae. Anello ufficiale 2.5 mm, incubazione media 14 giorni.'
    }
  }
};
