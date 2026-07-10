import type { HabitData } from '../model/types';

function mapHabitData(data: HabitData) {
	const colorIndex = Number(data.colorIndex);
	const isCustom = isNaN(colorIndex) || colorIndex < 0;

	return {
		title: data.title,
		subHabits: data.subHabits,
		colorIndex: isCustom ? -1 : (colorIndex || 0),
		iconTitle: data.iconTitle,
		customColor: isCustom ? (data.customColor || '#6366f1') : undefined
	};
}

export default mapHabitData;
