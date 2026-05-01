import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useMotelStore } from '../store/useMotelStore';

export default function RootLayout() {
  const hydrate = useMotelStore((s) => s.hydrate);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    hydrate().then(() => {
      const state = useMotelStore.getState();
      console.log('[MischiefMotel] Initial state after hydrate:', JSON.stringify({
        gold: state.gold,
        day: state.day,
        queue: state.queue.map((g) => ({ id: g.id, name: g.name, emoji: g.emoji })),
        rooms: state.rooms.map((r) => ({
          id: r.id,
          type: r.type,
          lighting: r.lighting,
          status: r.status,
          occupiedBy: r.occupiedBy?.name ?? null,
        })),
      }, null, 2));
    });

    intervalRef.current = setInterval(() => {
      const { rooms } = useMotelStore.getState();
      const now = Date.now();

      rooms.forEach((room) => {
        if (
          room.status === 'occupied' &&
          room.assignedAt !== null &&
          room.eventDelay !== null &&
          room.occupiedBy !== null &&
          now - room.assignedAt > room.eventDelay
        ) {
          useMotelStore.setState((s) => ({
            rooms: s.rooms.map((r) =>
              r.id === room.id
                ? { ...r, status: 'event', pendingEvent: r.occupiedBy!.event }
                : r
            ),
          }));
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
