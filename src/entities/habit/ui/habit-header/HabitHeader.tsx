import styles from './HabitHeader.module.css';
import { type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { type Habit, HABIT_ICONS_MAP } from '@entities/habit';

interface HabitHeaderProps {
	habit: Habit;
	action?: ReactNode;
	currentStreak?: number;
}

function HabitHeader(props: HabitHeaderProps) {
	const {
		habit,
		action,
		currentStreak,
	} = props;

	const { t } = useTranslation();

	// Get icon by title — for custom/API icons not in the map, use the title directly
	const iconName = HABIT_ICONS_MAP[habit.iconTitle]?.icon ?? habit.iconTitle;

	return (
		<div className={styles.header}>
			<div className={styles.iconWrapper}>
				<Icon icon={iconName} width={22} height={22} />
			</div>

			<div className={styles.titleWrapper} >
				<h4 className={styles.title}>
					{habit.title}
				</h4>

				{currentStreak !== undefined && (
					<div className={styles.description}>
						<small>
							<span>
								{t('habits.stats.streak')}
							</span>

							<strong>: {currentStreak}</strong>
						</small>
					</div>
				)}
			</div>

			<div
				className={styles.actionWrapper}
				onClick={(e) => e.stopPropagation()}
				onPointerDownCapture={((e) => e.stopPropagation())}
			>
				{action}
			</div>
		</div>
	);
}

export default HabitHeader;