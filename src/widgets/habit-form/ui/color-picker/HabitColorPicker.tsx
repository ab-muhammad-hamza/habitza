import styles from './HabitColorPicker.module.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Habit } from '@entities/habit';
import { getAppPalette } from '@shared/lib/theme';
import { SectionHeader } from '@shared/ui';

interface Props {
	habits: Habit[];
	initialColorIndex?: number;
	initialCustomColor?: string;
}

function HabitColorPicker({ habits, initialColorIndex = 0, initialCustomColor }: Props) {
	const { t } = useTranslation();
	const palette = getAppPalette();
	const usedColors = new Set(habits.map((h) => h.colorIndex));

	const wasCustom = initialColorIndex < 0;
	const [isCustom, setIsCustom] = useState(wasCustom);
	const [customHex, setCustomHex] = useState(initialCustomColor || '#6366f1');

	const paletteSwatches = palette.map(({ baseColor, style }, index) => {
		const isUsed = usedColors.has(index);

		return (
			<label
				key={`${baseColor}-${style['--hue']}`}
				style={{ backgroundColor: baseColor, ...style }}
				className={`paletteItem ${styles.swatch}`}
				data-used={isUsed || undefined}
			>
				<input
					type='radio'
					name='colorIndex'
					value={index}
					defaultChecked={index === initialColorIndex && !wasCustom}
					onChange={() => setIsCustom(false)}
				/>
				{isUsed && <span className={styles.inUseDot} />}
			</label>
		);
	});

	return (
		<section>
			<SectionHeader
				title={t('habits.form.colorTitle')}
				description={habits.length > 0
					? t('habits.form.colorDesc')
					: undefined}
			/>

			<div className={styles.grid}>
				{paletteSwatches}

				<label
					className={styles.customSwatch}
					style={isCustom ? { backgroundColor: customHex } : undefined}
					data-active={isCustom || undefined}
				>
					<input
						type='radio'
						name='colorIndex'
						value={-1}
						defaultChecked={wasCustom}
						onChange={() => setIsCustom(true)}
					/>
					{isCustom ? (
						<input
							type='color'
							value={customHex}
							onChange={(e) => setCustomHex(e.target.value)}
							className={styles.colorWheel}
							name='customColor'
						/>
					) : (
						<span className={styles.plusIcon}>+</span>
					)}
				</label>
			</div>
		</section>
	);
}

export default HabitColorPicker;
