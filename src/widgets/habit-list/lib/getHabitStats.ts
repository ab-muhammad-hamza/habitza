import { getStreaks, getTodayProgress, type Habit, isYesterdayCompleted } from '@entities/habit';

/**
 * Get stats for a specific habit.
 * Returns yesterday status, today progress and current streak.
 */
function getHabitStats(habit: Habit) {
	const {
		completedDays
	} = habit;

	const totalSubHabits = habit.subHabits?.length ?? 0;
	const isYdayCompleted = isYesterdayCompleted(completedDays, totalSubHabits);
	const { isCompleted: isTodayCompleted } = getTodayProgress(habit);
	const { currentStreak } = getStreaks(completedDays, totalSubHabits);

	return {
		isTodayCompleted,
		isYdayCompleted,
		currentStreak
	};
}

export { getHabitStats };