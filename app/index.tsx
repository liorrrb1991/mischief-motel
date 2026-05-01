import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMotelStore } from '../store/useMotelStore';
import { Room } from '../store/types';

type RoomCardProps = {
  room: Room;
  assignable: boolean;
  onPress: () => void;
};

function RoomCard({ room, assignable, onPress }: RoomCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (assignable) {
      animation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.current.start();
    } else {
      animation.current?.stop();
      animation.current = null;
      Animated.timing(scale, { toValue: 1.0, duration: 150, useNativeDriver: true }).start();
    }
    return () => {
      animation.current?.stop();
    };
  }, [assignable]);

  const isEmpty = room.status === 'empty';

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.room,
          assignable && styles.roomAssignable,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.roomId}>{room.id}</Text>

        {room.occupiedBy ? (
          <Text style={styles.roomGuestEmoji}>{room.occupiedBy.emoji}</Text>
        ) : (
          <Text style={styles.roomType}>{room.type}</Text>
        )}

        {isEmpty && (
          <Text style={[styles.roomHint, assignable && styles.roomHintAssignable]}>
            {assignable ? 'tap to assign' : 'empty'}
          </Text>
        )}

        {!isEmpty && room.occupiedBy && (
          <Text style={styles.roomOccupantName}>{room.occupiedBy.name}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const queue = useMotelStore((s) => s.queue);
  const rooms = useMotelStore((s) => s.rooms);
  const selectedGuestId = useMotelStore((s) => s.selectedGuestId);
  const selectGuest = useMotelStore((s) => s.selectGuest);
  const assignGuest = useMotelStore((s) => s.assignGuest);

  const hasSelection = selectedGuestId !== null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>💰 Gold: 100</Text>
        <Text style={styles.topBarText}>Day: 1</Text>
      </View>

      <Text style={styles.sectionTitle}>Lobby Queue</Text>
      <View style={styles.queue}>
        {queue.map((guest) => {
          const selected = guest.id === selectedGuestId;
          return (
            <Pressable
              key={guest.id}
              onPress={() => selectGuest(guest.id)}
              style={[styles.guestCard, selected && styles.guestCardSelected]}
            >
              <Text style={styles.guestEmoji}>{guest.emoji}</Text>
              <Text style={[styles.guestName, selected && styles.guestNameSelected]}>
                {guest.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Floor Plan</Text>
      <View style={styles.grid}>
        {rooms.map((room) => {
          const assignable = hasSelection && room.status === 'empty';
          return (
            <RoomCard
              key={room.id}
              room={room}
              assignable={assignable}
              onPress={() => assignable && assignGuest(room.id)}
            />
          );
        })}
      </View>

      {hasSelection && (
        <Text style={styles.assignHint}>Tap a glowing room to assign</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  topBarText: {
    color: '#e8d5b7',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  queue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  guestCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  guestCardSelected: {
    backgroundColor: '#3a2e0a',
    borderColor: '#c9a84c',
  },
  guestEmoji: {
    fontSize: 28,
  },
  guestName: {
    color: '#e8d5b7',
    fontSize: 12,
  },
  guestNameSelected: {
    color: '#c9a84c',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  room: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roomAssignable: {
    backgroundColor: '#0d2e2c',
    borderColor: '#4ecdc4',
  },
  roomId: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomType: {
    color: '#e8d5b7',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roomGuestEmoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  roomOccupantName: {
    color: '#e8d5b7',
    fontSize: 12,
  },
  roomHint: {
    color: '#555',
    fontSize: 12,
  },
  roomHintAssignable: {
    color: '#4ecdc4',
  },
  assignHint: {
    color: '#4ecdc4',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.85,
  },
});
