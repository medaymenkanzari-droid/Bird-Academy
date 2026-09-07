/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — LANDING PAGE
 */

import React from 'react';
import { WebRoute } from '../types';
import { HeroSection } from '../components/sections/HeroSection';
import { ProblemSolutionSection } from '../components/sections/ProblemSolutionSection';
import { OfflineGuaranteeSection } from '../components/sections/OfflineGuaranteeSection';
import { FeaturesGridSection } from '../components/sections/FeaturesGridSection';
import { PricingCardsSection } from '../components/sections/PricingCardsSection';
import { ComparisonTableSection } from '../components/sections/ComparisonTableSection';
import { BirdIntelligenceSection } from '../components/sections/BirdIntelligenceSection';
import { AIAssistantSection } from '../components/sections/AIAssistantSection';
import { SecurityArchitectureSection } from '../components/sections/SecurityArchitectureSection';
import { DownloadSection } from '../components/sections/DownloadSection';
import { FAQAccordionSection } from '../components/sections/FAQAccordionSection';
import { SupportContactSection } from '../components/sections/SupportContactSection';

export interface WebLandingPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebLandingPage: React.FC<WebLandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-0" data-testid="web-landing-page">
      {/* 1. Hero Section */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. Problem & Solution Section */}
      <ProblemSolutionSection />

      {/* 3. 100% Offline-First Guarantee Section */}
      <OfflineGuaranteeSection />

      {/* 4. Core Features Grid */}
      <FeaturesGridSection />

      {/* 5. Pricing Cards */}
      <PricingCardsSection onNavigate={onNavigate} />

      {/* 6. Comparison Table Matrix */}
      <ComparisonTableSection />

      {/* 7. Bird Intelligence Deterministic Engine */}
      <BirdIntelligenceSection />

      {/* 8. Local AI Assistant */}
      <AIAssistantSection />

      {/* 9. Cryptographic Security & LMSE */}
      <SecurityArchitectureSection />

      {/* 10. Multi-Platform Download Summary */}
      <DownloadSection onNavigate={onNavigate} />

      {/* 11. FAQ Accordion */}
      <FAQAccordionSection onNavigate={onNavigate} />

      {/* 12. Support & Contact */}
      <SupportContactSection />
    </div>
  );
};
