/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — HELP & DOCUMENTATION MULTILINGUAL DATABASE
 * Target Languages: EN, AR, ES, IT (with FR as base reference)
 * Single Device V1.x Policy Enforced: 100% Offline, Local Storage, Manual Backup Transfer
 */

export interface DocItem {
  id: string;
  category: 'user' | 'admin' | 'biology' | 'faq';
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
}

export interface HelpDocUiLabels {
  searchPlaceholder: string;
  allCategory: string;
  userCategory: string;
  adminCategory: string;
  biologyCategory: string;
  faqCategory: string;
  noResults: string;
  selectDocPrompt: string;
  docIdPrefix: string;
}

export const HELP_DOC_UI_LABELS: Record<'fr' | 'en' | 'ar' | 'es' | 'it', HelpDocUiLabels> = {
  fr: {
    searchPlaceholder: 'Rechercher un guide, FAQ, glossaire...',
    allCategory: 'Tous',
    userCategory: 'Guide User',
    adminCategory: 'Admin',
    biologyCategory: 'Glossaire',
    faqCategory: 'FAQ',
    noResults: 'Aucun document ne correspond à votre recherche.',
    selectDocPrompt: "Sélectionnez un document d'aide",
    docIdPrefix: 'DOC-ID',
  },
  en: {
    searchPlaceholder: 'Search a guide, FAQ, glossary...',
    allCategory: 'All',
    userCategory: 'User Guide',
    adminCategory: 'Admin',
    biologyCategory: 'Glossary',
    faqCategory: 'FAQ',
    noResults: 'No documents match your search query.',
    selectDocPrompt: 'Select a help document to read',
    docIdPrefix: 'DOC-ID',
  },
  ar: {
    searchPlaceholder: 'البحث في الأدلة، الأسئلة الشائعة، المصطلحات...',
    allCategory: 'الكل',
    userCategory: 'دليل المستخدم',
    adminCategory: 'الإدارة',
    biologyCategory: 'المصطلحات',
    faqCategory: 'الأسئلة الشائعة',
    noResults: 'لم يتم العثور على أي مستند يطابق بحثك.',
    selectDocPrompt: 'اختر مستند مساعدة لعرضه',
    docIdPrefix: 'معرف-المستند',
  },
  es: {
    searchPlaceholder: 'Buscar guía, FAQ, glosario...',
    allCategory: 'Todos',
    userCategory: 'Guía Usuario',
    adminCategory: 'Admin',
    biologyCategory: 'Glosario',
    faqCategory: 'FAQ',
    noResults: 'No se encontraron documentos para su búsqueda.',
    selectDocPrompt: 'Seleccione un documento de ayuda',
    docIdPrefix: 'DOC-ID',
  },
  it: {
    searchPlaceholder: 'Cerca guida, FAQ, glossario...',
    allCategory: 'Tutti',
    userCategory: 'Guida Utente',
    adminCategory: 'Admin',
    biologyCategory: 'Glossario',
    faqCategory: 'FAQ',
    noResults: 'Nessun documento corrisponde alla ricerca.',
    selectDocPrompt: 'Seleziona un documento di aiuto',
    docIdPrefix: 'DOC-ID',
  },
};

