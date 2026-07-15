import styles from './WelcomeView.module.css';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { FaLock, FaPlane, FaShieldAlt } from 'react-icons/fa';
import { FaBoltLightning, FaChartSimple, FaCheck, FaListCheck } from 'react-icons/fa6';
import { usePwaInstall } from '@features/pwa-install';
import { useSettingsStore } from '@entities/settings';
import { Button } from '@shared/ui';

const BASE_URL = import.meta.env.BASE_URL;

/* ─── Simple animation helpers ─── */
const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 22 },
	animate: { opacity: 1, y: 0 },
	transition: { type: 'spring' as const, stiffness: 300, damping: 28, delay },
});

const fadeIn = (delay = 0) => ({
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	transition: { duration: 0.5, delay },
});

const cardReveal = {
	hidden: { opacity: 0, y: 28, scale: 0.96 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: i * 0.08 }
	})
};

/* ─── Animated counter ─── */
function AnimatedNumber({ target, duration = 1600 }: { target: number; duration?: number }) {
	const [display, setDisplay] = useState(0);
	const raf = useRef<number | null>(null);
	useEffect(() => {
		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * target));
			if (t < 1) raf.current = requestAnimationFrame(tick);
		};
		raf.current = requestAnimationFrame(tick);
		return () => { if (raf.current) cancelAnimationFrame(raf.current); };
	}, [target, duration]);
	return <>{display}</>;
}

/* ─── Typing text ─── */
function TypingText({ text, delay = 400 }: { text: string; delay?: number }) {
	const [displayed, setDisplayed] = useState('');
	const [done, setDone] = useState(false);
	useEffect(() => {
		const t1 = setTimeout(() => {
			let i = 0;
			const t2 = setInterval(() => {
				i++;
				setDisplayed(text.slice(0, i));
				if (i >= text.length) { setDone(true); clearInterval(t2); }
			}, 20);
			return () => clearInterval(t2);
		}, delay);
		return () => clearTimeout(t1);
	}, [text, delay]);
	return <>{displayed}{!done && <span className={styles.cursor} />}</>;
}

/* ─────────────────────────────────────────────────────────
   MOCK HABIT CARD — exact replica of actual app design
   Matches: HabitCard (border-radius-secondary=20px, bg-color-primary)
            HabitHeader (48×48 icon + 48×48 check button)
            CompactCalendar (canvas-based heatmap, same colors)
───────────────────────────────────────────────────────── */
const MOCK_HABITS = [
	{ id: 'h1', hue: 260, icon: '💪', name: 'Morning Workout', streak: 14, doneCount: 16 },
	{ id: 'h2', hue: 30,  icon: '📚', name: 'Read 30 min',     streak: 7,  doneCount: 8  },
	{ id: 'h3', hue: 200, icon: '💧', name: 'Drink Water',     streak: 21, doneCount: 24 },
	{ id: 'h4', hue: 120, icon: '🏃', name: 'Evening Run',     streak: 5,  doneCount: 6  },
];

/* Canvas heatmap — mirrors actual CompactCalendar.tsx exactly.
   Uses ResizeObserver so it draws once the card has real layout width.
   Uses getComputedStyle trick (same as real CompactCalendar) to resolve
   oklch CSS values to colors canvas understands. */
