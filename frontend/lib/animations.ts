import type { Variants, Transition } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const smoothTransition = (delay = 0): Transition => ({
  duration: 0.5,
  ease: easeOut,
  delay,
});

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeOut } },
};

export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

export const fadeUpCustom: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: easeOut,
      delay: i * 0.09,
    },
  }),
};