export const HELP_DOC_TRANSLATIONS: Record<'en' | 'ar' | 'es' | 'it', DocItem[]> = {
  // =========================================================================
  // ENGLISH TRANSLATIONS (18 ARTICLES)
  // =========================================================================
  en: [
    {
      id: 'user-1',
      category: 'user',
      title: 'Bird Flock Management',
      subtitle: 'Register, band, and archive canaries or goldfinches',
      content: `To register a new bird in your flock:
1. Go to the Birds tab and click "Add".
2. Enter the identification band number. Bands must comply with official formats (e.g., FR-2026-N120).
3. Specify gender (Male, Female, or Undetermined if the chick is too young for sexing).
4. Enter breed (e.g., Gloster Fancy, Norwich, Lizard, European Goldfinch) and its color mutation profile.
5. Assign the bird to its housing cage to enable automatic occupancy rate calculation.`,
      tags: ['birds', 'band', 'gender', 'breed', 'flock', 'cage'],
    },
    {
      id: 'user-2',
      category: 'user',
      title: 'Mating & Egg Laying Cycles',
      subtitle: 'Calculate inbreeding and monitor clutch progress',
      content: `Follow these steps to form your breeding pairs:
1. Select a compatible male and female (avoid direct kinship to minimize Wright's coefficient).
2. Create the breeding pair in the application.
3. Record a new clutch as soon as the first egg is laid.
4. The application automatically calculates:
   - D+7: Egg candling alert to inspect fertility.
   - D+14: Estimated hatching alert.
   - D+30: Weaning alert to move juveniles to flight cages.`,
      tags: ['pair', 'clutch', 'incubation', 'candling', 'hatching', 'weaning'],
    },
    {
      id: 'user-quickstart',
      category: 'user',
      title: 'Quick Start Guide',
      subtitle: 'Get started with Bird Academy in under 2 minutes',
      content: `Welcome to Bird Academy v1.0 Gold Master! To get up and running quickly:
1. Set up your first Cage in the Cages/Habitats tab.
2. Add your first two founder birds (one Male, one Female) in the Birds tab.
3. Form a Pair in the Breeding tab. The system instantly evaluates genetic compatibility and calculates Wright's inbreeding coefficient.
4. Record a Clutch and let the nursery assistant calculate candling, hatch, and weaning dates.
5. Track your aviary's growth in the central Dashboard!`,
      tags: ['getting-started', 'quick', 'tutorial', 'beginner'],
    },
    {
      id: 'user-manual',
      category: 'user',
      title: 'End User Manual',
      subtitle: 'Comprehensive documentation of all application modules',
      content: `This manual details the complete operation of Bird Academy v1.0:

■ BIRDS MODULE: Complete digital identity for each bird (band, name, sex, breed, color, pedigree, attached documents, archive status).
■ HABITATS MODULE: Monitor aviary and cage occupancy. Prevents overcrowding and ensures hygienic conditions.
■ BREEDING & NURSERY: Scientific mating management. Day-by-day clutch monitoring, automated candling alerts, weaning, and hand-feeding logs (EAM).
■ HEALTH MODULE: Digital medical record. Track medications, vaccinations, symptoms, and quarantine protocols.
■ FINANCIAL LOG: Record aviary expenses (seeds, supplies) and revenues (sales), computing net profitability.
■ ANALYTICS: Multi-language statistical charts and key aviary performance indicators (KPIs).`,
      tags: ['manual', 'help', 'complete', 'modules', 'features'],
    },
    {
      id: 'admin-1',
      category: 'admin',
      title: '100% Local Architecture',
      subtitle: 'Why no external cloud database is required',
      content: `Bird Academy is an autonomous "offline-first" application. All data is saved directly on your local device via an indexed NoSQL engine based on secure local storage.
Key benefits:
- Zero reliance on an Internet connection: the application works seamlessly in remote or basement aviaries.
- Absolute confidentiality: no third party or cloud host has access to your pedigrees or sales records.`,
      tags: ['local', 'offline', 'storage', 'security', 'privacy'],
    },
    {
      id: 'admin-2',
      category: 'admin',
      title: 'Pro Export & Backup Restore',
      subtitle: 'Protecting your aviary records against hardware failures',
      content: `Regular backups are strongly recommended:
1. Open the Pro Import/Export tab.
2. Choose JSON or CSV format, or export a complete ZIP archive including media attachments.
3. To restore, upload your backup file. The application will simulate the restore, validate schema integrity (v1.4-Strict), and prompt for confirmation before updating your database.`,
      tags: ['backup', 'export', 'import', 'json', 'csv', 'zip', 'restore'],
    },
    {
      id: 'admin-install',
      category: 'admin',
      title: 'Multi-Platform Installation Guide',
      subtitle: 'Deployment across Windows, macOS, Linux, and mobile devices',
      content: `Bird Academy v1.0 installs easily on your devices:

■ MOBILE (Android & iOS):
- In Chrome or Safari, tap the installation banner "Add to Home Screen" or "Install App".
- The app installs to your home screen with storage isolated from standard browsing history.

■ DESKTOP (Windows, macOS & Linux):
- Run directly inside any modern web browser.
- For standalone desktop use, install as a desktop Progressive Web App (PWA) or launch the portable package.`,
      tags: ['installation', 'windows', 'macos', 'linux', 'android', 'ios', 'pwa'],
    },
    {
      id: 'admin-migrate',
      category: 'admin',
      title: 'Data Migration Guide',
      subtitle: 'Seamlessly transfer data from legacy versions or spreadsheets',
      content: `How to import or upgrade your data into Bird Academy:

■ FROM A COMPATIBLE BIRD BOX / JSON BACKUP:
1. Export JSON data from the previous instance.
2. In Bird Academy, go to "Pro Import/Export" and select the JSON file.
3. The automatic schema validator will check compatibility. If valid, import is completed in one click.

■ FROM MICROSOFT EXCEL / CSV FILES:
1. Prepare your CSV with standard columns (band, name, sex, breed).
2. Use the interactive column mapping assistant to align your headers with the application schema.
3. Validate integrity via the dry-run preview before committing changes.`,
      tags: ['migration', 'import', 'excel', 'csv', 'restore'],
    },
    {
      id: 'admin-license',
      category: 'admin',
      title: 'Software License & Legal Terms',
      subtitle: 'Licensing Terms & Commercial Usage Rights',
      content: `Bird Academy is distributed under the license terms applicable to your commercial offer.

Copyright © 2026 Bird Academy. All rights reserved.

Software usage is governed strictly by the rights granted under your edition (free native mode without license or single-device paid commercial license). Breeding records remain the exclusive private property of the breeder and are stored strictly on their local device. The application is provided "as is". All biological algorithms and Wright calculations have been verified against established scientific zootechnical standards.`,
      tags: ['license', 'legal-terms', 'proprietary', 'rights', 'copyright'],
    },
    {
      id: 'bio-1',
      category: 'biology',
      title: 'Wright Inbreeding Coefficient (COI)',
      subtitle: 'Understanding and optimizing the inbreeding coefficient F',
      content: `Wright's coefficient (COI - Coefficient of Inbreeding) measures the probability that two alleles at any locus in an individual are identical by descent from a common ancestor.
In aviculture:
- F = 0%: No known common ancestors in recorded pedigree.
- F < 6%: Mild inbreeding, generally safe to fix desired traits.
- F >= 12%: Critical inbreeding, high risk of embryonic mortality and congenital defects.
The application computes F in real-time across up to 4 ancestral generations before pair confirmation.`,
      tags: ['wright', 'inbreeding', 'genetics', 'ancestor', 'coi'],
    },
    {
      id: 'bio-2',
      category: 'biology',
      title: 'Lipochrome vs Melanin',
      subtitle: 'The two foundational pigment structures in plumage',
      content: `Canary plumage colors stem from two core pigment categories:
1. Lipochrome: Fat-based dietary pigment (yellow, red, or white ground color).
2. Melanin: Dark protein pigment synthesized organically (black, brown, oxidized, or diluted).
The application allows categorizing birds using these foundational filters to accurately forecast offspring mutation outcomes.`,
      tags: ['lipochrome', 'melanin', 'pigment', 'mutation', 'plumage'],
    },
    {
      id: 'faq-1',
      category: 'faq',
      title: 'How do I install the PWA on my mobile phone?',
      subtitle: 'Offline installation instructions for Android, iOS, and Desktop',
      content: `Because Bird Academy is a Progressive Web App (PWA):
- On Android / Chrome: Tap the installation banner at the top of the screen or open the menu and choose "Add to Home Screen".
- On iOS / Safari: Tap the Share icon (arrow pointing up) and select "Add to Home Screen".
Once installed, the application icon appears on your home screen and operates completely offline without network latency.`,
      tags: ['pwa', 'installation', 'mobile', 'android', 'ios', 'safari'],
    },
    {
      id: 'faq-2',
      category: 'faq',
      title: 'What happens if I clear my browser cache?',
      subtitle: 'Understanding local persistence and preventing accidental data loss',
      content: `If you execute an aggressive "Clear all browsing history and site data" in your browser, local storage data can be erased.
To prevent data loss:
1. Install the app in PWA mode (storage is persistent and OS-protected).
2. Regularly generate monthly JSON backup exports onto an external drive or USB stick.`,
      tags: ['cache', 'browser', 'loss', 'security', 'history'],
    },
    {
      id: 'faq-main',
      category: 'faq',
      title: 'Complete Frequently Asked Questions (FAQ)',
      subtitle: 'Common questions about aviary management and data storage',
      content: `Q: Are my aviary data shared with other breeders?
A: Absolutely not. The application is completely offline-first. No breeding data leaves your device.

Q: Is there automatic synchronization across multiple devices?
A: No. Bird Academy V1.x is a Single Device, Local-First application with zero automatic cloud synchronization. Your aviary records remain strictly on your machine. To transfer data to another PC, export a local JSON backup from Device A and import it manually on Device B.

Q: Is Wright's inbreeding calculation scientifically accurate?
A: Yes. The algorithm recursively resolves kinship across the entire pedigree tree up to 4th-generation common ancestors, in full compliance with Sewall Wright's genetic formulations.`,
      tags: ['faq', 'help', 'security', 'backup', 'wright'],
    },
    {
      id: 'faq-troubleshooting',
      category: 'faq',
      title: 'Troubleshooting & Problem Solving',
      subtitle: 'Step-by-step diagnostic guide for edge cases',
      content: `How to resolve the most common issues:

■ BACKUP RESTORE FAILURE:
- Cause: The backup JSON file was manually edited, causing its cryptographic SHA-256 signature to mismatch.
- Solution: Never alter exported .json files. Restore the original file or use the flexible CSV importer.

■ SLUGGISH ANALYTICS DISPLAY:
- Cause: Too many inactive birds or archived breeding records stored in memory.
- Solution: In "Pro Import/Export", run the Storage Optimizer and Unused Keys Cleaner to rebuild local indexes.

■ APPLICATION DOES NOT START (BLANK SCREEN):
- Cause: Corrupted local browser cache.
- Solution: Use the Recovery Console or click "Reset Application" in the PWA menu to reload a clean database schema.`,
      tags: ['troubleshooting', 'diagnostic', 'problem', 'error', 'restore'],
    },
    {
      id: 'release-v1',
      category: 'faq',
      title: 'Release Notes v1.0 Gold Master',
      subtitle: 'Key highlights and architecture of the stable production release',
      content: `We are proud to present Bird Academy v1.0 GM!

■ KEY METRICS:
- 100% Offline: Zero network latency.
- <2.0 seconds: Initial cold launch time.
- Heavy load tested: Optimized for over 10,000 birds.

■ HIGHLIGHT FEATURES:
- Cryptographic SHA-256 Backup Signature and Integrity Engine.
- Local Database Inspector with automatic index rebuilder.
- Complete Diagnostic Assistant with health check reports.
- Fully integrated documentation and self-contained FAQ for offline operation.`,
      tags: ['release', 'gold', 'master', 'production', 'version'],
    },
    {
      id: 'release-changelog',
      category: 'faq',
      title: 'Historical Change Log',
      subtitle: 'Chronological development progress from v0.1 to v1.0 GM',
      content: `■ v1.0.0-GM (Sprint 12): Official Code Freeze. Maximum memory optimization, instant rendering speed, SHA-256 backup seals, and Diagnostic Assistant.
■ v0.9.5-RC2 (Sprint 11): Finalized PWA offline compliance and desktop wrappers. 5-language localization (FR, EN, AR RTL, ES, IT).
■ v0.8.0-RC1 (Sprint 10): Hand-feeding logs (EAM), complete medical records, expense journal, and interactive genetic calculator.
■ v0.5.0-BETA (Sprints 5-9): Nursery workflow, Wright inbreeding engine, analytics bento-grids, and unified storage.
■ v0.1.0-ALPHA (Sprints 1-4): Platform foundation, bird records, cages, and core filters.`,
      tags: ['changelog', 'history', 'sprints', 'updates'],
    },
    {
      id: 'credits-team',
      category: 'faq',
      title: 'Credits & Engineering Team',
      subtitle: 'The team and contributors behind this ornithological platform',
      content: `The Bird Academy v1.0 Team:

■ SOFTWARE ARCHITECTURE & ENGINEERING:
- The Bird Academy software engineering team (React, TypeScript, and Embedded Local Systems expertise).

■ SCIENTIFIC & VETERINARY ADVISORS:
- Certified posture canary masters and avian geneticists specialized in kinship pedigree analysis.

■ SPECIAL THANKS:
- A heartfelt thank you to the 250 beta-testing breeders whose feedback across Sprints 1 through 11 helped shape this stable release.`,
      tags: ['credits', 'team', 'thanks', 'engineers'],
    },
  ],

  // =========================================================================
  // ARABIC TRANSLATIONS (18 ARTICLES — RTL COMPATIBLE)
  // =========================================================================
  ar: [
    {
      id: 'user-1',
      category: 'user',
      title: 'إدارة قطيع الطيور',
      subtitle: 'تسجيل وتحجيل وأرشفة طيور الكناري والحسون',
      content: `لتسجيل طائر جديد في قطيعك:
1. انتقل إلى تبويب الطيور وانقر على "إضافة".
2. أدخل رقم حلقة التحجيل الرسمية (مثال: FR-2026-N120).
3. حدد الجنس (ذكر، أنثى، أو غير محدد إذا كان الفرخ صغيراً جداً على التحديد).
4. حدد السلالة (مثل: جلوستر، يوركشاير، ليزرد، الحسون الأنيق) مع ملف الطفرات اللونية.
5. اربط الطائر بالقفص المخصص له ليتم حساب معدل الإشغال تلقائياً.`,
      tags: ['طيور', 'تحجيل', 'جنس', 'سلالة', 'قطيع', 'قفص'],
    },
    {
      id: 'user-2',
      category: 'user',
      title: 'التزاوج ودورات وضع البيض',
      subtitle: 'حساب قرابة الدم وتسجيل البيض ومتابعة التفريخ',
      content: `اتبع الخطوات التالية لتكوين أزواج التكاثر:
1. اختر ذكراً وأنثى متوافقين جينياً (تجنب القرابة المباشرة لتقليل معامل رايت).
2. أنشئ الزوج في التطبيق.
3. سجل بطن البيض الجديد فور وضع أول بيضة.
4. يحسب التطبيق تلقائياً:
   - اليوم +7: تنبيه فحص البيض بالضوء للتأكد من التخصيب.
   - اليوم +14: الموعد التقديري للفقس.
   - اليوم +30: تنبيه الفطام لنقل الفراخ إلى سلاكة الطيران.`,
      tags: ['زوج', 'وضع-البيض', 'حضن', 'فحص-الضوء', 'فقس', 'فطام'],
    },
    {
      id: 'user-quickstart',
      category: 'user',
      title: 'دليل البدء السريع',
      subtitle: 'ابدأ العمل على Bird Academy في دقيقتين فقط',
      content: `مرحباً بك في الإصدار الذهبي من Bird Academy! للبدء بسرعة:
1. أضف قفصك الأول من تبويب الأقفاص والموائل.
2. أضف أول طائرين مؤسسين (ذكر وأنثى) من تبويب الطيور.
3. شكّل زوجاً في تبويب التزاوج. سيقوم النظام فوراً بتقييم التوافق الوراثي وحساب معامل رايت.
4. سجل بطن البيض ودع المساعد الآلي يحسب مواعيد الفحص والفقس والفطام.
5. تابع نمو طيورك في لوحة التحكم المركزية!`,
      tags: ['بدء', 'سريع', 'تعليمي', 'مبتدئ'],
    },
    {
      id: 'user-manual',
      category: 'user',
      title: 'دليل المستخدم النهائي',
      subtitle: 'توثيق شامل لكافة وحدات ووظائف التطبيق',
      content: `يوضح هذا الدليل عمل تطبيق Bird Academy بالكامل:

■ وحدة الطيور: إدارة الهوية الرقمية الكاملة لكل طائر (الحلقة، الاسم، الجنس، السلالة، اللون، شجرة النسب، الوثائق، حالة الأرشفة).
■ وحدة الموائل: تتبع إشغال الأقفاص والسلاكات لتفادي الاكتظاظ وضمان بيئة صحية.
■ وحدة التكاثر والحضانة: إدارة التزاوج العلمي ومتابعة الأعشاش يوماً بيوم وتنبيهات الفطام والتأكيل اليدوي (EAM).
■ وحدة الصحة: السجل الصحي الرقمي وتتبع الأدوية واللقاحات وأعراض الأمراض وبروتوكولات الحجر الصحي.
■ السجل المالي: تسجيل مصاريف الحبوب والمستلزمات وإيرادات التنازل عن الطيور مع حساب صافي الربحية.
■ التحليلات والإحصائيات: رسوم بيانية ومؤشرات أداء دقيقة للقطيع.`,
      tags: ['دليل', 'مساعدة', 'شامل', 'وحدات', 'وظائف'],
    },
    {
      id: 'admin-1',
      category: 'admin',
      title: 'تشغيل محلي 100%',
      subtitle: 'لماذا لا توجد حاجة لقاعدة بيانات سحابية خارجية',
      content: `تطبيق Bird Academy مستقل تماماً ويعمل وفق مبدأ Offline-First. يتم حفظ كافة البيانات محلياً على جهازك عبر محرك قواعد بيانات NoSQL مفهرس وآمن.
المزايا الرئيسية:
- لا حاجة للاتصال بالإنترنت: يعمل التطبيق بكل كفاءة في المزارع أو الغرف المعزولة.
- خصوصية تامة: لا يستطيع أي طرف خارجي أو خادم سحابي الاطلاع على أنسابك أو سجلات مبيعاتك.`,
      tags: ['محلي', 'دون-إنترنت', 'تخزين', 'أمان', 'خصوصية'],
    },
    {
      id: 'admin-2',
      category: 'admin',
      title: 'التصدير الاحترافي واستعادة النسخ الاحتياطية',
      subtitle: 'حماية بيانات تربيتك من أعطال القرص الصلب',
      content: `يُنصح بشدة بإجراء نسخ احتياطي بانتظام:
1. افتح تبويب الاستيراد والتصدير الاحترافي.
2. اختر صيغة JSON أو CSV، أو صدّر أرشيف ZIP كاملاً يحتوي على صور ومرفقات الطيور.
3. للاستعادة، ارفع ملف النسخ الاحتياطي. سيقوم التطبيق بمحاكاة الاستعادة وفحص سلامة المخطط وطلب التأكيد قبل استبدال البيانات.`,
      tags: ['نسخ-احتياطي', 'تصدير', 'استيراد', 'json', 'csv', 'استعادة'],
    },
    {
      id: 'admin-install',
      category: 'admin',
      title: 'دليل التثبيت متعدد المنصات',
      subtitle: 'التشغيل على Windows وmacOS وLinux والهواتف الذكية',
      content: `يتم تثبيت Bird Academy بسهولة على كافة أجهزتك:

■ الهواتف والأجهزة اللوحية (Android وiOS):
- عبر متصفح Chrome أو Safari، اضغط على شريط "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".
- يظهر التطبيق في شاشة تطبيقاتك بمساحة تخزين مستقلة عن المتصفح.

■ أجهزة الكمبيوتر المكتبية (Windows وmacOS وLinux):
- يمكن استخدامه مباشرة عبر متصفح الويب المفضل لديك.
- للاستخدام المستقل كبرنامج مكتبي، ثبته كتطبيق ويب تقدمي (PWA) أو شغّل الحزمة المحمولة.`,
      tags: ['تثبيت', 'ويندوز', 'ماك', 'لينكس', 'أندرويد', 'آيفون', 'pwa'],
    },
    {
      id: 'admin-migrate',
      category: 'admin',
      title: 'دليل ترحيل البيانات',
      subtitle: 'نقل بياناتك بأمان من إصدار سابق أو جداول إكسل',
      content: `كيفية استيراد أو ترقية بياناتك إلى Bird Academy:

■ من نسخة احتياطية سابقة بتنسيق JSON:
1. صدّر ملف JSON من النسخة القديمة.
2. افتح "الاستيراد والتصدير"، وحدد ملف JSON.
3. يفحص المدقق التلقائي توافق المخطط، ثم يكتمل الاستيراد بنقرة واحدة.

■ من مستندات إكسل أو ملفات CSV:
1. جهز ملف CSV بالأعمدة الأساسية (الحلقة، الاسم، الجنس، السلالة).
2. استخدم معالج الربط التفاعلي لمطابقة العناوين مع حقول التطبيق.
3. تحقق من صحة البيانات عبر وضع المعاينة التجريبية قبل الحفظ النهائي.`,
      tags: ['ترحيل', 'استيراد', 'إكسل', 'csv', 'استعادة'],
    },
    {
      id: 'admin-license',
      category: 'admin',
      title: 'ترخيص البرنامج والإشعارات القانونية',
      subtitle: 'شروط الترخيص وحقوق الاستخدام التجاري',
      content: `يتم توزيع Bird Academy وفقاً لشروط الترخيص المطبقة على عرضك التجاري المعتمد.

حقوق النشر © 2026 Bird Academy. جميع الحقوق محفوظة.

يخضع استخدام البرنامج حصرياً للحقوق الممنوحة بموجب إصدارك (الوضع المجاني الأصلي بدون ترخيص أو الترخيص التجاري المدفوع لجهاز واحد). تظل بيانات التربية ملكية حصرية وخاصة للمربي ويتم تخزينها محلياً على جهازه فقط. يُقدم التطبيق "كما هو". تم التحقق من صحة كافة الخوارزميات البيولوجية وحسابات قرابة رايت وفقاً للمعايير العلمية المعتمدة في تربية الطيور.`,
      tags: ['ترخيص', 'إشعار-قانوني', 'ملكية', 'حقوق', 'حقوق-النشر'],
    },
    {
      id: 'bio-1',
      category: 'biology',
      title: 'معامل زواج الأقارب (معامل رايت)',
      subtitle: 'فهم وتحسين معامل قرابة الدم F لطيور التربية',
      content: `يقيس معامل رايت (COI - Coefficient of Inbreeding) احتمالية تطابق أليلين عند موقع جيني نتيجة انحدارهما من سلف مشترك.
في تربية الطيور:
- F = 0%: لا توجد قرابة دم معروفة بين الزوجين.
- F < 6%: قرابة خفيفة ومقبولة لتثبيت صفات معينة.
- F >= 12%: قرابة دم حرجة وخطيرة (خطر موت الأجنة وتشوهات وراثية).
يحسب التطبيق هذا المعامل في الوقت الفعلي عبر 4 أجيال قبل إتمام التزاوج.`,
      tags: ['رايت', 'قرابة-الدم', 'وراثة', 'أسلاف', 'coi'],
    },
    {
      id: 'bio-2',
      category: 'biology',
      title: 'الليبوكروم مقابل الميلانين',
      subtitle: 'الصبغتان الأساسيتان للون ريش الكناري',
      content: `تعتمد ألوان ريش الكناري على نوعين رئيسيين من الصبغات:
1. صبغة الليبوكروم: صبغة دهنية ذات منشأ غذائي (أصفر، أحمر، أو أبيض).
2. صبغة الميلانين: صبغة بروتينية داكنة يصنعها الطائر حيوياً (أسود، بني، مؤكسد أو مخفف).
يتيح لك التطبيق تصنيف طيورك بدقة وفق هذه الفلاتر لتوقع طفرات الفراخ الناتجة بدقة.`,
      tags: ['ليبوكروم', 'ميلانين', 'صبغة', 'طفرة', 'ريش'],
    },
    {
      id: 'faq-1',
      category: 'faq',
      title: 'كيف أقوم بتثبيت تطبيق PWA على هاتفي المحمول؟',
      subtitle: 'طريقة التثبيت دون إنترنت على أندرويد وآيفون والكمبيوتر',
      content: `بما أن Bird Academy تطبيق ويب تقدمي (PWA):
- على أندرويد / متصفح Chrome: اضغط على شريط التثبيت أعلى الشاشة أو من القائمة اختر "إضافة إلى الشاشة الرئيسية".
- على آيفون / Safari: اضغط على أيقونة المشاركة (السهم لأعلى) واختر "إضافة إلى الشاشة الرئيسية".
بعد التثبيت، تظهر الأيقونة بين تطبيقاتك ويعمل التطبيق بصورة كاملة دون الحاجة لشبكة الإنترنت.`,
      tags: ['pwa', 'تثبيت', 'هاتف', 'أندرويد', 'آيفون', 'سفاري'],
    },
    {
      id: 'faq-2',
      category: 'faq',
      title: 'ماذا يحدث إذا قمت بإفراغ ذاكرة التخزين المؤقت للمتصفح؟',
      subtitle: 'فهم استمرارية التخزين وتفادي الفقدان غير المقصود للبيانات',
      content: `إذا قمت بمسح شامل لبيانات التصفح وسجلات المواقع في المتصفح، فقد تُحذف بيانات التخزين المحلي.
لتجنب هذا الاحتمال:
1. استخدم التطبيق بوضع PWA المثبت (حيث يكون التخزين ثابتاً ومحمياً بنظام التشغيل).
2. احرص على أخذ نسخ احتياطية شهرية بصيغة JSON وحفظها على ذاكرة فلاش USB أو قرص خارجي.`,
      tags: ['كاش', 'متصفح', 'فقدان', 'أمان', 'سجل'],
    },
    {
      id: 'faq-main',
      category: 'faq',
      title: 'الأسئلة الشائعة الكاملة (FAQ)',
      subtitle: 'إجابات عن تخزين البيانات وإدارة التربية اليومية',
      content: `س: هل يتم مشاركة بيانات تربيتي مع مربين آخرين؟
ج: إطلاقاً. التطبيق محلي ومستقل بالكامل (offline-first). لا تغادر أي معلومة جهازك.

س: هل تتوفر مزامنة سحابية تلقائية بين عدة أجهزة؟
ج: لا. في الإصدار V1.x، التطبيق مصمم لجهاز واحد (Single Device)، ويعمل محلياً دون أي خوادم سحابية. لنقل بياناتك إلى جهاز آخر، صدّر ببساطة ملف نسخ احتياطي محلي JSON من الجهاز الأول واستورده يدوياً على الجهاز الجديد.

س: هل حساب معامل رايت لقرابة الدم دقيق علمياً؟
ج: نعم. تطبق الخوارزمية صيغ عالم الوراثة سيوول رايت بالرجوع إلى 4 أجيال كاملة من الأسلاف المشتركة.`,
      tags: ['أسئلة-شائعة', 'مساعدة', 'أمان', 'نسخ-احتياطي', 'رايت'],
    },
    {
      id: 'faq-troubleshooting',
      category: 'faq',
      title: 'استكشاف الأخطاء وإصلاحها وحلها',
      subtitle: 'دليل تشخيصي لحل المشكلات الشائعة خطوة بخطوة',
      content: `طرق التعامل مع الحالات الطارئة:

■ فشل استعادة ملف النسخ الاحتياطي:
- السبب: تم تعديل ملف JSON يدوياً مما أدى لاختلاف توقيعه الرقمي التشفيري SHA-256.
- الحل: لا تعدل أبداً ملفات .json المستخرجة، أو استخدم مستورد CSV المرن.

■ بطء في عرض التحليلات والإحصائيات:
- السبب: تراكم أعداد كبيرة من الطيور غير النشطة أو الأزواج القديمة في الذاكرة.
- الحل: من تبويب الاستيراد/التصدير، شغّل أداة "تحسين التخزين" لإعادة بناء الفهارس المحلية.

■ التطبيق لا يبدأ (شاشة بيضاء أو سوداء):
- السبب: تلف في ذاكرة التخزين المؤقت للمتصفح.
- الحل: استخدم وحدة الاسترداد أو انقر على "إعادة التعيين" من قائمة PWA لإعادة تحميل المخطط النظيف.`,
      tags: ['استكشاف-الأخطاء', 'تشخيص', 'مشكلة', 'خطأ', 'استعادة'],
    },
    {
      id: 'release-v1',
      category: 'faq',
      title: 'ملاحظات الإصدار v1.0 Gold Master',
      subtitle: 'أبرز مميزات وبنية الإصدار الإنتاجي المستقر',
      content: `يسعدنا تقديم الإصدار الذهبي v1.0 GM من Bird Academy!

■ أرقام بارزة:
- يعمل 100% دون إنترنت: انعدام تام لزمن استجابة الشبكة.
- فتح في أقل من ثانيتين: سرعة فائقة في الإقلاع الأولي.
- مصمم للأعداد الكبيرة: تم اختباره لقطعان تفوق 10,000 طائر.

■ مزايا رائدة:
- محرك توقيع وتشفير للنسخ الاحتياطية وفق معيار SHA-256.
- فاحص قواعد البيانات المحلي مع إعادة بناء الفهارس.
- مساعد تشخيصي شامل وتقارير صحية متقدمة.
- توثيق مدمج وأسئلة شائعة شاملة تعمل محلياً بالكامل.`,
      tags: ['إصدار', 'ذهبي', 'إنتاج', 'نسخة', 'مستقر'],
    },
    {
      id: 'release-changelog',
      category: 'faq',
      title: 'سجل التغييرات التاريخي',
      subtitle: 'تتبع مراحل التطوير من النسخة v0.1 إلى v1.0 GM',
      content: `■ v1.0.0-GM (المرحلة 12): تجميد الكود البرمجي الرسمي، تحسين استهلاك الذاكرة، تأمين النسخ الاحتياطية عبر SHA-256 وإضافة مساعد التشخيص.
■ v0.9.5-RC2 (المرحلة 11): إتمام التوافق الكامل مع PWA وتغليف سطح المكتب، وتوفير 5 لغات رسمية (العربية مع دعم RTL، الفرنسية، الإنجليزية، الإسبانية، الإيطالية).
■ v0.8.0-RC1 (المرحلة 10): دعم التأكيل اليدوي، السجل الطبي الشامل، إدارة الميزانية وحسابات الوراثة التفاعلية.
■ v0.5.0-BETA (المراحل 5-9): مسار الحضانة، محرك معامل رايت، الرسوم البيانية، ونظام التخزين المحلي الموحد.
■ v0.1.0-ALPHA (المراحل 1-4): البنية الأساسية، إدارة الطيور، الأقفاص والفلاتر الأولية.`,
      tags: ['سجل-التغييرات', 'تاريخ', 'مراحل', 'تطوير'],
    },
    {
      id: 'credits-team',
      category: 'faq',
      title: 'الشكر وفريق التطوير',
      subtitle: 'من جعلوا هذه المغامرة العلمية لعشاق الطيور حقيقة',
      content: `فريق عمل Bird Academy v1.0:

■ هندسة البرمجيات والتطوير التقني:
- فريق هندسة البرمجيات في Bird Academy (خبرة React وTypeScript والأنظمة المحلية المدمجة).

■ اللجنة العلمية والبيطرية:
- خبراء ومحكمو كناري معتمدون وبيولوجيون متخصصون في علم الأنساب والوراثة الطيرية.

■ شكر خاص:
- جزيل الشكر والامتنان لـ 250 مربياً من مختبري النسخ التجريبية الذين ساهمت ملاحظاتهم القيمة في صقل هذا الإصدار المتميز.`,
      tags: ['شكر', 'فريق', 'تقدير', 'مطورون'],
    },
  ],

  // =========================================================================
  // SPANISH TRANSLATIONS (18 ARTICLES)
  // =========================================================================
  es: [
    {
      id: 'user-1',
      category: 'user',
      title: 'Gestión del Plantel de Aves',
      subtitle: 'Registrar, anillar y archivar canarios o jilgueros',
      content: `Para registrar una nueva ave doméstica en su plantel:
1. Acceda a la pestaña Aves y haga clic en "Añadir".
2. Ingrese el número de anilla de identificación oficial (ej.: FR-2026-N120).
3. Especifique el sexo (Macho, Hembra, o Indeterminado si el pichón aún no puede sexarse).
4. Indique la raza (ej.: Gloster Fancy, Norwich, Lizard, Jilguero europeo) y su perfil de mutaciones.
5. Asigne el ave a su jaula para el cálculo automático de la densidad de ocupación.`,
      tags: ['aves', 'anilla', 'sexo', 'raza', 'plantel', 'jaula'],
    },
    {
      id: 'user-2',
      category: 'user',
      title: 'Apareamientos y Ciclos de Puesta',
      subtitle: 'Calcular consanguinidad y registrar huevos y cría',
      content: `Siga estos pasos para formar sus parejas reproductoras:
1. Seleccione un macho y una hembra compatibles (evite parentesco directo para minimizar el coeficiente de Wright).
2. Cree la pareja en la aplicación.
3. Registre una nueva puesta desde el primer huevo puesto.
4. La aplicación calcula automáticamente:
   - D+7: Alerta de ovoscopia para comprobar fertilidad.
   - D+14: Fecha estimada de eclosión.
   - D+30: Alerta de destete para separar a los pichones en voladera.`,
      tags: ['pareja', 'puesta', 'incubacion', 'ovoscopia', 'eclosion', 'destete'],
    },
    {
      id: 'user-quickstart',
      category: 'user',
      title: 'Guía de Inicio Rápido',
      subtitle: 'Comience a utilizar Bird Academy en menos de 2 minutos',
      content: `¡Bienvenido a Bird Academy v1.0 Gold Master! Pasos para comenzar rápidamente:
1. Configure su primera Jaula en la pestaña Jaulas/Hábitats.
2. Añada sus dos primeras aves fundadoras (un Macho y una Hembra) en la pestaña Aves.
3. Forme una Pareja en la pestaña Reproducción. El sistema evaluará al instante la compatibilidad genética y el coeficiente de Wright.
4. Registre una Puesta y deje que el asistente calcule las fechas de ovoscopia, eclosión y destete.
5. ¡Siga el crecimiento de su aviario desde el Panel de Control!`,
      tags: ['inicio', 'rapido', 'tutorial', 'principiante'],
    },
    {
      id: 'user-manual',
      category: 'user',
      title: 'Manual del Usuario Final',
      subtitle: 'Documentación completa de todos los módulos del sistema',
      content: `Este manual detalla el funcionamiento integral de Bird Academy v1.0:

■ MÓDULO AVES: Ficha de identidad digital completa de cada ejemplar (anilla, nombre, sexo, raza, color, árbol genealógico, documentos adjuntos, archivo).
■ MÓDULO HÁBITATS: Control de ocupación de jaulas y voladeras para evitar masificación.
■ MÓDULO REPRODUCCIÓN: Gestión de cría científica, seguimiento día a día de nidadas, alertas de destete y embuche a mano (EAM).
■ MÓDULO SALUD: Historial clínico digital, tratamientos, vacunas, síntomas y cuarentenas.
■ MÓDULO FINANZAS: Registro de gastos (semillas, material) e ingresos por cesiones, con cálculo de rentabilidad neta.
■ MÓDULO ANALÍTICAS: Gráficos e indicadores clave del plantel (KPIs).`,
      tags: ['manual', 'ayuda', 'completo', 'modulos', 'funciones'],
    },
    {
      id: 'admin-1',
      category: 'admin',
      title: 'Funcionamiento 100% Local',
      subtitle: 'Por qué no se requiere ninguna base de datos en la nube',
      content: `Bird Academy es un software autónomo "offline-first". Todos los datos se almacenan localmente en su dispositivo mediante un motor NoSQL indexado y seguro.
Ventajas clave:
- Cero dependencia de conexión a Internet: funciona plenamente en aviarios remotos o sótanos.
- Privacidad total: ningún tercero ni servidor externo tiene acceso a sus genealogías o ventas.`,
      tags: ['local', 'offline', 'almacenamiento', 'seguridad', 'privacidad'],
    },
    {
      id: 'admin-2',
      category: 'admin',
      title: 'Exportación Pro y Restauración de Copias',
      subtitle: 'Proteger los datos de su aviario frente a fallos de hardware',
      content: `Se recomienda realizar copias de seguridad de forma regular:
1. Acceda a la pestaña Importar/Exportar Pro.
2. Elija formato JSON o CSV, o descargue un archivo ZIP completo con fotos y archivos adjuntos.
3. Para restaurar, cargue su archivo de copia. El sistema ejecutará una simulación para validar la integridad del esquema antes de aplicar los cambios.`,
      tags: ['copia-seguridad', 'exportar', 'importar', 'json', 'csv', 'restaurar'],
    },
    {
      id: 'admin-install',
      category: 'admin',
      title: 'Guía de Instalación Multiplataforma',
      subtitle: 'Despliegue en Windows, macOS, Linux y dispositivos móviles',
      content: `Bird Academy v1.0 se instala fácilmente en sus equipos:

■ MÓVIL (Android e iOS):
- En Chrome o Safari, pulse el botón "Añadir a pantalla de inicio" o "Instalar aplicación".
- La app se instala en su pantalla con almacenamiento local aislado.

■ ESCRITORIO (Windows, macOS y Linux):
- Puede utilizarse en su navegador habitual.
- Para uso independiente sin ventanas de navegador, instálela como Progressive Web App (PWA) de escritorio o ejecute el paquete portable.`,
      tags: ['instalacion', 'windows', 'macos', 'linux', 'android', 'ios', 'pwa'],
    },
    {
      id: 'admin-migrate',
      category: 'admin',
      title: 'Guía de Migración de Datos',
      subtitle: 'Traslade fácilmente sus datos desde versiones anteriores o Excel',
      content: `Cómo importar o actualizar sus datos a Bird Academy:

■ DESDE UNA COPIA COMPATIBLE JSON:
1. Exporte el archivo JSON de su versión previa.
2. En Bird Academy, abra "Importar/Exportar Pro" y seleccione el archivo.
3. El validador verificará el esquema y la importación se completará con un solo clic.

■ DESDE DOCUMENTOS MICROSOFT EXCEL / CSV:
1. Prepare su archivo CSV con las columnas mínimas (anilla, nombre, sexo, raza).
2. Emplee el asistente interactivo de mapeo para enlazar sus encabezados con el esquema de la aplicación.
3. Compruebe la integridad mediante la previsualización antes de guardar definitivamente.`,
      tags: ['migracion', 'importar', 'excel', 'csv', 'restaurar'],
    },
    {
      id: 'admin-license',
      category: 'admin',
      title: 'Licencia de Software y Avisos Legales',
      subtitle: 'Términos de Licencia y Derechos de Uso Comercial',
      content: `Bird Academy se distribuye según los términos de licencia aplicables a su oferta comercial adquirida.

Copyright © 2026 Bird Academy. Todos los derechos reservados.

El uso del software se rige estrictamente por los derechos otorgados según su edición (modo nativo gratuito sin licencia o licencia comercial de pago monopuesto). Los datos del criadero son propiedad exclusiva del criador y se almacenan localmente en su propio dispositivo. La aplicación se suministra "tal cual". Todos los algoritmos biológicos y cálculos de consanguinidad de Wright han sido validados según las normativas científicas zootécnicas vigentes.`,
      tags: ['licencia', 'aviso-legal', 'propietario', 'derechos', 'copyright'],
    },
    {
      id: 'bio-1',
      category: 'biology',
      title: 'Coeficiente de Consanguinidad de Wright',
      subtitle: 'Comprensión y optimización del coeficiente genético F',
      content: `El coeficiente de Wright (COI) mide la probabilidad de que dos alelos en un mismo locus sean idénticos por descendencia de un antepasado común.
En la cría de aves:
- F = 0%: Sin parentesco conocido en el árbol genealógico.
- F < 6%: Consanguinidad leve, útil para fijar características deseables.
- F >= 12%: Consanguinidad crítica de alto riesgo (mortalidad embrionaria y defectos congénitos).
La aplicación calcula F en tiempo real analizando hasta 4 generaciones de ancestros antes de confirmar el apareamiento.`,
      tags: ['wright', 'consanguinidad', 'genetica', 'ancestro', 'coi'],
    },
    {
      id: 'bio-2',
      category: 'biology',
      title: 'Lipocromo vs Melanina',
      subtitle: 'Las dos estructuras pigmentarias básicas del plumaje',
      content: `Los colores del plumaje de los canarios se fundamentan en dos categorías pigmentarias:
1. Lipocromo: Pigmento graso de origen dietético (fondo amarillo, rojo o blanco).
2. Melanina: Pigmento oscuro sintetizado biológicamente por el ave (negro, marrón, oxidado o diluido).
La aplicación le permite clasificar ejemplares mediante estos filtros para predecir con exactitud los resultados de cruzamiento.`,
      tags: ['lipocromo', 'melanina', 'pigmento', 'mutacion', 'plumaje'],
    },
    {
      id: 'faq-1',
      category: 'faq',
      title: '¿Cómo instalar la aplicación PWA en el móvil?',
      subtitle: 'Guía de instalación fuera de línea para Android, iOS y Escritorio',
      content: `Dado que Bird Academy es una Progressive Web App (PWA):
- En Android / Chrome: Pulse el aviso superior de instalación o elija en el menú "Añadir a la pantalla de inicio".
- En iOS / Safari: Pulse el botón de compartir (flecha hacia arriba) y elija "Añadir a pantalla de inicio".
Una vez instalada, el icono de la aplicación se añade a su dispositivo y funciona de forma autónoma sin conexión a la red.`,
      tags: ['pwa', 'instalacion', 'movil', 'android', 'ios', 'safari'],
    },
    {
      id: 'faq-2',
      category: 'faq',
      title: '¿Qué sucede si limpio la caché de mi navegador?',
      subtitle: 'Comprender la persistencia local y evitar pérdidas de información',
      content: `Si utiliza la opción de "Borrar todo el historial y datos de sitios web" de forma agresiva en su navegador, los datos de almacenamiento local podrían borrarse.
Para evitarlo:
1. Instale la app en modo PWA (el almacenamiento está protegido por el sistema operativo).
2. Realice exportaciones periódicas de copias de seguridad en formato JSON hacia su ordenador o memoria USB.`,
      tags: ['cache', 'navegador', 'perdida', 'seguridad', 'historial'],
    },
    {
      id: 'faq-main',
      category: 'faq',
      title: 'Preguntas Frecuentes y Almacenamiento Local',
      subtitle: 'Respuestas a dudas sobre gestión de aviarios y privacidad',
      content: `P: ¿Se comparten los datos de mi criadero con otros usuarios?
R: En absoluto. La aplicación es completamente offline-first. Ningún dato sale de su dispositivo.

P: ¿Existe sincronización automática en la nube entre varios dispositivos?
R: No. Bird Academy V1.x es una aplicación monopuesto (Single Device), local y 100% fuera de línea sin sincronización en la nube. Sus registros se conservan únicamente en su equipo. Para transferir datos a otro equipo, exporte una copia local en JSON desde el Dispositivo A e impórtela manualmente en el Dispositivo B.

P: ¿El cálculo de consanguinidad de Wright es fiable?
R: Sí. El algoritmo explora recursivamente el árbol genealógico analizando ancestros comunes hasta la 4ª generación, conforme a las fórmulas científicas de Sewall Wright.`,
      tags: ['faq', 'ayuda', 'seguridad', 'copia-seguridad', 'wright'],
    },
    {
      id: 'faq-troubleshooting',
      category: 'faq',
      title: 'Resolución de Problemas y Diagnóstico',
      subtitle: 'Guía paso a paso para resolver incidencias habituales',
      content: `Cómo solucionar los incidentes más frecuentes:

■ FALLO AL RESTAURAR COPIA DE SEGURIDAD:
- Causa: El archivo JSON fue alterado manualmente y su firma SHA-256 no coincide.
- Solución: Nunca modifique los archivos .json exportados. Restaure el original o use el importador CSV.

■ LENTITUD EN EL PANEL DE ANALÍTICAS:
- Causa: Gran volumen de ejemplares inactivos o parejas históricas en memoria.
- Solución: En "Importar/Exportar Pro", ejecute el Optimizador de Almacenamiento para reconstruir índices.

■ LA APLICACIÓN NO INICIA (PANTALLA EN BLANCO):
- Causa: Corrupción en la caché local del navegador.
- Solución: Utilice la Consola de Recuperación o haga clic en "Restablecer" desde el menú PWA para cargar el esquema limpio.`,
      tags: ['diagnostico', 'problemas', 'error', 'restaurar'],
    },
    {
      id: 'release-v1',
      category: 'faq',
      title: 'Notas de la Versión v1.0 Gold Master',
      subtitle: 'Aspectos destacados de la versión de producción estable',
      content: `¡Presentamos la versión v1.0 GM de Bird Academy!

■ CIFRAS DESTACADAS:
- 100% Fuera de línea: Cero latencia de red.
- <2.0 segundos: Tiempo de arranque inicial.
- Rendimiento testado para planteles de más de 10.000 aves.

■ NOVEDADES PRINCIPALES:
- Sellado criptográfico de copias de seguridad mediante SHA-256.
- Inspector local de base de datos con regenerador de índices.
- Asistente de diagnósticos y generación de informes de salud.
- Guías y preguntas frecuentes integradas para funcionamiento autónomo.`,
      tags: ['release', 'gold', 'master', 'produccion', 'version'],
    },
    {
      id: 'release-changelog',
      category: 'faq',
      title: 'Registro Histórico de Cambios',
      subtitle: 'Evolución cronológica desde la v0.1 hasta la v1.0 GM',
      content: `■ v1.0.0-GM (Sprint 12): Cierre oficial de código, optimización de memoria, sellado SHA-256 de copias y Asistente Diagnóstico.
■ v0.9.5-RC2 (Sprint 11): Soporte PWA y empaquetado de escritorio. Localización completa en 5 idiomas (FR, EN, AR RTL, ES, IT).
■ v0.8.0-RC1 (Sprint 10): Embucha a mano (EAM), cartilla sanitaria digital, control presupuestario y calculadora genética interactiva.
■ v0.5.0-BETA (Sprints 5-9): Módulo de cría, cálculo de Wright, analíticas visuales y almacenamiento unificado.
■ v0.1.0-ALPHA (Sprints 1-4): Cimientos de la plataforma, fichas de aves y jaulas.`,
      tags: ['changelog', 'historial', 'sprints', 'cambios'],
    },
    {
      id: 'credits-team',
      category: 'faq',
      title: 'Créditos y Equipo de Desarrollo',
      subtitle: 'Quienes hicieron posible esta plataforma ornitológica',
      content: `El equipo de Bird Academy v1.0:

■ ARQUITECTURA Y DESARROLLO DE SOFTWARE:
- Equipo de ingeniería de Bird Academy (Especialistas en React, TypeScript y Sistemas Embebidos Locales).

■ COMITÉ CIENTÍFICO Y ASESORÍA VETERINARIA:
- Criadores expertos de canarios de postura y biólogos especialistas en genética aviar.

■ AGRADECIMIENTOS:
- Nuestro agradecimiento a los 250 criadores beta-testers cuya colaboración durante los Sprints 1 al 11 permitió consolidar esta edición estable.`,
      tags: ['creditos', 'equipo', 'agradecimientos', 'desarrolladores'],
    },
  ],

  // =========================================================================
  // ITALIAN TRANSLATIONS (18 ARTICLES)
  // =========================================================================
  it: [
    {
      id: 'user-1',
      category: 'user',
      title: 'Gestione del Patrimonio di Uccelli',
      subtitle: 'Registrare, inanellare e archiviare canarini o cardellini',
      content: `Per registrare un nuovo soggetto nel proprio allevamento:
1. Accedere alla scheda Uccelli e cliccare su "Aggiungi".
2. Inserire il codice dell'anellino di riconoscimento (es.: FR-2026-N120).
3. Specificare il sesso (Maschio, Femmina o Indeterminato se il nidiaceo è troppo giovane).
4. Indicare la razza (es.: Gloster Fancy, Norwich, Lizard, Cardellino europeo) e le relative mutazioni di colore.
5. Assegnare il volatile alla gabbia di residenza per il calcolo automatico della capienza.`,
      tags: ['uccelli', 'anellino', 'sesso', 'razza', 'allevamento', 'gabbia'],
    },
    {
      id: 'user-2',
      category: 'user',
      title: 'Accoppiamenti e Cicli di Deposizione',
      subtitle: 'Calcolare la consanguineità e monitorare le covate',
      content: `Seguire questi passaggi per comporre le coppie riproduttive:
1. Selezionare un maschio e una femmina compatibili (evitare parentela diretta per contenere il coefficiente di Wright).
2. Creare la coppia nell'applicazione.
3. Registrare una nuova deposizione fin dalla deposizione del primo uovo.
4. L'applicazione programma automaticamente:
   - G+7: Allerta speratura per verificare la fertilità delle uova.
   - G+14: Data prevista per la schiusa.
   - G+30: Allerta svezzamento per separare i novelli nella voliera di volo.`,
      tags: ['coppia', 'deposizione', 'incubazione', 'speratura', 'schiusa', 'svezzamento'],
    },
    {
      id: 'user-quickstart',
      category: 'user',
      title: 'Guida di Avvio Rapido',
      subtitle: 'Iniziare a usare Bird Academy in meno di 2 minuti',
      content: `Benvenuti in Bird Academy v1.0 Gold Master! Per iniziare rapidamente:
1. Configurare la prima Gabbia nella scheda Gabbie/Habitat.
2. Aggiungere i primi due soggetti fondatori (un Maschio e una Femmina) nella scheda Uccelli.
3. Formare una Coppia nella scheda Riproduzione. Il sistema calcola immediatamente la compatibilità genetica e il coefficiente di Wright.
4. Registrare una Deposizione e lasciare che l'assistente calcoli le date di speratura, schiusa e svezzamento.
5. Monitorare l'evoluzione dell'allevamento dalla Dashboard principale!`,
      tags: ['avvio', 'rapido', 'tutorial', 'principiante'],
    },
    {
      id: 'user-manual',
      category: 'user',
      title: "Manuale dell'Utente Finale",
      subtitle: 'Documentazione completa di tutti i moduli operativi',
      content: `Questo manuale illustra il funzionamento globale di Bird Academy v1.0:

■ MODULO UCCELLI: Scheda anagrafica digitale per ogni volatile (anellino, nome, sesso, razza, colore, albero genealogico, allegati, stato di archivio).
■ MODULO HABITAT: Controllo del tasso di occupazione di gabbie e voliere per evitare il sovraffollamento.
■ MODULO RIPRODUZIONE: Gestione dell'accoppiamento scientifico, monitoraggio giornaliero delle covate, allarmi svezzamento e imbecco manuale (EAM).
■ MODULO SALUTE: Cartella clinica digitale con monitoraggio terapie, vaccini, sintomi e quarantene.
■ MODULO FINANZE: Registro spese (semi, attrezzature) e ricavi da cessione con calcolo della redditività netta.
■ MODULO ANALYTICS: Grafici statistici e indicatori prestazionali chiave (KPI).`,
      tags: ['manuale', 'aiuto', 'completo', 'moduli', 'funzioni'],
    },
    {
      id: 'admin-1',
      category: 'admin',
      title: 'Funzionamento 100% Locale',
      subtitle: 'Perché non è richiesto alcun database cloud esterno',
      content: `Bird Academy è un software autonomo con architettura "offline-first". Tutti i dati vengono memorizzati localmente sul dispositivo mediante un motore NoSQL indicizzato e protetto.
Vantaggi chiave:
- Indipendenza totale dalla rete Internet: funziona perfettamente in cantine, garage o voliere isolate.
- Riservatezza assoluta: nessun provider esterno o cloud ha accesso ai vostri alberi genealogici o registri di vendita.`,
      tags: ['locale', 'offline', 'archiviazione', 'sicurezza', 'privacy'],
    },
    {
      id: 'admin-2',
      category: 'admin',
      title: 'Esportazione Pro e Ripristino Backup',
      subtitle: 'Proteggere i dati dell allevamento dai guasti hardware',
      content: `Si raccomanda di effettuare backup con frequenza regolare:
1. Aprire la scheda Import/Export Pro.
2. Scegliere il formato JSON o CSV, oppure esportare un archivio ZIP comprensivo di file multimediali.
3. Per ripristinare, caricare il file di backup. Il sistema simulerà il ripristino verificando la conformità dello schema prima di applicare le modifiche.`,
      tags: ['backup', 'esportare', 'importare', 'json', 'csv', 'ripristino'],
    },
    {
      id: 'admin-install',
      category: 'admin',
      title: "Guida all'Installazione Multipiattaforma",
      subtitle: 'Installazione su Windows, macOS, Linux e dispositivi mobili',
      content: `Bird Academy v1.0 si installa facilmente sui vostri dispositivi:

■ DISPOSITIVI MOBILI (Android e iOS):
- Su Chrome o Safari, toccare "Aggiungi a schermata Home" o "Installa applicazione".
- L'applicazione compare sulla schermata principale con spazio di memoria isolato dal browser.

■ DESKTOP (Windows, macOS e Linux):
- Utilizzabile direttamente nel vostro browser preferito.
- Per un utilizzo nativo privo di barre del browser, installare come Progressive Web App (PWA) o avviare il pacchetto portatile.`,
      tags: ['installazione', 'windows', 'macos', 'linux', 'android', 'ios', 'pwa'],
    },
    {
      id: 'admin-migrate',
      category: 'admin',
      title: 'Guida alla Migrazione dei Dati',
      subtitle: 'Trasferire facilmente i dati da versioni precedenti o Excel',
      content: `Come importare o aggiornare i vostri dati in Bird Academy:

■ DA UN BACKUP JSON COMPATIBILE:
1. Esportare il file JSON dalla versione precedente.
2. In Bird Academy, accedere a "Import/Export Pro" e selezionare il file.
3. Il validatore automatico verificherà la conformità dello schema e completerà l'importazione in un clic.

■ DA DOCUMENTI MICROSOFT EXCEL / CSV:
1. Preparare il file CSV con le colonne minime richieste (anellino, nome, sesso, razza).
2. Utilizzare la procedura guidata di mappatura per abbinare le colonne ai campi del database.
3. Convalidare l'integrità tramite l'anteprima di simulazione prima del salvataggio definitivo.`,
      tags: ['migrazione', 'importare', 'excel', 'csv', 'ripristinare'],
    },
    {
      id: 'admin-license',
      category: 'admin',
      title: 'Licenza Software e Note Legali',
      subtitle: "Condizioni di Licenza e Diritti d'Uso Commerciale",
      content: `Bird Academy è distribuito secondo i termini di licenza applicabili alla vostra offerta commerciale sottoscritta.

Copyright © 2026 Bird Academy. Tutti i diritti riservati.

L'utilizzo del software è regolato rigorosamente dai diritti concessi in base alla propria edizione (modalità nativa gratuita senza licenza o licenza commerciale a pagamento per singolo dispositivo). I dati dell'allevamento rimangono di proprietà esclusiva dell'allevatore e sono archiviati localmente sul suo dispositivo. L'applicazione è fornita "così com'è". Tutti gli algoritmi biologici e i calcoli del coefficiente di consanguineità di Wright sono stati convalidati secondo gli standard zootecnici scientifici vigenti.`,
      tags: ['licenza', 'note-legali', 'proprietario', 'diritti', 'copyright'],
    },
    {
      id: 'bio-1',
      category: 'biology',
      title: 'Coefficiente di Consanguineità (Wright)',
      subtitle: 'Comprendere e ottimizzare il coefficiente genetico F',
      content: `Il coefficiente di Wright (COI) quantifica la probabilità che due alleli situati nello stesso locus di un individuo siano identici per discendenza da un antenato comune.
Nell'allevamento avicolo:
- F = 0%: Nessuna parentela nota nell'albero genealogico.
- F < 6%: Consanguineità lieve, utile per fissare caratteri desiderabili.
- F >= 12%: Consanguineità critica pericolosa (rischio di mortalità embrionale e difetti ereditari).
L'applicazione calcola F in tempo reale analizzando fino a 4 generazioni di antenati prima di confermare l'accoppiamento.`,
      tags: ['wright', 'consanguineita', 'genetica', 'antenato', 'coi'],
    },
    {
      id: 'bio-2',
      category: 'biology',
      title: 'Lipocromo vs Melanina',
      subtitle: 'Le due strutture pigmentarie fondamentali del piumaggio',
      content: `I colori del piumaggio dei canarini si basano su due categorie fondamentali di pigmenti:
1. Il Lipocromo: Pigmento a base lipidica di origine alimentare (colore di fondo giallo, rosso o bianco).
2. La Melanina: Pigmento scuro sintetizzato biologicamente dal volatile (nero, bruno, ossidato o diluito).
L'applicazione permette di categorizzare i soggetti secondo questi filtri per prevedere accuratamente i fenotipi attesi dai giovani.`,
      tags: ['lipocromo', 'melanina', 'pigmento', 'mutazione', 'piumaggio'],
    },
    {
      id: 'faq-1',
      category: 'faq',
      title: "Come installare l'applicazione PWA sul cellulare?",
      subtitle: 'Guida all installazione offline per Android, iOS e Desktop',
      content: `Dato che Bird Academy è una Progressive Web App (PWA):
- Su Android / Chrome: Cliccare sul banner superiore di installazione oppure selezionare dal menu "Aggiungi a schermata Home".
- Su iOS / Safari: Toccare l'icona di condivisione (freccia verso l'alto) e scegliere "Aggiungi alla schermata Home".
Una volta installata, l'icona compare sul display e funziona in modo del tutto autonomo senza rete.`,
      tags: ['pwa', 'installazione', 'cellulare', 'android', 'ios', 'safari'],
    },
    {
      id: 'faq-2',
      category: 'faq',
      title: 'Cosa succede se cancello la cache del browser?',
      subtitle: 'Comprendere la persistenza locale ed evitare perdite accidentali',
      content: `Se si utilizza in modo aggressivo l'opzione "Cancella tutta la cronologia e i dati dei siti web" nel browser, i dati archiviati localmente possono essere rimossi.
Per prevenire questo inconveniente:
1. Utilizzare l'app in modalità PWA installata (l'archiviazione è protetta dal sistema operativo).
2. Effettuare periodicamente esportazioni di backup in formato JSON salvandole su memoria USB o disco esterno.`,
      tags: ['cache', 'browser', 'perdita', 'sicurezza', 'cronologia'],
    },
    {
      id: 'faq-main',
      category: 'faq',
      title: 'Domande Frequenti e Archiviazione Locale',
      subtitle: 'Risposte ai quesiti più frequenti sulla gestione e conservazione dati',
      content: `D: I dati del mio allevamento vengono condivisi con altri utenti?
R: Assolutamente no. L'applicazione è autonoma e basata sul principio offline-first. Nessun dato lascia il dispositivo.

D: È presente una sincronizzazione automatica tra più dispositivi?
R: No. Bird Academy V1.x è un'applicazione per singolo dispositivo (Single Device), locale e 100% offline priva di sincronizzazione cloud. I dati risiedono unicamente sul vostro apparecchio. Per trasferirli su un nuovo PC, esportare un backup locale in JSON dal Dispositivo A e importarlo manualmente sul Dispositivo B.

D: Il calcolo della consanguineità di Wright è accurato?
R: Sì. L'algoritmo calcola ricorsivamente la parentela sull'albero genealogico risalendo fino agli antenati comuni di 4ª generazione, in pieno accordo con le formule scientifiche di Sewall Wright.`,
      tags: ['faq', 'aiuto', 'sicurezza', 'backup', 'wright'],
    },
    {
      id: 'faq-troubleshooting',
      category: 'faq',
      title: 'Risoluzione dei Problemi e Diagnostica',
      subtitle: 'Guida diagnostica passo-passo per i casi imprevisti',
      content: `Come gestire le anomalie più frequenti:

■ FALLIMENTO DEL RIPRISTINO DEL FILE DI BACKUP:
- Causa: Il file JSON è stato alterato manualmente e la firma crittografica SHA-256 non corrisponde.
- Soluzione: Non modificare mai i file .json esportati. Ripristinare il file originale o usare l'importatore CSV.

■ RALLENTAMENTI NELLA VISUALIZZAZIONE DELLE STATISTICHE:
- Causa: Eccessivo numero di volatili inattivi o vecchie coppie mantenute in memoria.
- Soluzione: Nella scheda "Import/Export Pro", avviare l'Ottimizzatore di Memoria per ricostruire gli indici.

■ L'APPLICAZIONE NON SI AVVIA (SCHERMATA BIANCA):
- Causa: Dati di sessione o cache del browser corrotti.
- Soluzione: Usare la Console di Ripristino o cliccare su "Reimposta" dal menu della PWA per ricaricare lo schema pulito.`,
      tags: ['diagnostica', 'problemi', 'errore', 'ripristinare'],
    },
    {
      id: 'release-v1',
      category: 'faq',
      title: 'Note di Rilascio v1.0 Gold Master',
      subtitle: 'I dettagli e le innovazioni della versione di produzione stabile',
      content: `Siamo fieri di presentare la versione v1.0 GM di Bird Academy!

■ DATI DI RILIEVO:
- 100% Offline: Nessuna latenza di rete.
- <2.0 secondi: Tempo medio di avvio iniziale.
- Ottimizzato e collaudato per oltre 10.000 volatili.

■ CARATTERISTICHE DI SPICCO:
- Motore di firma e integrità dei backup con algoritmo SHA-256.
- Ispettore del database locale con ricostruzione automatica degli indici.
- Assistente diagnostico completo con generazione di report sullo stato di salute.
- Guide e FAQ integrate al 100% per un utilizzo in totale autonomia.`,
      tags: ['release', 'gold', 'master', 'produzione', 'versione'],
    },
    {
      id: 'release-changelog',
      category: 'faq',
      title: 'Registro Cronologico delle Modifiche',
      subtitle: 'Cronistoria dello sviluppo dalla versione v0.1 alla v1.0 GM',
      content: `■ v1.0.0-GM (Sprint 12): Code Freeze ufficiale. Ottimizzazione della memoria, rendering istantaneo, sigillo SHA-256 dei backup e Assistente Diagnostico.
■ v0.9.5-RC2 (Sprint 11): Perfezionamento della conformità PWA e integrazione desktop. Traduzione completa in 5 lingue (FR, EN, AR RTL, ES, IT).
■ v0.8.0-RC1 (Sprint 10): Gestione imbecco manuale (EAM), cartella clinica completa, contabilità e simulatore genetico interattivo.
■ v0.5.0-BETA (Sprint 5-9): Modulo nursery, motore di Wright, bento-grid per statistiche e local storage unificato.
■ v0.1.0-ALPHA (Sprint 1-4): Fondamenta dell'architettura, anagrafica soggetti, gabbie e filtri essenziali.`,
      tags: ['changelog', 'cronologia', 'sprint', 'evoluzioni'],
    },
    {
      id: 'credits-team',
      category: 'faq',
      title: 'Crediti e Team di Sviluppo',
      subtitle: 'Chi ha reso possibile questa piattaforma per l ornitologia',
      content: `Il team di Bird Academy v1.0:

■ ARCHITETTURA E SVILUPPO SOFTWARE:
- Il team di ingegneria del software di Bird Academy (Competenze specialistiche in React, TypeScript e Sistemi Locali Embedded).

■ COMITATO SCIENTIFICO E CONSULENZA VETERINARIA:
- Giudici ed esperti allevatori di canarini di forma e posizione e biologi specializzati nell'analisi genealogica aviaria.

■ RINGRAZIAMENTI:
- Un sentito ringraziamento ai 250 allevatori beta-tester che con il loro riscontro durante gli Sprint da 1 a 11 hanno contribuito a forgiare questa release stabile d'eccellenza.`,
      tags: ['crediti', 'team', 'ringraziamenti', 'sviluppatori'],
    },
  ],
};
