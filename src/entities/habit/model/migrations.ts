import { formatDate } from '@shared/lib/date-time';

export const habitMigrations: Record<number, (state: any) => any> = {
	0: (state) => state,
	1: migrateToV1,
	2: migrateToV2,
	3: migrateToV3,
	4: migrateToV4
};

/**
 * Migration v1:
 * - Adds unique 'id' to each habit.
 * - Renames 'creationDate' to 'createdAt' and converts it to Unix timestamp (number).
 */
function migrateToV1(state: any): any {
	const habits = (state?.habits ?? []).map((h: any) => {
		const nextHabit = {
			...h,
			id: crypto.randomUUID(),
			createdAt: typeof h.creationDate === 'string'
				? new Date(h.creationDate).getTime()
				: Date.now()
		};

		delete nextHabit.creationDate;
		return nextHabit;
	});

	return { ...state, habits };
}

/**
 * Migration v2:
 * - Adds progress fields.
 * - Cleans up the history array.
 */
function migrateToV2(state: any): any {
	const todayStr = formatDate(new Date());
	const habits = (state?.habits ?? []).map((h: any) => {
		const days = h.completedDays ?? [];

		// Get legacy data for today if exists
		const oldTodayEntry = days.find((d: any) => d.date === todayStr);

		// Extract last activity date from the very first entry in history
		const lastActivityDate = days[0]?.date ?? '';

		// Clean history: only full days, no progress field
		const nextCompletedDays = days
			.filter((d: any) => d.progress >= h.frequency)
			.map((d: any) => {
				// eslint-disable-next-line
				const { progress, ...rest } = d; // remove progress field
				return rest;
			});

		return {
			...h,
			currentProgress: oldTodayEntry ? (oldTodayEntry.progress ?? 0) : 0,
			lastActivityDate,
			completedDays: nextCompletedDays
		};
	});

	return { ...state, habits };
}

/**
 * Migration v3:
 * - Adds partialProgress field to all habits.
 */
function migrateToV3(state: any): any {
	const habits = (state?.habits ?? []).map((h: any) => ({
		...h,
		partialProgress: h.partialProgress ?? {}
	}));

	return { ...state, habits };
}

/**
 * Migration v4:
 * - Replaces frequency + currentProgress + partialProgress with subHabits.
 * - Updates completedDays entries with completedSubHabitIds.
 */
function migrateToV4(state: any): any {
	const habits = (state?.habits ?? []).map((h: any) => {
		try {
			const oldFreq = Math.max(1, h.frequency ?? 1);
			const isDev = typeof crypto !== 'undefined' && 'randomUUID' in crypto;

			// Create sub-habits from frequency count
			const subHabits = Array.from({ length: oldFreq }, (_, i) => ({
				id: isDev ? String(Math.random()) : crypto.randomUUID(),
				title: `Sub-task ${i + 1}`
			}));

			const allSubHabitIds = subHabits.map((s: any) => s.id);

			// Update completedDays: old entries were fully completed
			const completedDays = (h.completedDays ?? []).map((d: any) => ({
				date: d.date ?? '',
				completedSubHabitIds: d.completedSubHabitIds ?? [...allSubHabitIds],
				isCompYdayBtnUsed: d.isCompYdayBtnUsed ?? false
			}));

			const next: Record<string, any> = {
				...h,
				subHabits,
				completedDays
			};

			delete next.frequency;
			delete next.currentProgress;
			delete next.partialProgress;

			return next;
		} catch (e) {
			console.error('Failed to migrate habit to v4:', e, h);
			return {
				...h,
				subHabits: [],
				completedDays: (h.completedDays ?? []).map((d: any) => ({
					date: d.date ?? '',
					completedSubHabitIds: d.completedSubHabitIds ?? [],
					isCompYdayBtnUsed: d.isCompYdayBtnUsed ?? false
				}))
			};
		}
	});

	return { ...state, habits };
}