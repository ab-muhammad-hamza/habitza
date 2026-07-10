import type { ButtonProps } from '@shared/ui';

export interface PopoverAction extends ButtonProps {
	label: string;
}

export interface PopoverContent {
	title?: string;
	actions: PopoverAction[];
	x: number;
	y: number;
}

export interface PopoverState {
	content?: PopoverContent | null;
	open: (content: PopoverContent) => void;
	close: () => void;
}
