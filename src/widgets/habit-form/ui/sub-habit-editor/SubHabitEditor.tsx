import styles from './SubHabitEditor.module.css';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTrash } from 'react-icons/fa';
import type { SubHabit } from '@entities/habit';
import { Button, SectionHeader } from '@shared/ui';

interface Props {
	subHabits: SubHabit[];
	onChange: (items: SubHabit[]) => void;
}

const isDev = import.meta.env.DEV;

function SubHabitEditor({ subHabits, onChange }: Props) {
	const { t } = useTranslation();
	const [newTitle, setNewTitle] = useState('');

	const handleAdd = useCallback(() => {
		const title = newTitle.trim();
		if (!title) return;
		const id = isDev ? String(Math.random()) : crypto.randomUUID();
		onChange([...subHabits, { id, title }]);
		setNewTitle('');
	}, [newTitle, subHabits, onChange]);

	const handleRemove = useCallback((id: string) => {
		onChange(subHabits.filter((s) => s.id !== id));
	}, [subHabits, onChange]);

	const handleEditTitle = useCallback((id: string, title: string) => {
		onChange(subHabits.map((s) => s.id === id ? { ...s, title } : s));
	}, [subHabits, onChange]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAdd();
		}
	};

	return (
		<section>
			<SectionHeader
				title={t('habits.form.frequencyTitle')}
				description={t('habits.form.frequencyDesc')}
			/>

			<div className={styles.list}>
				{subHabits.map((sub) => (
					<div key={sub.id} className={styles.item}>
						<input
							className={styles.input}
							type='text'
							value={sub.title}
							onChange={(e) => handleEditTitle(sub.id, e.target.value)}
							placeholder='Sub-task name...'
						/>
						<Button
							variant='text'
							className={styles.removeBtn}
							onClick={() => handleRemove(sub.id)}
						>
							<FaTrash size={12} />
						</Button>
					</div>
				))}
			</div>

			<div className={styles.addRow}>
				<input
					className={styles.addInput}
					type='text'
					value={newTitle}
					onChange={(e) => setNewTitle(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t('habits.form.namePlaceholder')}
				/>
				<Button
					className={styles.addBtn}
					onClick={handleAdd}
					disabled={!newTitle.trim()}
				>
					<FaPlus />
				</Button>
			</div>
		</section>
	);
}

export default SubHabitEditor;
