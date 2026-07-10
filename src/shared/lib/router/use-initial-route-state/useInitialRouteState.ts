import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { getInitialRouteState } from '../helpers';
import type { AppRouteKey, PageState } from '../types';

function useInitialRouteState<T extends AppRouteKey>() {
	const location = useLocation();

	const pageState = useMemo<Partial<PageState<T>>>(
		() => getInitialRouteState<T>() ?? {},
		[location.pathname]
	);

	return pageState;
}

export { useInitialRouteState };
