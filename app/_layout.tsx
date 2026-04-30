import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useMotelStore } from '../store/useMotelStore';

export default function RootLayout() {
  const hydrate = useMotelStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
