import type { Habit } from '../model/types';
import { getAppPalette, type ColorVariants } from '@shared/lib/theme';

/** Darken a hex color by a percentage (0-1). */
function darken(hex: string, amount: number): string {
	const num = parseInt(hex.replace('#', ''), 16);
	const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) * (1 - amount)));
	const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) * (1 - amount)));
	const b = Math.max(0, Math.min(255, (num & 0xff) * (1 - amount)));
	return `rgb(${r},${g},${b})`;
}

/** Lighten/soften a hex color by mixing with white. */
function soften(hex: string, amount: number): string {
	const num = parseInt(hex.replace('#', ''), 16);
	const r = Math.round(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount);
	const g = Math.round(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount);
	const b = Math.round((num & 0xff) + (255 - (num & 0xff)) * amount);
	return `rgb(${r},${g},${b})`;
}

function getHabitColorVariants(habit: Habit | undefined): ColorVariants {
	if (!habit) return getAppPalette()[0];

	if (habit.colorIndex >= 0) {
		const palette = getAppPalette();
		return palette[habit.colorIndex] ?? palette[0];
	}

	if (habit.customColor) {
		return {
			baseColor: habit.customColor,
			darkenedColor: darken(habit.customColor, 0.2),
			softenedColor: soften(habit.customColor, 0.7),
			style: {}
		};
	}

	return getAppPalette()[0];
}

export { getHabitColorVariants };
