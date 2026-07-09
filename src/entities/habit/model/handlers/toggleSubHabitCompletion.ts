import type { Habit, ToggleSubHabit } from '../types';
import updateHabitById from '../../lib/updateHabitById';

interface Params {
	habits: Habit[];
	payload: ToggleSubHabit['payload'];
}

function toggleSubHabitCompletion(params: Params): Habit[] {
	const {
		habits,
		payload: { habitId, date, subHabitId }
	} = params;

	return updateHabitById(habits, habitId, (habit) => {
		const existingDay = habit.completedDays.find((d) => d.date === date);

		if (existingDay) {
			const dayIds = existingDay.completedSubHabitIds ?? [];
			const isAlreadyCompleted = dayIds.includes(subHabitId);

			if (isAlreadyCompleted) {
				// Remove the sub-habit from the day's completed list
				const nextIds = dayIds.filter((id) => id !== subHabitId);

				// If no sub-habits remain, remove the day entry entirely
				if (nextIds.length === 0) {
					return {
						...habit,
						lastActivityDate: date,
						completedDays: habit.completedDays.filter((d) => d.date !== date)
					};
				}

				return {
					...habit,
					lastActivityDate: date,
					completedDays: habit.completedDays.map((d) =>
						d.date === date
							? { ...d, completedSubHabitIds: nextIds }
							: d
					)
				};
			}

			// Add the sub-habit
			return {
				...habit,
				lastActivityDate: date,
				completedDays: habit.completedDays.map((d) =>
					d.date === date
						? { ...d, completedSubHabitIds: [...(d.completedSubHabitIds ?? dayIds), subHabitId] }
						: d
				)
			};
		}

		// First completion for this date
		return {
			...habit,
			lastActivityDate: date,
			completedDays: [
				{ date, completedSubHabitIds: [subHabitId] },
				...habit.completedDays
			]
		};
	});
}

export default toggleSubHabitCompletion;
