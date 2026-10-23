// src/features/birds/models/passport/BirdPassport.ts

import { BirdIdentity } from './BirdIdentity';
import { BirdOrigin } from './BirdOrigin';
import { BirdPhenotype } from './BirdPhenotype';
import { BirdGenetics } from './BirdGenetics';
import { BirdHealth } from './BirdHealth';
import { BirdHabitatReference } from './BirdHabitatReference';

export interface BirdPassport {
  identity: BirdIdentity;
  origin?: BirdOrigin;
  phenotype?: BirdPhenotype;
  genetics?: BirdGenetics;
  health?: BirdHealth;
  habitat?: BirdHabitatReference;
}
