import styles from './HabitIconPicker.module.css';
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { groupBy, pick, upperFirst } from 'es-toolkit';
import { HABIT_ICONS } from '@entities/habit';
import { Button, SectionHeader } from '@shared/ui';

const ICONIFY_API = 'https://api.iconify.design';

interface SearchResult {
	icons: string[];
	collections: Record<string, { name: string }>;
	total: number;
}

interface Props {
	habits: { iconTitle: string }[];
	initialIconTitle?: string;
}

function HabitIconPicker({ habits, initialIconTitle = 'mdi:record-circle-outline' }: Props) {
	const { t } = useTranslation();

	const [showMore, setShowMore] = useState(false);
	const [selectedIcon, setSelectedIcon] = useState(initialIconTitle);
	const [search, setSearch] = useState('');

	const [liveResults, setLiveResults] = useState<SearchResult | null>(null);
	const [liveLoading, setLiveLoading] = useState(false);
	const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const usedIcons = useMemo(() => new Set(habits.map((h) => h.iconTitle)), [habits]);
	const isInBuiltList = useMemo(
		() => HABIT_ICONS.some((ic) => ic.iconTitle === selectedIcon),
		[selectedIcon]
	);

	const groupedIcons = useMemo(() => groupBy(HABIT_ICONS, (icon) => icon.category), []);

	const visibleIcons = useMemo(() => {
		if (liveResults) return null;
		return showMore ? groupedIcons : pick(groupedIcons, ['featured']);
	}, [liveResults, showMore, groupedIcons]);

	const doSearch = useCallback(async (q: string) => {
		if (!q.trim()) {
			setLiveResults(null);
			return;
		}
		setLiveLoading(true);
		try {
			const res = await fetch(`${ICONIFY_API}/search?query=${encodeURIComponent(q)}&limit=56`);
			if (!res.ok) throw new Error('Search failed');
			const data: SearchResult = await res.json();
			setLiveResults(data);
		} catch {
			setLiveResults(null);
		} finally {
			setLiveLoading(false);
		}
	}, []);

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setSearch(val);

		if (searchTimer.current) clearTimeout(searchTimer.current);
		searchTimer.current = setTimeout(() => doSearch(val), 300);
	};

	useEffect(() => {
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current);
		};
	}, []);

	const selectIcon = (iconTitle: string) => {
		setSelectedIcon(iconTitle);
		setSearch('');
		setLiveResults(null);
	};

	const renderChip = (iconTitle: string, icon: string) => {
		const isUsed = usedIcons.has(iconTitle);

		return (
			<label
				key={iconTitle}
				className={styles.chip}
				data-used={isUsed || undefined}
			>
				<input
					type='radio'
					name='icon'
					value={iconTitle}
					onChange={() => selectIcon(iconTitle)}
					defaultChecked={iconTitle === initialIconTitle}
				/>
				<Icon icon={icon} width={24} height={24} />
			</label>
		);
	};

	const renderGrid = (icons: { iconTitle: string; icon: string }[], showPlus = false) => (
		<>
			{showPlus && (
				<>
					{!isInBuiltList && (
						<div key='selected-icon' className={styles.selectedChip}>
							<Icon icon={selectedIcon} />
							<span className={styles.selectedBadge}>✓</span>
						</div>
					)}
				</>
			)}
			{icons.map((ic) => renderChip(ic.iconTitle, ic.icon))}
		</>
	);

	return (
		<section>
			<SectionHeader
				title={t('habits.form.iconTitle')}
				description={habits.length > 0
					? t('habits.form.iconDesc')
					: undefined}
				extra={(
					<Button
						variant='text'
						onClick={() => setShowMore((state) => !state)}
					>
						{showMore ? t('common.showLess') : t('common.showMore')}
					</Button>
				)}
			/>

			<div className={styles.wrapper}>
				<input
					type='hidden'
					name='iconTitle'
					value={selectedIcon}
				/>

				<div className={styles.searchRow}>
					<input
						type='text'
						value={search}
						onChange={handleSearchChange}
						placeholder={t('common.search') || 'Search icons...'}
						className={styles.searchInput}
					/>
					{search && (
						<Button variant='text' onClick={() => { setSearch(''); setLiveResults(null); }}>
							{t('common.clear') || 'Clear'}
						</Button>
					)}
				</div>

				{liveResults ? (
					<div className={styles.liveResults}>
						<div className={styles.liveResultHeader}>
							<span className={styles.liveResultLabel}>
								{liveLoading ? '' : `${liveResults.total} results`}
							</span>
							{liveLoading && <span className={styles.liveResultSpinner} />}
						</div>
						<div className={styles.liveResultGrid}>
							{!isInBuiltList && (
								<div key='selected-icon-live' className={styles.selectedChip}>
									<Icon icon={selectedIcon} />
									<span className={styles.selectedBadge}>✓</span>
								</div>
							)}
							{liveResults.icons.slice(0, 55).map((fullName) => {
								const isUsed = usedIcons.has(fullName);
								return (
									<label
										key={fullName}
										className={styles.chip}
										data-used={isUsed || undefined}
									>
										<input
											type='radio'
											name='icon'
											value={fullName}
											onChange={() => selectIcon(fullName)}
										/>
										<Icon icon={fullName} width={24} height={24} />
									</label>
								);
							})}
						</div>
					</div>
				) : visibleIcons ? (
					Object.entries(visibleIcons).map(([category, icons], idx) => {
						const label = upperFirst(category);
						return (
							<div key={category}>
								{category !== 'featured' && (
									<small className={styles.categoryName}>{label}</small>
								)}
								<div className={styles.grid}>
									{renderGrid(icons, idx === 0)}
								</div>
							</div>
						);
					})
				) : null}
			</div>
		</section>
	);
}

export default HabitIconPicker;
