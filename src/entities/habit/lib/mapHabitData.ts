import type { HabitData } from '../model/types';

function mapHabitData(data: HabitData) {
	return {
		title: data.title,
		subHabits: data.subHabits,
		colorIndex: Number(data.colorIndex) || 0,
		iconTitle: data.iconTitle
	};
}

export default mapHabitData;
