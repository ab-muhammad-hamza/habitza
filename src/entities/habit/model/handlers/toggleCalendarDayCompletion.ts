import type { Habit, ToggleCalendarDay } from '../types';
import updateHabitById from '../../lib/updateHabitById';

interface Params {
	habits: Habit[];
	payload: ToggleCalendarDay['payload'];
}

function toggleCalendarDayCompletion(params: Params): Habit[] {
	const {
		habits,
		payload: { habitId, date }
	} = params;

	return updateHabitById(habits, habitId, (habit) => {
		const existingEntry = habit.completedDays.find((d) => d.date === date);

		if (existingEntry) {
			return {
				...habit,
				lastActivityDate: date,
				completedDays: habit.completedDays.filter((d) => d.date !== date)
			};
		}

		return {
			...habit,
			lastActivityDate: date,
			completedDays: [
				{ date, completedSubHabitIds: ['__done__'], isCompYdayBtnUsed: false },
				...habit.completedDays
			]
		};
	});
}

export default toggleCalendarDayCompletion;
