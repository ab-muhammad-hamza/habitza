import type { EditHabit, Habit } from '../types';
import mapHabitData from '../../lib/mapHabitData';
import updateHabitById from '../../lib/updateHabitById';
import reorderHabit from '../../lib/reorderHabit';

interface Params {
	habits: Habit[];
	payload: EditHabit['payload'];
}

function editHabit(params: Params): Habit[] {
	const {
		habits,
		payload
	} = params;

	const fields = mapHabitData(payload.data);

	// Build set of current sub-habit IDs
	const newSubHabitIds = new Set(fields.subHabits.map((s) => s.id));

	// Update the habit data and sync progress
	let nextHabits = updateHabitById(habits, payload.habitId, (habit) => {
		// Remove completedSubHabitIds that no longer exist
		const nextCompletedDays = habit.completedDays.map((day) => ({
			...day,
			completedSubHabitIds: (day.completedSubHabitIds ?? []).filter(
				(id) => newSubHabitIds.has(id)
			)
		}));

		return {
			...habit,
			...fields,
			completedDays: nextCompletedDays
		};
	});

	// Find current position using updated title if it changed
	const currentIndex = nextHabits.findIndex(
		(h) => h.id === payload.habitId
	);

	const newIndex = Number(payload.data.order ?? 1) - 1;

	// Reorder if the position has changed
	if (currentIndex !== -1 && newIndex !== currentIndex) {
		nextHabits = reorderHabit({ habits: nextHabits, newIndex, currentIndex });
	}

	return nextHabits;
}

export default editHabit;
