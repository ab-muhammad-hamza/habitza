import type { Variants } from 'framer-motion';

export const variants: Variants = {
	initial: { scale: 0.9, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: { type: 'spring', stiffness: 400, damping: 28 }
	},
	exit: {
		scale: 0.95,
		opacity: 0,
		transition: { duration: 0.12, ease: 'easeIn' }
	}
};
