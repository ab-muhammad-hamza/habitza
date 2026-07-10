import styles from './HabitForm.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { startCase } from 'es-toolkit';
import { MdAddToPhotos } from 'react-icons/md';
import HabitTitleInput from './title-input/HabitTitleInput';
import SubHabitEditor from './sub-habit-editor/SubHabitEditor';
import HabitColorPicker from './color-picker/HabitColorPicker';
import HabitIconPicker from './icon-picker/HabitIconPicker';
import HabitOrderField from './order-field/HabitOrderField';
import HabitExtraActions from './extra-actions/HabitExtraActions';
import useHabitDuplicate from '../lib/useHabitDuplicate';
import { type HabitData, type SubHabit, useHabitsStore } from '@entities/habit';
import { scrollToTop } from '@shared/lib/dom';
import { Button } from '@shared/ui';

interface HabitFormProps {
	habitId?: string;
}

function HabitForm({ habitId }: HabitFormProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const habits = useHabitsStore((s) => s.habits);
	const habitsDispatch = useHabitsStore((s) => s.habitsDispatch);

	const isEditMode = Boolean(habitId);
	const currentHabit = isEditMode ? habits.find((h) => h.id === habitId) : undefined;

	const [title, setTitle] = useState(currentHabit?.title ?? '');
	const [subHabits, setSubHabits] = useState<SubHabit[]>(
		currentHabit?.subHabits ?? []
	);
	const isDuplicate = useHabitDuplicate(habits, title, isSubmitting, currentHabit);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		const formData = new FormData(e.currentTarget);

		const rawData = Object.fromEntries(formData.entries()) as Record<string, string>;

		const habitData: HabitData = {
			title: rawData.title ?? '',
			subHabits,
			colorIndex: rawData.colorIndex ?? '0',
			iconTitle: rawData.iconTitle ?? '',
			customColor: rawData.customColor || undefined,
			...(isEditMode ? { order: rawData.order } : {})
		};

		const payload = {
			habitId: currentHabit?.id ?? '',
			data: habitData
		};

		habitsDispatch({
			type: isEditMode ? 'editHabit' : 'addHabit',
			payload
		});

		if (!isEditMode) scrollToTop();

		navigate('/');
	};

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit}
		>
			<HabitTitleInput
				input={title}
				isDuplicate={isDuplicate}
				onChange={setTitle}
			/>

			<SubHabitEditor
				subHabits={subHabits}
				onChange={setSubHabits}
			/>

			{(isEditMode && currentHabit) && (
				<HabitOrderField
					habits={habits}
					habit={currentHabit}
				/>
			)}

			<HabitColorPicker
				habits={habits}
				initialColorIndex={currentHabit?.colorIndex}
				initialCustomColor={currentHabit?.customColor}
			/>

			<HabitIconPicker
				habits={habits}
				initialIconTitle={currentHabit?.iconTitle}
			/>

			<div className={styles.actions}>
				{(isEditMode && habitId) && (
					<HabitExtraActions
						habitId={habitId}
						onSuccess={(() => navigate('/'))}
					/>
				)}

				<Button
					type='submit'
					icon={<MdAddToPhotos />}
					className={styles.submitButton}
					disabled={title.trim().length === 0 || isDuplicate}
				>
					{startCase(isEditMode
						? t('habits.actions.update')
						: t('habits.actions.create'))}
				</Button>
			</div>
		</form>
	);
}

export { HabitForm };
