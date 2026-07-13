import type { Variants, Transition } from 'framer-motion';

// ==================== TRANSITIONS ====================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

export const expoTransition: Transition = {
  type: 'tween',
  duration: 0.7,
  ease: [0.19, 1, 0.22, 1],
};

export const staggerChildren = (stagger: number = 0.1): Transition => ({
  staggerChildren: stagger,
});

// ==================== PAGE TRANSITIONS ====================

export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(10px)',
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1],
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
    },
  },
};

// ==================== FADE VARIANTS ====================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  },
};

// ==================== STAGGER CONTAINER ====================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ==================== CARD ANIMATIONS ====================

export const cardHover = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

export const cardHoverGlow = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

// ==================== SCROLL-TRIGGERED ====================

export const scrollReveal: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    filter: 'blur(4px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1],
    },
  },
};

export const scrollRevealLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60,
    filter: 'blur(4px)',
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1],
    },
  },
};

export const scrollRevealRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60,
    filter: 'blur(4px)',
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1],
    },
  },
};

// ==================== NUMBER COUNTER ====================

export const countUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
  },
};

// ==================== ORBIT / AURORA ====================

export const orbitAnimation = {
  rotate: [0, 360],
  transition: {
    duration: 30,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const auroraPulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};