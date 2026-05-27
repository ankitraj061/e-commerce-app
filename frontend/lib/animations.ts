/**
 * lib/animations.ts
 * Shared Framer Motion variants — properly typed for FM v12.
 *
 * FM v12 `ease` must be:
 *   - a named easing string: "easeOut", "linear", etc.
 *   - OR a 4-element tuple [p1x, p1y, p2x, p2y] asserted as const / tuple
 *   - NOT a plain number[]
 */
import type { Variants, Transition } from "framer-motion";

// Smooth premium easing curve (cubic bezier)
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Standard transition builders ─────────────────────────────────────────────

export const smoothTransition = (delay = 0): Transition => ({
  duration: 0.5,
  ease: easeOut,
  delay,
});

// ── Variants ─────────────────────────────────────────────────────────────────

/** Single item fade-up */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

/** Stagger container */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Fade only */
export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/** Slide in from right */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeOut } },
};

/** Scale pop */
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
};

// ── Custom-delay fade-up (use as `variants` + `custom` prop) ─────────────────

/**
 * Returns a Variants object where `show` is a TargetResolver that uses
 * the `custom` prop for stagger delay.
 *
 * Usage:
 *   <motion.div variants={fadeUpCustom} custom={0} initial="hidden" animate="show">
 */
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
