import { create } from 'zustand';
import type { ContextMenuState } from './types';

export const useContextMenuStore = create<ContextMenuState>(
	(set) => ({
		content: null,
		open: (content) => set({ content }),
		close: () => set({ content: null })
	})
);
