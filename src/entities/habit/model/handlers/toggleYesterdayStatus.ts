import type { Habit, ToggleYesterdayStatus } from '../types';
import updateHabitById from '../../lib/updateHabitById';
import { formatDate, getYesterday } from '@shared/lib/date-time';

interface Params {
	habits: Habit[];
	payload: ToggleYesterdayStatus['payload'];
}

function toggleYesterdayStatus(params: Params): Habit[] {
	const {
		habits,
		payload: {
			habitId,
			isYdayCompleted,
			isTodayCompleted
		}
	} = params;

	const yDayStr = formatDate(getYesterday());

	return updateHabitById(habits, habitId, (habit) => {
		if (isYdayCompleted) {
			// If today is completed, it's at [0], so yesterday is at [1].
			// Otherwise, yesterday is at [0].
			const targetIndex = isTodayCompleted ? 1 : 0;

			return {
				...habit,
				completedDays: habit.completedDays.toSpliced(targetIndex, 1)
			};
		}

		// Mark all sub-habits as completed for yesterday
		const allSubHabitIds = (habit.subHabits ?? []).map((s) => s.id);

		const completedYday = {
			date: yDayStr,
			completedSubHabitIds: allSubHabitIds,
			isCompYdayBtnUsed: true
		};

		const insertIndex = isTodayCompleted ? 1 : 0;

		return {
			...habit,
			completedDays: habit.completedDays.toSpliced(insertIndex, 0, completedYday)
		};
	});
}

export default toggleYesterdayStatus;
