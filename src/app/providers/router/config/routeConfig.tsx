import { Navigate, type RouteObject } from 'react-router';
import { AchievementsPage } from '@pages/achievements';
import { AppearancePage } from '@pages/appearance';
import { ArchivePage } from '@pages/archive';
import { HabitCalendarPage } from '@pages/habit-calendar';
import { DataManagementPage } from '@pages/data-management';
import { DiaryPage } from '@pages/diary';
import { HabitEditorPage } from '@pages/habit-editor';
import { MainPage } from '@pages/main';
import { MenuPage } from '@pages/menu';
import { HabitStatisticsPage } from '@pages/habit-statistics';
import { SubHabitsPage } from '@pages/sub-habits';
import { ROUTES } from '@shared/lib/router';
import { ModalLayout } from '@shared/ui';
import { SettingsLayout } from '@pages/settings/ui/SettingsLayout';
import { StorageInfoPage } from '@pages/storage-info';

export const routeConfig: RouteObject[] = [
	{
		path: '/',
		element: <MainPage />
	},
	{
		path: `/${ROUTES.SUB_HABITS}`,
		element: <ModalLayout><SubHabitsPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.HABIT_EDITOR}`,
		element: <ModalLayout><HabitEditorPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.CALENDAR}`,
		element: <ModalLayout><HabitCalendarPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.STATISTICS}`,
		element: <ModalLayout><HabitStatisticsPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.DIARY}`,
		element: <ModalLayout><DiaryPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.ACHIEVEMENTS}`,
		element: <ModalLayout><AchievementsPage /></ModalLayout>
	},
	{
		path: `/${ROUTES.MENU}`,
		element: <SettingsLayout />,
		children: [
			{ index: true, element: <MenuPage /> },
			{ path: 'appearance', element: <AppearancePage /> },
			{ path: 'archive', element: <ArchivePage /> },
			{ path: 'data', element: <DataManagementPage /> },
			{ path: 'storage-info', element: <StorageInfoPage /> },
		]
	},
	{
		path: '*',
		element: <Navigate to='/' />
	}
];
