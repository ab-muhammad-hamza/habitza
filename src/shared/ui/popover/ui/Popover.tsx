import styles from './Popover.module.css';
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePopoverStore } from '../model/store';
import { variants } from '../model/animations';
import { Button } from '@shared/ui';

function Popover() {
	const content = usePopoverStore((s) => s.content);
	const close = usePopoverStore((s) => s.close);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!content) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};

		const onClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				close();
			}
		};

		const onScroll = () => close();

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('mousedown', onClickOutside);
		window.addEventListener('scroll', onScroll, true);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('mousedown', onClickOutside);
			window.removeEventListener('scroll', onScroll, true);
		};
	}, [content, close]);

	if (!content) return null;

	const menuWidth = 200;
	let left = content.x;
	let top = content.y;

	const actionsHeight = 48 * content.actions.length + 60;
	const overflowX = left + menuWidth + 12 > window.innerWidth;
	const overflowY = top + actionsHeight > window.innerHeight;

	if (overflowX) left = window.innerWidth - menuWidth - 12;
	if (overflowY) top = window.innerHeight - actionsHeight - 12;

	left = Math.max(12, left);
	top = Math.max(12, top);

	return createPortal(
		<AnimatePresence>
			<motion.div
				ref={menuRef}
				key='popover'
				className={styles.menu}
				style={{ left, top, width: menuWidth }}
				variants={variants}
				initial='initial'
				animate='animate'
				exit='exit'
			>
				{content.title && (
					<div className={styles.title}>{content.title}</div>
				)}
				<ul className={styles.actions} onClick={close}>
					{content.actions.map(({ label, onClick, ...action }) => (
						<li key={label}>
							<Button
								className={styles.actionButton}
								onClick={(e) => {
									onClick?.(e);
									close();
								}}
								{...action}
							>
								<span>{label}</span>
							</Button>
						</li>
					))}
				</ul>
			</motion.div>
		</AnimatePresence>,
		document.body
	);
}

export { Popover };
