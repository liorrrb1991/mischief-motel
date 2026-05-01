import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest, Room } from './types';
import { GUEST_TEMPLATES, INITIAL_ROOMS } from './gameData';

const STORAGE_KEY = 'motel_state';
const MAX_QUEUE = 6;

interface MotelState {
  gold: number;
  day: number;
  rooms: Room[];
  queue: Guest[];
  selectedGuestId: string | null;

  selectGuest: (id: string | null) => void;
  assignGuest: (roomId: string) => void;
  resolveEvent: (roomId: string, choiceIdx: number) => void;
  collectTip: (roomId: string) => void;
  spawnGuest: () => void;
  checkAndSpawn: () => void;

  hydrate: () => Promise<void>;
  save: () => Promise<void>;
}

export const useMotelStore = create<MotelState>((set, get) => ({
  gold: 100,
  day: 1,
  rooms: JSON.parse(JSON.stringify(INITIAL_ROOMS)),
  queue: [],
  selectedGuestId: null,

  selectGuest: (id) => {
    const current = get().selectedGuestId;
    set({ selectedGuestId: current === id ? null : id });
    get().save();
  },

  assignGuest: (roomId) => {
    const { queue, selectedGuestId, rooms } = get();
    const guest = queue.find((g) => g.id === selectedGuestId);
    const room = rooms.find((r) => r.id === roomId && r.status === 'empty');
    if (!guest || !room) return;

    const eventDelay = 5000 + Math.random() * 5000;

    set({
      queue: queue.filter((g) => g.id !== selectedGuestId),
      rooms: rooms.map((r) =>
        r.id === roomId
          ? { ...r, occupiedBy: guest, status: 'occupied', assignedAt: Date.now(), eventDelay }
          : r
      ),
      selectedGuestId: null,
    });

    get().save();
    get().checkAndSpawn();
  },

  resolveEvent: (roomId, choiceIdx) => {
    const { rooms } = get();
    set({
      rooms: rooms.map((r) => {
        if (r.id !== roomId || !r.pendingEvent) return r;
        return {
          ...r,
          chosenMultiplier: r.pendingEvent.choices[choiceIdx].tipMultiplier,
          pendingEvent: null,
          status: 'ready',
        };
      }),
    });
    get().save();
  },

  collectTip: (roomId) => {
    const { rooms, gold } = get();
    const room = rooms.find((r) => r.id === roomId && r.status === 'ready');
    if (!room || !room.occupiedBy) return;

    const guest = room.occupiedBy;
    const roomMatchMultiplier = guest.prefersRoomType === room.type ? 2.0 : 1.0;
    const lightingBonus =
      guest.prefersLighting === 'any' || guest.prefersLighting === room.lighting ? 1.3 : 1.0;
    const eventMultiplier = room.chosenMultiplier ?? 1.0;
    const finalTip = Math.round(guest.baseTip * roomMatchMultiplier * lightingBonus * eventMultiplier);

    set({
      gold: gold + finalTip,
      rooms: rooms.map((r) =>
        r.id === roomId
          ? { ...r, occupiedBy: null, status: 'empty', assignedAt: null, eventDelay: null, pendingEvent: null, chosenMultiplier: null }
          : r
      ),
    });

    get().save();
    get().checkAndSpawn();
  },

  spawnGuest: () => {
    const { queue } = get();
    if (queue.length >= MAX_QUEUE) return;
    const template = GUEST_TEMPLATES[Math.floor(Math.random() * GUEST_TEMPLATES.length)];
    const guest: Guest = { ...template, id: `${template.id}_${Date.now()}` };
    set({ queue: [...queue, guest] });
  },

  checkAndSpawn: () => {
    if (get().queue.length < 2) {
      get().spawnGuest();
    }
  },

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Pick<MotelState, 'gold' | 'day' | 'rooms' | 'queue'>;
      set({ gold: saved.gold, day: saved.day, rooms: saved.rooms, queue: saved.queue });
    }
    get().checkAndSpawn();
  },

  save: async () => {
    const { gold, day, rooms, queue } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ gold, day, rooms, queue }));
  },
}));
