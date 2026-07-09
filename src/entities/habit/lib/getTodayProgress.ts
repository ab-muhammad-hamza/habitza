import type { Habit } from '../model/types';
import { formatDate } from '@shared/lib/date-time';

interface HabitProgress {
	today: string;
	completed: number;
	total: number;
	percentage: number;
	isCompleted: boolean;
}

function getTodayProgress(habit: Habit): HabitProgress {
	const today = formatDate(new Date());
	const todayEntry = habit.completedDays.find((d) => d.date === today);
	const rawTotal = habit.subHabits?.length ?? 0;
	const rawCompleted = todayEntry?.completedSubHabitIds.length ?? 0;

	// When no sub-habits exist, treat as a simple boolean toggle (0/1)
	const total = rawTotal || 1;
	const completed = rawTotal === 0
		? (todayEntry ? 1 : 0)
		: rawCompleted;

	return {
		today,
		completed,
		total,
		percentage: Math.floor((completed / total) * 100),
		isCompleted: completed >= total
	};
}

export { getTodayProgress };
