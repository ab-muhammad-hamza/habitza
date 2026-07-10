import { ROUTES } from './paths';
import type { AppRouteKey, PageState } from './types';

export const getInitialRouteState = <T extends AppRouteKey>(): PageState<T> | undefined => {
	const rawState = window.history.state;
	if (!rawState) return;

	const pageState = rawState?.usr ?? rawState;

	return pageState as PageState<T>;
}

export const getRoutePath = (key: AppRouteKey) => {
	return `/${ROUTES[key]}`;
};

/** @deprecated Use getRoutePath instead */
export const getModalPath = getRoutePath;

export const getNavigationTarget = <T extends AppRouteKey>(route: T, state: PageState<T>) => {
	return {
		to: getRoutePath(route),
		state
	};
}
