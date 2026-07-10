import type { ComponentType } from 'react';
import type { IconType } from 'react-icons';
import type { ButtonProps } from '@shared/ui';

export interface ContextMenuAction extends Omit<ButtonProps, 'icon'> {
	label: string;
	icon?: IconType | ComponentType<{ size?: number }>;
}

export interface ContextMenuState {
	content?: {
		title?: string;
		actions: ContextMenuAction[];
		x: number;
		y: number;
	} | null;
	open: (content: { title?: string; actions: ContextMenuAction[]; x: number; y: number }) => void;
	close: () => void;
}
