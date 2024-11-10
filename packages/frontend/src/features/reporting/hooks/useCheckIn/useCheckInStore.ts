import { create } from 'zustand';

interface CheckInState {
    isOpenCheckIn: boolean;
    toggleCheckIn: (value: boolean) => void;
}

export const useCheckInStore = create<CheckInState>((set) => ({
    isOpenCheckIn: false,
    toggleCheckIn: (value) => set({ isOpenCheckIn: value }),
}));
