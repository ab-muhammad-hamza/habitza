import type { CompletedDay } from '../model/types';

function getCompletionCountPerMonth(completedDays: CompletedDay[], totalSubHabits?: number): number[] {
	const counts = new Array(12).fill(0);

	for (const day of completedDays) {
		if (totalSubHabits != null && (day.completedSubHabitIds?.length ?? 0) < totalSubHabits) continue;
		const month = new Date(day.date).getMonth();
		counts[month] += 1;
	}

	return counts;
}

export { getCompletionCountPerMonth };