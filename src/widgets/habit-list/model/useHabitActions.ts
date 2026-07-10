import { useTranslation } from 'react-i18next';
import { FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaPencilAlt, FaShareAlt } from 'react-icons/fa';
import { FaChartSimple } from 'react-icons/fa6';
import { MdLibraryBooks } from 'react-icons/md';
import { type Habit, useHabitsStore } from '@entities/habit';
import { takeScreenshot } from '@shared/lib/dom';
import { getNavigationTarget } from '@shared/lib/router';
import { type ColorVariants } from '@shared/lib/theme';
import { type ContextMenuAction, type DrawerAction, useContextMenuStore, useDrawerStore } from '@shared/ui';
import type { CSSProperties } from 'react';

interface OpenMenuParams {
	habit: Habit;
	habitStats: {
		isYdayCompleted: boolean;
		isTodayCompleted: boolean;
		currentStreak: number;
	};
	colorVariants: ColorVariants;
	cardElement: HTMLElement;
}

function useHabitActions() {
	const { t } = useTranslation();
	const habitsDispatch = useHabitsStore((s) => s.habitsDispatch);
	const openDrawer = useDrawerStore((s) => s.open);
	const openContextMenu = useContextMenuStore((s) => s.open);

	const getActions = (params: OpenMenuParams): DrawerAction[] => {
		const {
			habit,
			habitStats: { isYdayCompleted, isTodayCompleted, currentStreak },
			colorVariants,
			cardElement
		} = params;

		const { darkenedColor, style } = colorVariants;
		const buttonStyle: CSSProperties = { backgroundColor: darkenedColor, ...style };

		return [
			{
				icon: isYdayCompleted ? FaCalendarTimes : FaCalendarCheck,
				label: isYdayCompleted
					? t('habits.actions.undoYesterday')
					: t('habits.actions.doneYesterday'),
				onClick: () => habitsDispatch({
					type: 'toggleYesterdayStatus',
					payload: { habitId: habit.id, isYdayCompleted, isTodayCompleted }
				}),
				style: buttonStyle,
				className: 'paletteItem'
			},
			{
				...getNavigationTarget('HABIT_EDITOR', {
					modalTitle: t('habits.actions.edit'),
					habitId: habit.id
				}),
				icon: FaPencilAlt,
				label: t('habits.actions.edit'),
				indicator: { type: 'arrow' },
				style: buttonStyle,
				className: 'paletteItem'
			},
			{
				icon: FaShareAlt,
				label: t('habits.actions.share'),
				onClick: () => takeScreenshot(cardElement),
				style: buttonStyle,
				className: 'paletteItem'
			},
			{
				...getNavigationTarget('STATISTICS', {
					modalTitle: habit.title,
					habitId: habit.id
				}),
				icon: FaChartSimple,
				label: t('habits.stats.title'),
				indicator: { type: 'arrow' },
				style: buttonStyle,
				className: 'paletteItem'
			},
			{
				...getNavigationTarget('DIARY', {
					modalTitle: habit.title,
					habitId: habit.id,
					currentStreak
				}),
				icon: MdLibraryBooks,
				label: t('habits.actions.notes'),
				indicator: { type: 'arrow' },
				style: buttonStyle,
				className: 'paletteItem'
			},
			{
				...getNavigationTarget('CALENDAR', {
					modalTitle: habit.title,
					habitId: habit.id
				}),
				icon: FaCalendarAlt,
				label: t('habits.actions.calendar'),
				indicator: { type: 'arrow' },
				style: buttonStyle,
				className: 'paletteItem'
			}
		];
	};

	const getContextMenuActions = (params: OpenMenuParams): ContextMenuAction[] => {
		const {
			habit,
			habitStats: { isYdayCompleted, isTodayCompleted, currentStreak },
			cardElement
		} = params;

		return [
			{
				icon: isYdayCompleted ? FaCalendarTimes : FaCalendarCheck,
				label: isYdayCompleted
					? t('habits.actions.undoYesterday')
					: t('habits.actions.doneYesterday'),
				onClick: () => habitsDispatch({
					type: 'toggleYesterdayStatus',
					payload: { habitId: habit.id, isYdayCompleted, isTodayCompleted }
				})
			},
			{
				icon: FaPencilAlt,
				...getNavigationTarget('HABIT_EDITOR', {
					modalTitle: t('habits.actions.edit'),
					habitId: habit.id
				}),
				label: t('habits.actions.edit'),
				indicator: { type: 'arrow' }
			},
			{
				icon: FaShareAlt,
				label: t('habits.actions.share'),
				onClick: () => takeScreenshot(cardElement)
			},
			{
				icon: FaChartSimple,
				...getNavigationTarget('STATISTICS', {
					modalTitle: habit.title,
					habitId: habit.id
				}),
				label: t('habits.stats.title'),
				indicator: { type: 'arrow' }
			},
			{
				icon: MdLibraryBooks,
				...getNavigationTarget('DIARY', {
					modalTitle: habit.title,
					habitId: habit.id,
					currentStreak
				}),
				label: t('habits.actions.notes'),
				indicator: { type: 'arrow' }
			},
			{
				icon: FaCalendarAlt,
				...getNavigationTarget('CALENDAR', {
					modalTitle: habit.title,
					habitId: habit.id
				}),
				label: t('habits.actions.calendar'),
				indicator: { type: 'arrow' }
			}
		];
	};

	return {
		openHabitMenu: ({ habit, ...rest }: OpenMenuParams) => {
			openDrawer({
				title: habit.title,
				actions: getActions({ habit, ...rest })
			});
		},
		openHabitContextMenu: ({ habit, ...rest }: OpenMenuParams, x: number, y: number) => {
			openContextMenu({
				title: habit.title,
				actions: getContextMenuActions({ habit, ...rest }),
				x,
				y
			});
		}
	};
}

export { useHabitActions };
