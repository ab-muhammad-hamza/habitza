import styles from './ModalLayout.module.css';
import { useContext, type ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { motion } from 'framer-motion'
import ModalHeader from './ModalHeader';
import { DirectionContext, useInitialRouteState } from '@shared/lib/router';
import { modalMotionProps } from '../model/modal.animations';

interface ModalLayoutProps {
	children?: ReactNode;
}

function ModalLayout({ children }: ModalLayoutProps) {
	const navigate = useNavigate();
	const direction = useContext(DirectionContext);
	const { modalTitle } = useInitialRouteState();

	const handleClose = () => navigate(-1);

	return (
		<motion.div
			className={styles.modal}
			custom={direction}
			{...modalMotionProps}
		>
			<ModalHeader
				title={modalTitle ?? 'Habitza'}
				onClose={handleClose}
			/>

			<div
				id='modalChildrenWrapper'
				className={styles.content}
			>
				{children ?? <Outlet />}
			</div>
		</motion.div>
	);
}

export { ModalLayout };
