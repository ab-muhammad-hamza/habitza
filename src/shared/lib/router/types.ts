import type { ROUTES } from './paths';

export type Direction = 'forward' | 'backward';

export type AppRouteKey = keyof typeof ROUTES;

export type StrictStates<T extends { [K in keyof T]: K extends AppRouteKey ? unknown : never }> = T;

export type ExplicitRouteStates = StrictStates<{
	CALENDAR: {
		habitId: string;
	};

	DIARY: {
		habitId?: string;
		currentStreak?: number;
	};

	HABIT_EDITOR: {
		habitId?: string;
	};

	STATISTICS: {
		habitId: string;
	};

	SUB_HABITS: {
		habitId: string;
		date: string;
	};
}>;

export type RouteStateMap = {
	[K in AppRouteKey]: K extends keyof ExplicitRouteStates
	? ExplicitRouteStates[K]
	: object;
};

export type PageState<T extends AppRouteKey> = {
	modalTitle: string;
} & RouteStateMap[T];