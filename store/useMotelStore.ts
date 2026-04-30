import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MotelState {
  checkedIn: boolean;
  checkIn: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useMotelStore = create<MotelState>((set) => ({
  checkedIn: false,

  checkIn: async () => {
    set({ checkedIn: true });
    await AsyncStorage.setItem('checkedIn', 'true');
  },

  hydrate: async () => {
    const value = await AsyncStorage.getItem('checkedIn');
    if (value === 'true') set({ checkedIn: true });
  },
}));
