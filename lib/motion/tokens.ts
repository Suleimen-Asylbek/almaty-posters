// Motion Tokens - Refined for Premium Feel
export const motion = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
  hero: 1.0,
  modal: 0.5,
};

export const springs = {
  soft: { type: 'spring' as const, stiffness: 80, damping: 22 },
  normal: { type: 'spring' as const, stiffness: 150, damping: 25 },
  stiff: { type: 'spring' as const, stiffness: 300, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 200, damping: 15 },
};

export const eases = {
  expoOut: [0.16, 1, 0.3, 1],
  expoIn: [0.7, 0, 0.84, 0],
  gentle: [0.34, 1.56, 0.64, 1],
  premium: [0.22, 1, 0.36, 1],
};

export const interactions = {
  button: {
    hover: { scale: 1.015 },
    tap: { scale: 0.985 },
    transition: { type: 'spring' as const, stiffness: 150, damping: 25 },
  },
  link: {
    hover: { opacity: 0.8 },
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
};

export const motionReveal = {
  offset: 20,
  scale: 0.99,
  staggerDelay: 0.1,
};
