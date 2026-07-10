import styles from './SubHabitsPage.module.css';
import { useCallback } from 'react';
import clsx from 'clsx';
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useInitialRouteState } from '@shared/lib/router';
import { getHabitColorVariants, useHabitsStore } from '@entities/habit';

function SubHabitsPage() {
	const { t } = useTranslation();
	const { habitId, date } = useInitialRouteState<'SUB_HABITS'>();
	const habits = useHabitsStore((s) => s.habits);
	const habitsDispatch = useHabitsStore((s) => s.habitsDispatch);

	const habit = habits.find((h) => h.id === habitId);
	const colorVariants = getHabitColorVariants(habit);

	const todayEntry = habit?.completedDays.find((d) => d.date === date);

	const completedIds = new Set(todayEntry?.completedSubHabitIds ?? []);

	const handleToggle = useCallback((subHabitId: string) => {
		if (!habit || !date) return;
		habitsDispatch({
			type: 'toggleSubHabit',
			payload: { habitId: habit.id, date, subHabitId }
		});
	}, [habit, habitsDispatch, date]);

	if (!habit) {
		return <div className={styles.empty}>{t('habits.list.emptyActiveTitle')}</div>;
	}

	const completedCount = completedIds.size;
	const totalCount = habit.subHabits?.length ?? 0;
	const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<div style={{
			...colorVariants.style,
			'--habit-color-base': colorVariants.baseColor,
			'--habit-color-dark': colorVariants.darkenedColor,
			'--habit-color-soft': colorVariants.softenedColor,
		} as React.CSSProperties} className={styles.page}>
			<div className={styles.header}>
				<h2 className={styles.title}>{habit.title}</h2>
				<time className={styles.date}>{date}</time>
			</div>

			<div className={styles.progress}>
				<div className={styles.progressBar}>
					<div
						className={styles.progressFill}
						style={{ width: `${percentage}%` }}
					/>
				</div>
				<span className={styles.progressText}>
					{completedCount}/{totalCount} ({percentage}%)
				</span>
			</div>

			<div className={styles.list}>
				{(habit.subHabits ?? []).map((sub) => {
					const isDone = completedIds.has(sub.id);
					return (
						<button
							key={sub.id}
							className={clsx(styles.item, isDone && styles.done)}
							onClick={() => handleToggle(sub.id)}
						>
							<span className={clsx(styles.checkbox, isDone && styles.checked)}>
								{isDone && <FaCheck size={12} />}
							</span>
							<span className={styles.label}>{sub.title}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export { SubHabitsPage };
