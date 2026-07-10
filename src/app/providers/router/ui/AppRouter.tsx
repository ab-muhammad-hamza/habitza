import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation, useNavigationType } from 'react-router';
import { routeConfig } from '../config/routeConfig';
import { DirectionContext, type Direction } from '@shared/lib/router';

function AppRouter() {
	const location = useLocation();
	const navigationType = useNavigationType();

	const direction: Direction = navigationType === 'POP' ? 'backward' : 'forward';

	// Use root path segment as key so nested settings routes keep the parent mounted
	const routeKey = '/' + location.pathname.split('/')[1];

	return (
		<DirectionContext value={direction}>
			<AnimatePresence initial={false}>
				<Routes key={routeKey} location={location}>
					{routeConfig.map(({ children, ...route }) => (
						<Route
							key={route.path}
							path={route.path}
							element={route.element}
						>
							{children?.map((child) => (
								<Route
									key={child.path ?? 'index'}
									index={child.index}
									path={child.path}
									element={child.element}
								/>
							))}
						</Route>
					))}
				</Routes>
			</AnimatePresence>
		</DirectionContext>
	);
}

export { AppRouter };