function MockCalendar({ hue, doneCount }: { hue: number; doneCount: number }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const WEEKS = 20;
	const GAP = 3;
	const RADIUS = 2;

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio ?? 1;

		// Resolve oklch values to real colors via getComputedStyle
		// (same technique as the real CompactCalendar.tsx)
		const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			|| document.documentElement.style.colorScheme?.includes('dark');
		canvas.style.color = isDark ? `oklch(60% 0.13 ${hue})` : `oklch(80% 0.2 ${hue})`;
		canvas.style.backgroundColor = isDark ? `oklch(30% 0.01 ${hue})` : `oklch(96% 0.02 ${hue})`;
		const { color: baseColor, backgroundColor: darkColor } = getComputedStyle(canvas);
		canvas.style.color = '';
		canvas.style.backgroundColor = '';

		const logW = canvas.clientWidth;
		if (!logW) return;

		const cell = (logW - GAP * (WEEKS - 1)) / WEEKS;
		const logH = 7 * (cell + GAP) - GAP;

		canvas.width = logW * dpr;
		canvas.height = logH * dpr;
		canvas.style.height = `${logH}px`;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, logW, logH);

		for (let col = 0; col < WEEKS; col++) {
			for (let row = 0; row < 7; row++) {
				ctx.fillStyle = col * 7 + row < doneCount ? baseColor : darkColor;
				ctx.beginPath();
				ctx.roundRect(col * (cell + GAP), row * (cell + GAP), cell, cell, RADIUS);
				ctx.fill();
			}
		}
	}, [hue, doneCount]);

	// Draw on mount and whenever the canvas gets a real size
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		// Initial draw
		draw();
		// Re-draw when element resizes (handles framer-motion scale animation)
		const ro = new ResizeObserver(() => draw());
		ro.observe(canvas);
		return () => ro.disconnect();
	}, [draw]);

	return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
}

/* Single habit card */
function MockCard({ habit, index }: { habit: typeof MOCK_HABITS[number]; index: number }) {
	const [done, setDone] = useState(false);
	const isDark = typeof window !== 'undefined' && (
		window.matchMedia('(prefers-color-scheme: dark)').matches
		|| document.documentElement.style.colorScheme?.includes('dark')
	);
	const base = isDark ? `oklch(60% 0.13 ${habit.hue})` : `oklch(80% 0.2 ${habit.hue})`;
	const dark = isDark ? `oklch(30% 0.01 ${habit.hue})` : `oklch(96% 0.02 ${habit.hue})`;

	return (
		<motion.div
			className={styles.card}
			style={{ '--card-base': base, '--card-dark': dark } as React.CSSProperties}
			{...fadeUp(index * 0.07)}
			whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300 } }}
		>
			{/* Header — mirrors HabitHeader.tsx layout exactly */}
			<div className={styles.cardHeader}>
				<div className={styles.cardIcon}>{habit.icon}</div>
				<div className={styles.cardMeta}>
					<span className={styles.cardName}>{habit.name}</span>
					<small className={styles.cardStreak}>Streak: <strong>{habit.streak}</strong></small>
				</div>
				{/* Button: inline style for backgroundColor exactly like UpdateHabitProgress.tsx */}
				<motion.button
					className={styles.cardBtn}
					style={{ backgroundColor: done ? base : dark, color: done ? 'white' : undefined }}
					onClick={() => setDone(d => !d)}
					whileTap={{ scale: 0.88 }}
				>
					{done ? <FaCheck /> : <strong>0%</strong>}
				</motion.button>
			</div>
			{/* Calendar — matches .contentWrapper padding */}
			<div className={styles.cardCal}>
				<MockCalendar hue={habit.hue} doneCount={habit.doneCount} />
			</div>
		</motion.div>
	);
}

/* ─────────────────────────────────────────────────────────
   TRACKER SECTION
   Overlaps with the hero bottom — peeks ~180px into the
   hero viewport on load. On scroll it rises and scales up
   to full width. Uses sticky + scroll-driven transforms.
───────────────────────────────────────────────────────── */
function TrackerSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});
	// Starts at 78% scale (peeking small) → grows to full
	const scale = useTransform(scrollYProgress, [0, 0.45], [0.76, 1]);
	// Starts transparent → fully visible as it rises
	const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
	// Shifts upward as user scrolls: starts 60px below (peeking), rises to final position
	const y = useTransform(scrollYProgress, [0, 0.5], [80, 0]);

	return (
		<section ref={sectionRef} className={styles.trackerSection}>
			<motion.div className={styles.trackerWrap} style={{ scale, opacity, y }}>
				<div className={styles.trackerHead}>
					<span className={styles.trackerTitle}>My Habits</span>
					<span className={styles.trackerDate}>Today</span>
				</div>
				<div className={styles.trackerGrid}>
					{MOCK_HABITS.map((h, i) => (
						<MockCard key={h.id} habit={h} index={i} />
					))}
				</div>
			</motion.div>
		</section>
	);
}

