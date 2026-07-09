import type { Habit, UpdateProgress } from '../types';
import { getTodayProgress } from '../../lib/getTodayProgress';
import updateHabitById from '../../lib/updateHabitById';

interface Params {
	habits: Habit[];
	payload: UpdateProgress['payload'];
}

function updateHabitProgress(params: Params): Habit[] {
	const {
		habits,
		payload: { habitId, isLongPress }
	} = params;

	return updateHabitById(habits, habitId, (habit) => {
		const { today, total, isCompleted } = getTodayProgress(habit);
		const todayEntry = habit.completedDays.find((d) => d.date === today);

		// No sub-habits: simple boolean toggle
		if ((habit.subHabits ?? []).length === 0) {
			if (todayEntry) {
				return {
					...habit,
					lastActivityDate: today,
					completedDays: habit.completedDays.filter((d) => d.date !== today)
				};
			}

			return {
				...habit,
				lastActivityDate: today,
				completedDays: [{ date: today, completedSubHabitIds: ['__done__'], isCompYdayBtnUsed: false }, ...habit.completedDays]
			};
		}

		if (isCompleted && !isLongPress) {
			// Toggle off: remove all sub-habits for today
			if (!todayEntry) return habit;

			if ((todayEntry.completedSubHabitIds?.length ?? 0) >= total) {
				// Remove the entry entirely
				return {
					...habit,
					lastActivityDate: today,
					completedDays: habit.completedDays.filter((d) => d.date !== today)
				};
			}
		}

		if (isLongPress && !isCompleted) {
			// Long press: complete all remaining sub-habits for today
			const allIds = (habit.subHabits ?? []).map((s) => s.id);

			if (todayEntry) {
				return {
					...habit,
					lastActivityDate: today,
					completedDays: habit.completedDays.map((d) =>
						d.date === today
							? { ...d, completedSubHabitIds: allIds }
							: d
					)
				};
			}

			return {
				...habit,
				lastActivityDate: today,
				completedDays: [{ date: today, completedSubHabitIds: allIds }, ...habit.completedDays]
			};
		}

		// Tap: complete the next uncompleted sub-habit
		const nextSubHabit = (habit.subHabits ?? []).find(
			(s) => !(todayEntry?.completedSubHabitIds ?? []).includes(s.id)
		);

		if (!nextSubHabit) return habit;

		if (todayEntry) {
			return {
				...habit,
				lastActivityDate: today,
				completedDays: habit.completedDays.map((d) =>
					d.date === today
						? { ...d, completedSubHabitIds: [...(d.completedSubHabitIds ?? []), nextSubHabit.id] }
						: d
				)
			};
		}

		return {
			...habit,
			lastActivityDate: today,
			completedDays: [{ date: today, completedSubHabitIds: [nextSubHabit.id] }, ...habit.completedDays]
		};
	});
}

export default updateHabitProgress;
