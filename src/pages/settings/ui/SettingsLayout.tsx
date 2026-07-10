import styles from './SettingsLayout.module.css';
import { useNavigate, Outlet, useLocation } from 'react-router';
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DirectionContext, useInitialRouteState, getRoutePath } from '@shared/lib/router';
import { modalMotionProps } from '@shared/ui/modal-layout/model/modal.animations';
import ModalHeader from '@shared/ui/modal-layout/ui/ModalHeader';
import { useTranslation } from 'react-i18next';
import useListItems from '@pages/menu/model/useListItems';
import { List } from '@shared/ui';

function SettingsLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const direction = useContext(DirectionContext);
	const { t } = useTranslation();
	const { habitItems, settingsItems, supportItems } = useListItems();
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
	const { modalTitle } = useInitialRouteState();

	useEffect(() => {
		const onResize = () => setIsDesktop(window.innerWidth >= 1024);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	// On desktop, redirect index route to first sub-page
	const isIndexRoute = location.pathname === getRoutePath('MENU');
	useEffect(() => {
		if (isDesktop && isIndexRoute) {
			navigate('/settings/appearance', { replace: true });
		}
	}, [isDesktop, isIndexRoute, navigate]);

	const handleClose = () => navigate(-1);

	return (
		<motion.div
			className={styles.layout}
			custom={direction}
			{...modalMotionProps}
		>
			<ModalHeader
				title={modalTitle ?? t('menu.title')}
				onClose={handleClose}
			/>
			<div className={styles.body}>
				{isDesktop && (
					<aside className={styles.sidebar}>
						<List title={t('common.habits')} items={habitItems} />
						<List title={t('common.settings')} items={settingsItems} />
						<List title={t('common.support')} items={supportItems} />
					</aside>
				)}
				<div className={styles.content}>
					<Outlet />
				</div>
			</div>
		</motion.div>
	);
}

export { SettingsLayout };
