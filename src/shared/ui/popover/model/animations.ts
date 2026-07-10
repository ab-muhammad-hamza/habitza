import type { Variants } from 'framer-motion';

export const variants: Variants = {
	initial: {
		opacity: 0,
		scale: 0.9,
		y: -4
	},
	animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 25
		}
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		y: -4,
		transition: {
			type: 'tween',
			duration: 0.1,
			ease: 'easeIn'
		}
	}
};
