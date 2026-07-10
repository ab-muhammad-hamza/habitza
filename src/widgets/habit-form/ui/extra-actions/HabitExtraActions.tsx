import styles from './HabitExtraActions.module.css';
import { useTranslation } from 'react-i18next';
import { FaEllipsisH, FaTrash } from 'react-icons/fa';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';
import { archiveHabit } from '@features/archive-habit';
import { removeHabit } from '@features/remove-habit';
import { Button, useContextMenuStore } from '@shared/ui';

interface HabitExtraActionsProps {
	habitId: string;
	onSuccess: () => void;
}

function HabitExtraActions({ habitId, onSuccess }: HabitExtraActionsProps) {
	const { t } = useTranslation();
	const openContextMenu = useContextMenuStore((s) => s.open);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		openContextMenu({
			title: t('habits.dialogs.manageTitle'),
			actions: [
				{
					icon: FaTrash,
					label: t('habits.actions.delete'),
					variant: 'danger' as const,
					onClick: () => removeHabit(habitId, onSuccess)
				},
				{
					icon: HiArchiveBoxArrowDown,
					label: t('habits.actions.archive'),
					onClick: () => archiveHabit(habitId, onSuccess)
				}
			],
			x: rect.left,
			y: rect.bottom + 4
		});
	};

	return (
		<Button
			className={styles.button}
			onClick={handleClick}
		>
			<FaEllipsisH />
		</Button>
	);
}

export default HabitExtraActions;
