export interface SubHabit {
	id: string;
	title: string;
}

export interface CompletedDay {
	/** ISO date string (YYYY-MM-DD). */
	date: string;

	/** IDs of sub-habits completed on this day. */
	completedSubHabitIds: string[];

	isCompYdayBtnUsed?: boolean;
}

export interface Habit {
	id: string;
	title: string;
	colorIndex: number;
	iconTitle: string;

	/** Hex color when colorIndex === -1 (custom color). */
	customColor?: string;

	/** List of sub-habits replacing the old frequency number. */
	subHabits: SubHabit[];

	lastActivityDate: string;

	/** Sorted in descending order (newest dates first). */
	completedDays: CompletedDay[];

	isArchived?: boolean;

	/** Creation time as a Unix timestamp (ms). */
	createdAt: number;
}

export interface HabitData {
	title: string;
	subHabits: SubHabit[];
	colorIndex: string;
	iconTitle: string;
	order?: string;
	customColor?: string;
}

// action types
export interface AddHabit {
	type: 'addHabit';
	payload: {
		data: HabitData;
	};
}

export interface EditHabit {
	type: 'editHabit';
	payload: {
		habitId: string;
		data: HabitData;
	};
}

export interface DeleteHabit {
	type: 'deleteHabit';
	payload: {
		habitId: string;
	};
}

export interface SetHabitArchiveStatus {
	type: 'setHabitArchiveStatus';
	payload: {
		habitId: string;
		isArchived: boolean;
	};
}

export interface UpdateProgress {
	type: 'updateProgress';
	payload: {
		habitId: string;
		isLongPress?: boolean;
	};
}

export interface ToggleSubHabit {
	type: 'toggleSubHabit';
	payload: {
		habitId: string;
		date: string;
		subHabitId: string;
	};
}

export interface ToggleYesterdayStatus {
	type: 'toggleYesterdayStatus';
	payload: {
		habitId: string;
		isYdayCompleted: boolean;
		isTodayCompleted: boolean;
	};
}

export interface ToggleCalendarDay {
	type: 'toggleCalendarDay';
	payload: {
		habitId: string;
		date: string;
	};
}

export type HabitAction =
	| AddHabit
	| EditHabit
	| DeleteHabit
	| SetHabitArchiveStatus
	| UpdateProgress
	| ToggleSubHabit
	| ToggleYesterdayStatus
	| ToggleCalendarDay;

export interface HabitState {
	habits: Habit[];
	habitsDispatch: (action: HabitAction) => void;

	_hasHydrated: boolean;
	setHasHydrated: (state: boolean) => void;
}
