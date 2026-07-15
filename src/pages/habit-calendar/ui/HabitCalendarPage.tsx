import styles from './HabitCalendarPage.module.css';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { useInitialRouteState, getModalPath } from '@shared/lib/router';
import { getHabitColorVariants, useHabitsStore } from '@entities/habit';
import { formatDate } from '@shared/lib/date-time';
import { useTranslation } from 'react-i18next';
import { Placeholder } from '@shared/ui';

interface DayProgress {
	completed: number;
	total: number;
}

function HabitCalendarPage() {
	const { habitId } = useInitialRouteState<'CALENDAR'>();
	const navigate = useNavigate();
	const habits = useHabitsStore((s) => s.habits);
	const habitsDispatch = useHabitsStore((s) => s.habitsDispatch);
	const { t, i18n } = useTranslation();

	const habit = habits.find((h) => h.id === habitId);
	const colorVariants = getHabitColorVariants(habit);

	const now = useMemo(() => new Date(), []);
	const currentYear = now.getFullYear();
	const todayStr = formatDate(now);

	const dayProgressMap = useMemo(() => {
		const map = new Map<string, DayProgress>();
		if (!habit) return map;
		for (const d of habit.completedDays) {
			map.set(d.date, {
				completed: d.completedSubHabitIds?.length ?? 0,
				total: habit.subHabits?.length ?? 0
			});
		}
		return map;
	}, [habit]);

	const handleDayClick = useCallback((date: string) => {
		if (!habit) return;

		if (!habit.subHabits || habit.subHabits.length === 0) {
			habitsDispatch({ type: 'toggleCalendarDay', payload: { habitId: habit.id, date } });
			return;
		}

		navigate(getModalPath('SUB_HABITS'), {
			state: {
				modalTitle: habit.title,
				habitId: habit.id,
				date
			}
		});
	}, [habit, navigate, habitsDispatch]);

	if (!habit) {
		return (
			<Placeholder
				content={{
					title: t('habits.list.emptyActiveTitle'),
					description: t('habits.list.emptyActiveDesc')
				}}
			/>
		);
	}

	const pageStyle = {
		...colorVariants.style,
		'--habit-color-base': colorVariants.baseColor,
		'--habit-color-dark': colorVariants.darkenedColor,
		'--habit-color-soft': colorVariants.softenedColor,
	} as React.CSSProperties;

	return (
		<div style={pageStyle} className={clsx('paletteItem', styles.page)}>
			<div className={styles.yearLabel}>{currentYear}</div>
			<div className={styles.grid}>
				{Array.from({ length: 12 }, (_, i) => (
					<MonthGrid
						key={i}
						year={currentYear}
						month={i}
						todayStr={todayStr}
						dayProgressMap={dayProgressMap}
						totalSubHabits={habit.subHabits?.length ?? 0}
						onDayClick={handleDayClick}
						lang={i18n.language}
					/>
				))}
			</div>
		</div>
	);
}

interface MonthGridProps {
	year: number;
	month: number;
	todayStr: string;
	dayProgressMap: Map<string, DayProgress>;
	totalSubHabits: number;
	onDayClick: (date: string) => void;
	lang: string;
}

const WEEKDAY_LABELS: Record<string, string[]> = {
	en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
	de: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
	ru: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'],
	es: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
	fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
	ja: ['月', '火', '水', '木', '金', '土', '日'],
	zh: ['一', '二', '三', '四', '五', '六', '日'],
};

const MONTH_LABELS: Record<string, string[]> = {
	en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
	ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
	es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
	ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
	zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

function MonthGrid(props: MonthGridProps) {
	const {
		year,
		month,
		todayStr,
		dayProgressMap,
		totalSubHabits,
		onDayClick,
		lang,
	} = props;

	const monthStr = String(month + 1).padStart(2, '0');
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const shift = (new Date(year, month, 1).getDay() || 7) - 1;
	const totalCells = shift + daysInMonth;
	const rows = Math.ceil(totalCells / 7);

	const weekdays = WEEKDAY_LABELS[lang] ?? WEEKDAY_LABELS.en;
	const monthLabel = MONTH_LABELS[lang]?.[month] ?? MONTH_LABELS.en[month];

	const cells = [];

	for (let i = 0; i < totalCells; i++) {
		if (i < shift) {
			cells.push(<div key={`e-${i}`} className={styles.dayCell} />);
			continue;
		}

		const dayNum = i - shift + 1;
		const dateStr = `${year}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
		const isToday = dateStr === todayStr;
		const isFuture = dateStr > todayStr;
		const progress = dayProgressMap.get(dateStr);
		const completed = progress?.completed ?? 0;
		const effectiveTotal = totalSubHabits || 1;
		const percentage = Math.round((completed / effectiveTotal) * 100);
		const isFull = percentage >= 100;

		let cellStyle = styles.dayCell;
		if (isFuture) {
			cellStyle = clsx(cellStyle, styles.future);
		} else if (isFull) {
			cellStyle = clsx(cellStyle, styles.completed);
		} else if (completed > 0) {
			cellStyle = clsx(cellStyle, styles.partial);
		} else {
			cellStyle = clsx(cellStyle, styles.empty);
		}

		if (isToday) {
			cellStyle = clsx(cellStyle, styles.today);
		}

		cells.push(
			<button
				key={dateStr}
				className={cellStyle}
				disabled={isFuture}
				onClick={() => onDayClick(dateStr)}
				aria-label={`${monthLabel} ${dayNum}`}
				style={{
					background: completed > 0 && !isFull
						? `linear-gradient(to top, var(--habit-color-base, #4a90d9) 0% ${percentage}%, var(--habit-color-dark, rgba(0,0,0,0.08)) ${percentage}% 100%)`
						: undefined
				}}
			>
				<span className={styles.dayNum}>{dayNum}</span>
				{completed > 0 && !isFull && (
					<span className={styles.progressLabel}>{percentage}%</span>
				)}
			</button>
		);
	}

	return (
		<div className={styles.month}>
			<div className={styles.monthLabel}>{monthLabel}</div>
			<div className={styles.weekdayRow}>
				{weekdays.map((wd) => (
					<div key={wd} className={styles.weekdayCell}>{wd}</div>
				))}
			</div>
			<div
				className={styles.daysGrid}
				style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
			>
				{cells}
			</div>
		</div>
	);
}

export { HabitCalendarPage };
