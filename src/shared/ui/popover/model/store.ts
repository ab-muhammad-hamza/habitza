import { create } from 'zustand';
import type { PopoverContent, PopoverState } from './types';

export const usePopoverStore = create<PopoverState>((set) => ({
	content: null,
	open: (content: PopoverContent) => set({ content }),
	close: () => set({ content: null })
}));
