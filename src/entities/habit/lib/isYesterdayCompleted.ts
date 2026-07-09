import type { CompletedDay } from '../model/types';
import { formatDate, getYesterday } from '@shared/lib/date-time';

function isYesterdayCompleted(completedDays: CompletedDay[], totalSubHabits?: number): boolean {
	const yStr = formatDate(getYesterday());
	const entry = completedDays.find((d) => d.date === yStr);
	if (!entry) return false;
	if (totalSubHabits != null) {
		return entry.completedSubHabitIds.length >= totalSubHabits;
	}
	return true;
}

export { isYesterdayCompleted };
