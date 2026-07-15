import type { Habit, HabitAction } from './types';
import addHabit from './handlers/addHabit';
import editHabit from './handlers/editHabit';
import deleteHabit from './handlers/deleteHabit';
import setHabitArchiveStatus from './handlers/setHabitArchiveStatus';
import updateHabitProgress from './handlers/updateHabitProgress';
import toggleYesterdayStatus from './handlers/toggleYesterdayStatus';
import toggleSubHabitCompletion from './handlers/toggleSubHabitCompletion';
import toggleCalendarDayCompletion from './handlers/toggleCalendarDayCompletion';

function habitsReducer(habits: Habit[], { type, payload }: HabitAction): Habit[] {
	switch (type) {
		case 'addHabit':
			return addHabit({ habits, payload });

		case 'editHabit':
			return editHabit({ habits, payload });

		case 'deleteHabit':
			return deleteHabit({ habits, payload });

		case 'setHabitArchiveStatus':
			return setHabitArchiveStatus({ habits, payload });

		case 'updateProgress':
			return updateHabitProgress({ habits, payload });

		case 'toggleYesterdayStatus':
			return toggleYesterdayStatus({ habits, payload });

		case 'toggleSubHabit':
			return toggleSubHabitCompletion({ habits, payload });

		case 'toggleCalendarDay':
			return toggleCalendarDayCompletion({ habits, payload });

		default: {
			const _exhaustiveCheck: never = type;
			console.error('Unknown action type.');
			return _exhaustiveCheck;
		}
	}
}

export default habitsReducer;
