import type { Variants } from 'framer-motion';

const variants: Variants = {
	initial: {
		opacity: 0,
		y: 12,
		scale: 0.97
	},

	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 350,
			damping: 30,
			mass: 1
		}
	},

	exit: {
		opacity: 0,
		y: -8,
		scale: 0.98,
		transition: {
			type: 'tween',
			duration: 0.15,
			ease: 'easeOut'
		}
	}
};

export const modalMotionProps = {
	variants,
	initial: 'initial',
	animate: 'animate',
	exit: 'exit'
};
