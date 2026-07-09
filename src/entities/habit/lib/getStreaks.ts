import type { CompletedDay } from '../model/types';
import { formatDate } from '@shared/lib/date-time';
import { DAY_MS } from '@shared/const';
import { type Streak } from '@shared/model';

interface HabitStreaks {
	allStreaks: Streak[];
	currentStreak: number
	longestStreak: number;
}

function getStreaks(completedDays: CompletedDay[], totalSubHabits?: number): HabitStreaks {
	// Filter to only days where all sub-habits are completed
	const fullyCompleted = totalSubHabits != null
		? completedDays.filter((d) => (d.completedSubHabitIds?.length ?? 0) >= totalSubHabits)
		: completedDays;

	if (fullyCompleted[0] === undefined) {
		return { allStreaks: [], currentStreak: 0, longestStreak: 0 };
	}

	const allStreaks: Streak[] = [];
	let currentSeries = 1;
	let streakEnd = fullyCompleted[0].date;

	const daysWithTs = fullyCompleted.map((day) => ({
		date: day.date,
		ts: new Date(day.date).getTime()
	}));

	daysWithTs.forEach((day, i) => {
		const nextDay = daysWithTs[i + 1];

		if (nextDay) {
			if ((day.ts - nextDay.ts) / DAY_MS === 1) {
				currentSeries++;
				return;
			}
		}

		allStreaks.push({
			length: currentSeries,
			start: day.date,
			end: streakEnd
		});

		if (nextDay) {
			currentSeries = 1;
			streakEnd = nextDay.date;
		}
	});

	const todayMs = new Date(formatDate(new Date())).getTime();
	const lastCompletedMs = new Date(fullyCompleted[0].date).getTime();

	const isStreakActive = (todayMs - lastCompletedMs) / DAY_MS <= 1;
	const currentStreak = isStreakActive ? (allStreaks[0]?.length ?? 0) : 0;

	return {
		allStreaks,
		currentStreak,
		longestStreak: Math.max(0, ...allStreaks.map((s) => s.length))
	};
}

export { getStreaks };
