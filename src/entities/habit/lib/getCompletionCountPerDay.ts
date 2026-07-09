import type { CompletedDay } from '../model/types';

function getCompletionCountPerDay(completedDays: CompletedDay[], totalSubHabits?: number): number[] {
	const counts = new Array(7).fill(0);

	for (const day of completedDays) {
		if (totalSubHabits != null && (day.completedSubHabitIds?.length ?? 0) < totalSubHabits) continue;
		const dayOfWeek = new Date(day.date).getDay();
		counts[dayOfWeek] += 1;
	}

	return counts;
}

export { getCompletionCountPerDay };