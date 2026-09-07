/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Variants } from 'motion/react';

// Centralized timing and acceleration curves (Sprint 15)
export const MOTION_TIMINGS = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.45,
  },
  ease: {
    // Elegant, native-like cubic-bezier curves matching Linear & Apple apps
    standard: [0.4, 0.0, 0.2, 1] as [number, number, number, number], // Standard decelerate curve
    decelerate: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
    accelerate: [0.4, 0.0, 1, 1] as [number, number, number, number],
    spring: { type: "spring", stiffness: 380, damping: 30 },
    springSoft: { type: "spring", stiffness: 220, damping: 25 },
  }
};

// Centralized Framer Motion variants that auto-respect prefers-reduced-motion (Sprint 15)
export const MOTION_VARIANTS: Record<string, Variants> = {
  // Page Transition: Fade and subtle slide-up
  pageTransition: {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: MOTION_TIMINGS.duration.normal,
        ease: MOTION_TIMINGS.ease.standard
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.99,
      transition: {
        duration: MOTION_TIMINGS.duration.fast,
        ease: MOTION_TIMINGS.ease.accelerate
      }
    },
  },
  
  // Modals & Dialogs: Snappy bounce-in scale and vertical slide
  modal: {
    initial: { opacity: 0, scale: 0.96, y: 16 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 28
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: 12,
      transition: {
        duration: MOTION_TIMINGS.duration.fast,
        ease: MOTION_TIMINGS.ease.accelerate
      }
    },
  },

  // Sidebar mobile drawer & layout sliding menus
  drawerLeft: {
    initial: { x: '-100%', opacity: 0.9 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 26
      }
    },
    exit: { 
      x: '-100%', 
      opacity: 0.9,
      transition: {
        duration: MOTION_TIMINGS.duration.normal,
        ease: MOTION_TIMINGS.ease.accelerate
      }
    }
  },

  drawerRight: {
    initial: { x: '100%', opacity: 0.9 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 26
      }
    },
    exit: {
      x: '100%',
      opacity: 0.9,
      transition: {
        duration: MOTION_TIMINGS.duration.normal,
        ease: MOTION_TIMINGS.ease.accelerate
      }
    }
  },

  // Dropdown menus & Popovers: Fast fade & slide down
  dropdown: {
    initial: { opacity: 0, scale: 0.95, y: -4 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: MOTION_TIMINGS.duration.fast,
        ease: MOTION_TIMINGS.ease.decelerate
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -4,
      transition: {
        duration: MOTION_TIMINGS.duration.fast - 0.05,
        ease: MOTION_TIMINGS.ease.accelerate
      }
    },
  },

  // Toast notification cards: Slide up and slide down stacking
  toast: {
    initial: { opacity: 0, y: 35, scale: 0.94 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.92, 
      transition: { 
        duration: MOTION_TIMINGS.duration.fast 
      } 
    },
  },

  // List Item Stagger Container
  listContainer: {
    animate: {
      transition: {
        staggerChildren: 0.03
      }
    }
  },

  // List Item Stagger Item
  listItem: {
    initial: { opacity: 0, y: 8 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: MOTION_TIMINGS.duration.normal,
        ease: MOTION_TIMINGS.ease.decelerate
      }
    },
  },

  // Skeleton Screens: Subtle background pulse
  skeleton: {
    initial: { opacity: 0.5 },
    animate: { 
      opacity: [0.5, 0.95, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Splash Logo Scale-Up
  splashLogo: {
    initial: { scale: 0.85, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 18,
        delay: 0.1
      }
    }
  }
};

export const ANIMATIONS = {
  fade: 'transition-all duration-200 ease-in-out',
  scaleHover: 'hover:scale-[1.01] hover:-translate-y-[1px] transition-all duration-200 ease-out shadow-xs hover:shadow-md active:scale-[0.985]',
  tap: 'active:scale-95 duration-100',
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  scaleIn: 'animate-scaleIn',
  shake: 'animate-shake',
};
