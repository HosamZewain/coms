import { create } from 'zustand';
import api from '../lib/api';

interface AttendanceState {
    isCheckedIn: boolean;
    checkInTime: string | null;
    isLoading: boolean;
    fetchStatus: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    isCheckedIn: false,
    checkInTime: null,
    isLoading: false,

    fetchStatus: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/attendance/me');
            const history = res.data.data;
            if (history.length > 0) {
                const lastRecord = history[0];
                if (!lastRecord.checkOutTime) {
                    set({
                        isCheckedIn: true,
                        checkInTime: lastRecord.checkInTime
                    });
                } else {
                    set({
                        isCheckedIn: false,
                        checkInTime: null
                    });
                }
            } else {
                set({ isCheckedIn: false, checkInTime: null });
            }
        } catch (error) {
            console.error('Failed to fetch attendance status:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    refresh: async () => {
        await useAttendanceStore.getState().fetchStatus();
    }
}));
