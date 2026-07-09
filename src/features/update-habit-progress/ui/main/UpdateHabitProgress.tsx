import styles from './UpdateHabitProgress.module.css';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useLongPress } from '@uidotdev/usehooks';
import { FaCheck } from 'react-icons/fa';
import ProgressBar from '../progress-bar/ProgressBar';
import { type Habit, useHabitsStore, getTodayProgress } from '@entities/habit';
import { Button } from '@shared/ui';

interface Props {
	habit: Habit;
}

function UpdateHabitProgress({ habit }: Props) {
	const { id } = habit;

	const [animation, setAnimation] = useState<'completed' | 'updated' | null>(null);
	const habitsDispatch = useHabitsStore((s) => s.habitsDispatch);

	const { completed, total, percentage, isCompleted } = getTodayProgress(habit);

	const handleUpdateProgress = (isLongPress?: boolean) => {
		const isFinalStep = completed + 1 >= total;
		setAnimation((isFinalStep || isLongPress) ? 'completed' : 'updated');

		try {
			navigator?.vibrate(isFinalStep ? [10, 10, 10, 10, 10] : 10);
		} catch (e) {
			console.warn('Vibration not supported or failed.', e);
		}

		if (isLongPress && isCompleted) return;

		habitsDispatch({
			type: 'updateProgress',
			payload: { habitId: id, isLongPress }
		});
	};

	const attrs = useLongPress(() => handleUpdateProgress(true), { threshold: 300 });

	useEffect(() => {
		if (!animation) return;
		const timer = setTimeout(() => setAnimation(null), 200);
		return () => clearTimeout(timer);
	}, [animation]);

	return (
		<div
			className={clsx(
				styles.wrapper,
				animation === 'completed' && styles.completed,
				animation === 'updated' && styles.updated
			)}
		>
			{total > 1 && (
				<ProgressBar
					segmentCount={total}
					progress={completed}
				/>
			)}

			<Button
				style={{
					backgroundColor: isCompleted
						? 'var(--habit-color-base)'
						: 'var(--habit-color-dark)'
				}}
				className={clsx(
					styles.button,
					total > 1 && styles.multiFrequency
				)}
				{...attrs}
				onClick={(e) => {
					e.stopPropagation();
					handleUpdateProgress();
				}}
			>
				{percentage >= 100 ? (
					<FaCheck />
				) : (
					<strong>{percentage}%</strong>
				)}
			</Button>
		</div>
	);
}

export { UpdateHabitProgress };
