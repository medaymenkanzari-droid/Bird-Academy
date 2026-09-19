/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — LANDING PAGE (AVIAN PRECISION IMMERSIVE EDITION)
 */

import React from 'react';
import { WebRoute } from '../types';
import { HeroSection } from '../components/sections/HeroSection';
import { ProblemSolutionSection } from '../components/sections/ProblemSolutionSection';
import { ExpertTestimonialSection } from '../components/sections/ExpertTestimonialSection';
import { CoreEnginesGridSection } from '../components/sections/CoreEnginesGridSection';
import { OfflineGuaranteeSection } from '../components/sections/OfflineGuaranteeSection';
import { FeaturesGridSection } from '../components/sections/FeaturesGridSection';
import { PricingCardsSection } from '../components/sections/PricingCardsSection';
import { ComparisonTableSection } from '../components/sections/ComparisonTableSection';
import { BirdIntelligenceSection } from '../components/sections/BirdIntelligenceSection';
import { AIAssistantSection } from '../components/sections/AIAssistantSection';
import { SecurityArchitectureSection } from '../components/sections/SecurityArchitectureSection';
import { DownloadSection } from '../components/sections/DownloadSection';
import { FAQAccordionSection } from '../components/sections/FAQAccordionSection';
import { FinalEngagementCtaSection } from '../components/sections/FinalEngagementCtaSection';
import { SupportContactSection } from '../components/sections/SupportContactSection';

export interface WebLandingPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebLandingPage: React.FC<WebLandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-0" data-testid="web-landing-page">
      {/* 1. Hero Split-Screen Showcase */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Problem & Solution Section (Du Carnet Papier à l'Excellence Avicole) */}
      <ProblemSolutionSection />

      {/* 3. Expert Testimonial (Jean-Marc Valenti & Volière Moderne) */}
      <ExpertTestimonialSection />

      {/* 4. The 4 Pillar Technological Engines */}
      <CoreEnginesGridSection />

      {/* 5. 100% Offline-First Guarantee Section */}
      <OfflineGuaranteeSection />

      {/* 6. Comprehensive Features Grid */}
      <FeaturesGridSection />

      {/* 7. Pricing Cards (Tarif en préparation / FREE) */}
      <PricingCardsSection onNavigate={onNavigate} />

      {/* 8. Comparison Table Matrix */}
      <ComparisonTableSection />

      {/* 9. Bird Intelligence Deterministic Engine */}
      <BirdIntelligenceSection />

      {/* 10. Local AI Assistant */}
      <AIAssistantSection />

      {/* 11. Cryptographic Security & LMSE */}
      <SecurityArchitectureSection />

      {/* 12. Multi-Platform Download Summary */}
      <DownloadSection onNavigate={onNavigate} />

      {/* 13. FAQ Accordion */}
      <FAQAccordionSection onNavigate={onNavigate} />

      {/* 14. Final Engagement CTA Banner */}
      <FinalEngagementCtaSection onNavigate={onNavigate} />

      {/* 15. Support & Contact */}
      <SupportContactSection />
    </div>
  );
};
