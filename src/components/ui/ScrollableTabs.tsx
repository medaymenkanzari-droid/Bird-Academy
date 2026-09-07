/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

export interface ScrollableTabsProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  showIndicators?: boolean;
}

export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  children,
  className = '',
  innerClassName = '',
  showIndicators = true,
}) => {
  return (
    <HorizontalScrollContainer
      className={className}
      innerClassName={innerClassName}
      showIndicators={showIndicators}
    >
      {children}
    </HorizontalScrollContainer>
  );
};

export default ScrollableTabs;
