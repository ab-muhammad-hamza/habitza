import type { CompletedDay } from '../model/types';

/**
 * Returns a set of dates where all sub-habits are completed.
 */
function getCompletedDatesSet(
	completedDays: CompletedDay[],
	totalSubHabits: number,
	...dates: string[]
): Set<string> {
	const result = new Set<string>();
	if (completedDays.length === 0 || dates.length === 0) return result;

	const oldestTarget = dates.reduce((a, b) => a < b ? a : b);
	const targetSet = new Set(dates);

	for (const entry of completedDays) {
		if (result.size === targetSet.size) break;
		if (entry.date < oldestTarget) break;

		if (
			targetSet.has(entry.date) &&
			(entry.completedSubHabitIds?.length ?? 0) >= totalSubHabits
		) {
			result.add(entry.date);
		}
	}

	return result;
}

export { getCompletedDatesSet };