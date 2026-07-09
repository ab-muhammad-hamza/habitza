import styles from './TotalCompletedMetric.module.css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHashtag } from 'react-icons/fa';
import { type CompletedDay } from '@entities/habit';
import { Card } from '@shared/ui';

interface Props {
	days: CompletedDay[];
	color: string;
	totalSubHabits?: number;
}

function TotalCompletedMetric({ days, color, totalSubHabits }: Props) {
	const { t } = useTranslation();

	const total = useMemo(() => {
		if (totalSubHabits == null) return days.length;
		return days.filter((d) => (d.completedSubHabitIds?.length ?? 0) >= totalSubHabits).length;
	}, [days, totalSubHabits]);

	return (
		<Card
			title={t('habits.stats.totalCompleted')}
			extra={<FaHashtag style={{ color }} />}
		>
			<div className={styles.content}>
				{total}
			</div>
		</Card>
	);
}

export { TotalCompletedMetric };
