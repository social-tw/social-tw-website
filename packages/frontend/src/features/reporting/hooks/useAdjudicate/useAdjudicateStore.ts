import { create } from 'zustand';

interface AdjudicateState {
    AdjuducateDialogOpen: boolean;
    setAdjuducateDialogOpen: (value: boolean) => void;
}

export const useAdjudicateStore = create<AdjudicateState>((set) => ({
    AdjuducateDialogOpen: false,
    setAdjuducateDialogOpen: (value) => set({ AdjuducateDialogOpen: value }),
}));