/* ─────────────────────────────────────────────────────────
   LIVE FEED
───────────────────────────────────────────────────────── */
const FEED = [
	{ city: 'New York',  habit: 'Morning Workout', emoji: '💪', streak: 14 },
	{ city: 'London',    habit: 'Read 30min',       emoji: '📚', streak: 7  },
	{ city: 'Tokyo',     habit: 'Meditate',         emoji: '🧘', streak: 21 },
	{ city: 'Sydney',    habit: 'Drink Water',      emoji: '💧', streak: 30 },
	{ city: 'Berlin',    habit: 'Journal',           emoji: '✍️', streak: 5  },
	{ city: 'Toronto',   habit: 'Sleep 8hrs',        emoji: '😴', streak: 12 },
	{ city: 'Paris',     habit: 'Morning Run',       emoji: '🏃', streak: 8  },
	{ city: 'Seoul',     habit: 'Cold Shower',       emoji: '🚿', streak: 16 },
];

function LiveFeed() {
	const [items, setItems] = useState(() => FEED.slice(0, 4).map((d, i) => ({ ...d, uid: i })));
	const uid = useRef(100);
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: false });
	useEffect(() => {
		if (!inView) return;
		const t = setInterval(() => {
			const next = FEED[Math.floor(Math.random() * FEED.length)];
			uid.current++;
			setItems(p => [{ ...next, uid: uid.current }, ...p].slice(0, 5));
		}, 2400);
		return () => clearInterval(t);
	}, [inView]);
	return (
		<div className={styles.liveFeed} ref={ref}>
			<div className={styles.liveFeedHead}>
				<div className={styles.liveDot} />
				<span className={styles.liveFeedLabel}>Live activity</span>
			</div>
			<AnimatePresence mode='popLayout'>
				{items.map((item, i) => (
					<motion.div
						key={item.uid}
						className={styles.liveItem}
						layout
						initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
						animate={{ opacity: Math.max(0.2, 1 - i * 0.18), y: 0, height: 'auto', marginBottom: 6 }}
						exit={{ opacity: 0, height: 0, marginBottom: 0 }}
						transition={{ type: 'spring', stiffness: 280, damping: 26 }}
					>
						<span>{item.emoji}</span>
						<div className={styles.liveItemText}>
							<span>Someone in <strong>{item.city}</strong> tracked {item.habit}</span>
							<small>{item.streak}d streak</small>
						</div>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────
   HABIT SHOWCASE — tab list + real app-style card preview
───────────────────────────────────────────────────────── */
const SHOWCASE_HABITS = [
	{ id: 'workout', hue: 260, icon: '💪', name: 'Morning Workout', streak: 14, doneCount: 16 },
	{ id: 'read',    hue: 30,  icon: '📚', name: 'Read 30 min',     streak: 7,  doneCount: 8  },
	{ id: 'water',   hue: 200, icon: '💧', name: 'Drink Water',     streak: 21, doneCount: 24 },
	{ id: 'meditate',hue: 80,  icon: '🧘', name: 'Meditate',        streak: 5,  doneCount: 5  },
	{ id: 'journal', hue: 340, icon: '✍️', name: 'Journal',          streak: 3,  doneCount: 3  },
	{ id: 'sleep',   hue: 160, icon: '😴', name: 'Sleep 8hrs',      streak: 9,  doneCount: 9  },
];

function HabitShowcase() {
	const [activeId, setActiveId] = useState('workout');
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const active = SHOWCASE_HABITS.find(h => h.id === activeId)!;
	return (
		<div className={styles.showcase} ref={ref}>
			<div className={styles.showcaseTabs}>
				{SHOWCASE_HABITS.map((h, i) => (
					<motion.button
						key={h.id}
						className={`${styles.tab}${h.id === activeId ? ` ${styles.tabActive}` : ''}`}
						onClick={() => setActiveId(h.id)}
						initial={{ opacity: 0, x: -16 }}
						animate={inView ? { opacity: 1, x: 0 } : {}}
						transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
						whileTap={{ scale: 0.97 }}
					>
						<span>{h.icon}</span>
						<span className={styles.tabName}>{h.name}</span>
						<span className={styles.tabStreak}>{h.streak}d 🔥</span>
					</motion.button>
				))}
			</div>
			<AnimatePresence mode='wait'>
				<motion.div
					key={active.id}
					className={styles.showcasePreview}
					initial={{ opacity: 0, x: 16, scale: 0.97 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{ opacity: 0, x: -16, scale: 0.97 }}
					transition={{ type: 'spring', stiffness: 280, damping: 26 }}
				>
					<MockCard habit={active} index={0} />
					<p className={styles.showcaseHint}>Select a habit from the left ↗</p>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────
   STATS TICKER
───────────────────────────────────────────────────────── */
function StatsTicker() {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: '-60px' });
	const STATS = [
		{ n: 100, sfx: '%', label: 'Privacy guaranteed' },
		{ n: 0,   sfx: '',  label: 'Servers used'       },
		{ n: 42,  sfx: '+', label: 'Habit templates'    },
		{ n: 365, sfx: '',  label: 'Days of tracking'   },
	];
	return (
		<div className={styles.ticker} ref={ref}>
			{STATS.map((s, i) => (
				<motion.div
					key={s.label}
					className={styles.tickerItem}
					initial={{ opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ delay: i * 0.1, type: 'spring', stiffness: 280, damping: 24 }}
				>
					<span className={styles.tickerVal}>
						{inView ? <AnimatedNumber target={s.n} duration={1200 + i * 150} /> : 0}{s.sfx}
					</span>
					<span className={styles.tickerLbl}>{s.label}</span>
				</motion.div>
			))}
		</div>
	);
}

/* ─────────────────────────────────────────────────────────
   MAIN WELCOME VIEW
───────────────────────────────────────────────────────── */
function WelcomeView() {
	const { t } = useTranslation();
	const { status, handleInstall } = usePwaInstall();
	const settingsDispatch = useSettingsStore((s) => s.settingsDispatch);
	const handleContinue = () => settingsDispatch({ type: 'updateSettings', payload: { hasSeenWelcome: true } });

	// Mouse-reactive spotlight in hero
	const heroRef = useRef<HTMLElement>(null);
	const spotX = useRef(50);
	const spotY = useRef(40);
	const [spotlight, setSpotlight] = useState({ x: 50, y: 40, visible: false });

	const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		spotX.current = ((e.clientX - rect.left) / rect.width) * 100;
		spotY.current = ((e.clientY - rect.top) / rect.height) * 100;
		setSpotlight({ x: spotX.current, y: spotY.current, visible: true });
	}, []);

	const handleHeroMouseLeave = useCallback(() => {
		setSpotlight(s => ({ ...s, visible: false }));
	}, []);

	const benefits: { icon: ReactNode; title: string; description: string }[] = [
		{ icon: <FaShieldAlt />, title: t('welcome.benefits.privacy.title'), description: t('welcome.benefits.privacy.desc') },
		{ icon: <FaLock />,      title: t('welcome.benefits.secure.title'),  description: t('welcome.benefits.secure.desc')  },
		{ icon: <FaPlane />,     title: t('welcome.benefits.offline.title'), description: t('welcome.benefits.offline.desc') },
		{ icon: <FaBoltLightning />, title: t('welcome.benefits.simplicity.title'), description: t('welcome.benefits.simplicity.desc') },
	];

	const steps: { icon: ReactNode; title: string; desc: string }[] = [
		{ icon: <FaListCheck />,   title: 'Create a habit', desc: 'Name it, pick an icon and color, add sub-tasks.'      },
		{ icon: <FaCheck />,       title: 'Track daily',    desc: 'Mark completions, log notes, watch your streak grow.' },
		{ icon: <FaChartSimple />, title: 'See progress',   desc: 'Visual stats, calendar heatmap, achievement badges.'  },
	];

	return (
		<div className={styles.page}>

			{/* ─── Background FX ─── */}
			<div className={styles.bg} aria-hidden>
				<div className={styles.bgGrid} />
				<div className={styles.bgVignette} />
				<div className={styles.bgScanline} />
				<motion.div className={styles.bgOrb}
					style={{ top: '5%', left: '-5%', width: 700, height: 700 }}
					animate={{ x: [0, 60, 0], y: [0, -50, 0] }}
					transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
				<motion.div className={styles.bgOrb}
					style={{ bottom: '10%', right: '-8%', width: 600, height: 600 }}
					animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
					transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
			</div>

			{/* ─── Navigation ─── */}
			<motion.header className={styles.nav} {...fadeIn(0)}>
				<div className={styles.navInner}>
					<div className={styles.navLeft}>
						<img src={`${BASE_URL}assets/brand/wordmark.png`} alt={t('common.logo')} className={styles.logo} />
						<nav className={styles.navLinks}>
							<a className={styles.navLink} href="#features">Features</a>
							<a className={styles.navLink} href="#github">GitHub</a>
							<a className={styles.navLink} href="#changelog">Changelog</a>
						</nav>
					</div>
					<div className={styles.navRight}>
						<div className={styles.navBadge}>
							<span className={styles.navBadgeDot} />
							<span>v1.0.0</span>
						</div>
						<Button variant='text' className={styles.navOpenBtn} onClick={handleContinue}>{t('common.continue')}</Button>
						<Button className={styles.navInstallBtn} onClick={status === 'INSTALLED' ? handleContinue : handleInstall}>
							{status === 'INSTALLED' ? t('common.continue') : t('welcome.actions.install')}
						</Button>
					</div>
				</div>
			</motion.header>

			{/* ─── Hero ─── */}
			<section
				ref={heroRef}
				className={styles.hero}
				onMouseMove={handleHeroMouseMove}
				onMouseLeave={handleHeroMouseLeave}
			>
				{/* Mouse-reactive spotlight */}
				<motion.div
					className={styles.heroSpotlight}
					animate={{
						opacity: spotlight.visible ? 1 : 0,
						background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 35%, transparent 70%)`,
					}}
					transition={{ opacity: { duration: 0.3 }, background: { duration: 0.06 } }}
				/>

				<motion.div className={styles.heroBadge} {...fadeUp(0.05)}>
					<span className={styles.heroBadgeDot} />
					<span className={styles.heroBadgeText}>Open Source · Free Forever</span>
				</motion.div>

				<motion.h1 className={styles.title} {...fadeUp(0.12)}>
					<span className={styles.titleLine} data-text="Build your routine.">
						Build your routine.
					</span>
					<span className={styles.titleLineAccent}>Own your data.</span>
				</motion.h1>

				<motion.p className={styles.subtitle} {...fadeUp(0.2)}>
					<TypingText text="A lightweight habit assistant with visual stats, streak tracking, and a built-in journal." delay={300} />
				</motion.p>

				<motion.div className={styles.chips} {...fadeUp(0.28)}>
					{['📊 Visual stats','🔥 Streak tracking','📓 Progress journal','🔒 100% offline','⚡ Zero setup'].map((c, i) => (
						<motion.span
							key={c}
							className={styles.chip}
							initial={{ opacity: 0, scale: 0.82 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.45 + i * 0.06, type: 'spring', stiffness: 300 }}
						>
							{c}
						</motion.span>
					))}
				</motion.div>

				<motion.div className={styles.heroScroll} {...fadeUp(0.5)}>
					<div className={styles.heroScrollLine} />
					<span className={styles.heroScrollLabel}>scroll to explore</span>
				</motion.div>
			</section>

			{/* ─── Tracker Section ─── */}
			<TrackerSection />

			{/* ─── How it works ─── */}
			<section className={styles.section}>
				<div className={styles.inner}>
					<motion.h2 className={styles.sectionTitle}
						initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
						How it works
					</motion.h2>
					<motion.p className={styles.sectionSub}
						initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}>
						Three simple steps to build habits that actually stick.
					</motion.p>
					<div className={styles.stepsGrid}>
						{steps.map((s, i) => (
							<motion.div
								key={s.title} className={styles.stepCard}
								custom={i} variants={cardReveal}
								initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-40px' }}
								whileHover={{ y: -4 }}
							>
								<span className={styles.stepNum}>STEP 0{i + 1}</span>
								<span className={styles.stepIcon}>{s.icon}</span>
								<h3 className={styles.stepTitle}>{s.title}</h3>
								<p className={styles.stepDesc}>{s.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Try it yourself ─── */}
			<section className={`${styles.section} ${styles.sectionAlt}`}>
				<div className={styles.inner}>
					<motion.h2 className={styles.sectionTitle}
						initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
						Try it yourself
					</motion.h2>
					<motion.p className={styles.sectionSub}
						initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}>
						Select a habit and see how Habitza tracks your progress.
					</motion.p>
					<div className={styles.tryLayout}>
						<HabitShowcase />
						<LiveFeed />
					</div>
				</div>
			</section>

			{/* ─── Built different ─── */}
			<section className={styles.section}>
				<div className={styles.inner}>
					<motion.h2 className={styles.sectionTitle}
						initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
						Built different
					</motion.h2>
					<motion.p className={styles.sectionSub}
						initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}>
						No servers. No accounts. Just your data, on your device.
					</motion.p>
					<StatsTicker />
					<div className={styles.statsGrid}>
						{[
							{ label: '100% Offline', desc: 'Works without internet' },
							{ label: 'Zero Setup',   desc: 'No accounts, no servers' },
							{ label: 'Your Data',    desc: 'Stored locally, always yours' },
							{ label: 'Open Source',  desc: 'Transparent, auditable code' },
						].map((h, i) => (
							<motion.div key={h.label} className={styles.statCard}
								custom={i} variants={cardReveal}
								initial='hidden' whileInView='visible' viewport={{ once: true }}
								whileHover={{ y: -4 }}>
								<strong className={styles.statVal}>{h.label}</strong>
								<span className={styles.statLbl}>{h.desc}</span>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ─── Why Habitza ─── */}
			<section className={`${styles.section} ${styles.sectionAlt}`}>
				<div className={styles.inner}>
					<motion.h2 className={styles.sectionTitle}
						initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
						Why Habitza
					</motion.h2>
					<motion.p className={styles.sectionSub}
						initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}>
						Every design choice is intentional — privacy first, always.
					</motion.p>
					<div className={styles.benefitsGrid}>
						{benefits.map((b, i) => (
							<motion.div key={b.title} className={styles.benefitCard}
								custom={i} variants={cardReveal}
								initial='hidden' whileInView='visible' viewport={{ once: true }}
								whileHover={{ y: -3 }}>
								<span className={styles.benefitIcon}>{b.icon}</span>
								<div>
									<strong className={styles.benefitTitle}>{b.title}</strong>
									<p className={styles.benefitDesc}>{b.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* ─── CTA ─── */}
			<section className={styles.ctaSection}>
				<motion.div className={styles.cta}
					initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
					<div className={styles.ctaBg} aria-hidden>42</div>
					<h2 className={styles.ctaTitle}>Ready to build your routine?</h2>
					<p className={styles.ctaDesc}>Start tracking in seconds. No sign-up, no commitment.</p>
					<div className={styles.ctaActions}>
						<Button className={styles.ctaBtn} onClick={status === 'INSTALLED' ? handleContinue : handleInstall}>
							{status === 'INSTALLED' ? t('common.continue') : t('welcome.actions.install')}
						</Button>
						<Button variant='secondary' className={styles.ctaBtnSecondary} onClick={handleContinue}>
							{t('welcome.actions.continue')}
						</Button>
					</div>
				</motion.div>
			</section>

			{/* ─── Footer ─── */}
			<footer className={styles.footer}>
				<img src={`${BASE_URL}assets/brand/wordmark.png`} alt={t('common.logo')} className={styles.footerLogo} />
				<nav className={styles.footerLinks}>
					<span className={styles.footerLink}>GitHub</span>
					<span className={styles.footerLink}>Privacy</span>
					<span className={styles.footerLink}>Changelog</span>
				</nav>
				<small className={styles.footerText}>
					A lightweight habit assistant. No accounts, no servers, just your data.
				</small>
			</footer>
		</div>
	);
}

export { WelcomeView };
