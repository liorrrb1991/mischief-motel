import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMotelStore } from '../store/useMotelStore';
import { Guest, Room } from '../store/types';

function calcTip(room: Room): number {
  if (!room.occupiedBy) return 0;
  const guest = room.occupiedBy;
  const roomMatch = guest.prefersRoomType === room.type ? 2.0 : 1.0;
  const lighting = guest.prefersLighting === 'any' || guest.prefersLighting === room.lighting ? 1.3 : 1.0;
  const event = room.chosenMultiplier ?? 1.0;
  return Math.round(guest.baseTip * roomMatch * lighting * event);
}

function GuestCard({ guest, selected, onPress }: { guest: Guest; selected: boolean; onPress: () => void }) {
  const slideX = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.guestCard,
          selected && styles.guestCardSelected,
          { opacity, transform: [{ translateX: slideX }] },
        ]}
      >
        <Text style={styles.guestEmoji}>{guest.emoji}</Text>
        <Text style={[styles.guestName, selected && styles.guestNameSelected]}>
          {guest.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

type RoomCardProps = {
  room: Room;
  assignable: boolean;
  tipAmount: number | null;
  showPerfectMatch: boolean;
  gold: number;
  onPress: () => void;
  onUpgrade: () => void;
};

function RoomCard({ room, assignable, tipAmount, showPerfectMatch, gold, onPress, onUpgrade }: RoomCardProps) {
  // JS driver — border color + bounce share same Animated.View
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const prevStatusRef = useRef(room.status);
  const showPerfectMatchRef = useRef(false);

  // Native driver — child Animated.Views are independent
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const floatScale = useRef(new Animated.Value(1)).current;
  const matchOpacity = useRef(new Animated.Value(0)).current;
  const matchY = useRef(new Animated.Value(0)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;
  const badgePulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const animatedBorderColor = glowAnim.interpolate({
    inputRange: [0.4, 1.0],
    outputRange: ['rgba(78, 205, 196, 0.4)', 'rgba(78, 205, 196, 1.0)'],
  });

  // Sync ref before bounce effect reads it — both fire after same render, in order
  useEffect(() => {
    showPerfectMatchRef.current = showPerfectMatch;
  }, [showPerfectMatch]);

  useEffect(() => {
    if (assignable) {
      glowLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1.0, duration: 600, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 600, useNativeDriver: false }),
        ])
      );
      glowLoop.current.start();
    } else {
      glowLoop.current?.stop();
      glowLoop.current = null;
      glowAnim.setValue(0.4);
    }
    return () => { glowLoop.current?.stop(); };
  }, [assignable]);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = room.status;

    if (prev === 'empty' && room.status === 'occupied') {
      if (showPerfectMatchRef.current) {
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.2, duration: 150, useNativeDriver: false }),
          Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: false }),
          Animated.timing(bounceAnim, { toValue: 1.05, duration: 200, useNativeDriver: false }),
          Animated.timing(bounceAnim, { toValue: 1.0, duration: 150, useNativeDriver: false }),
        ]).start();
      } else {
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.12, duration: 120, useNativeDriver: false }),
          Animated.timing(bounceAnim, { toValue: 0.95, duration: 120, useNativeDriver: false }),
          Animated.timing(bounceAnim, { toValue: 1.0, duration: 160, useNativeDriver: false }),
        ]).start();
      }
    }
  }, [room.status]);

  useEffect(() => {
    if (room.status === 'event') {
      badgePulseAnim.setValue(1);
      badgePulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
          Animated.timing(badgePulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      badgePulseLoop.current.start();
    } else {
      badgePulseLoop.current?.stop();
      badgePulseLoop.current = null;
      badgePulseAnim.setValue(1);
    }
    return () => { badgePulseLoop.current?.stop(); };
  }, [room.status]);

  useEffect(() => {
    if (showPerfectMatch) {
      matchOpacity.setValue(0);
      matchY.setValue(0);
      setTimeout(() => {
        matchOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(matchOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(matchY, { toValue: -30, duration: 1000, useNativeDriver: true }),
        ]).start();
      }, 600);
    }
  }, [showPerfectMatch]);

  useEffect(() => {
    if (tipAmount !== null) {
      floatOpacity.setValue(1);
      floatY.setValue(0);
      floatScale.setValue(0.5);
      Animated.parallel([
        Animated.timing(floatOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: -60, duration: 1200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(floatScale, { toValue: 1.3, duration: 350, useNativeDriver: true }),
          Animated.timing(floatScale, { toValue: 1.0, duration: 850, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [tipAmount]);

  const isEmpty = room.status === 'empty';
  const isEvent = room.status === 'event';
  const isReady = room.status === 'ready';
  const hasGuest = room.occupiedBy !== null;

  return (
    <Pressable onPress={onPress} style={styles.roomWrapper}>
      <Animated.View
        style={[
          styles.room,
          room.type === 'cozy' && styles.roomCozy,
          assignable && styles.roomAssignable,
          assignable && { borderColor: animatedBorderColor },
          isEvent && styles.roomEvent,
          isReady && styles.roomReady,
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <Text style={styles.roomId}>{room.id}</Text>

        {hasGuest ? (
          <View style={styles.roomGuestCenter}>
            <Text style={styles.roomGuestEmoji}>{room.occupiedBy!.emoji}</Text>
            <Text style={styles.roomOccupantName}>{room.occupiedBy!.name}</Text>
          </View>
        ) : (
          <Text style={styles.roomType}>
            {room.type === 'cozy' ? '🌙 Cozy' : 'Standard'}
          </Text>
        )}

        {isEmpty ? (
          <View style={styles.roomBottom}>
            <Text style={[styles.roomHint, assignable && styles.roomHintAssignable]}>
              {assignable ? 'tap to assign' : 'empty'}
            </Text>
            {room.type === 'standard' && (
              <Pressable
                style={[styles.upgradeButton, gold < 100 && styles.upgradeButtonDisabled]}
                onPress={onUpgrade}
                disabled={gold < 100}
              >
                <Text style={[styles.upgradeButtonText, gold < 100 && styles.upgradeButtonTextDisabled]}>
                  ✨ Upgrade to Cozy (100g)
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View />
        )}

        {isEvent && (
          <Animated.View style={[styles.badgeEvent, { transform: [{ scale: badgePulseAnim }] }]}>
            <Text style={styles.badgeEventText}>!</Text>
          </Animated.View>
        )}

        {isReady && (
          <View style={styles.badgeReady}>
            <Text style={styles.badgeReadyText}>💰</Text>
          </View>
        )}

        {tipAmount !== null && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.floatingTipContainer,
              { opacity: floatOpacity, transform: [{ translateY: floatY }, { scale: floatScale }] },
            ]}
          >
            <Text style={styles.floatingTipText}>+{tipAmount} gold</Text>
          </Animated.View>
        )}

        <Animated.View
          pointerEvents="none"
          style={[styles.floatingMatchContainer, { opacity: matchOpacity, transform: [{ translateY: matchY }] }]}
        >
          <Text style={styles.floatingMatchText}>✨ Perfect match!</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const queue = useMotelStore((s) => s.queue);
  const rooms = useMotelStore((s) => s.rooms);
  const gold = useMotelStore((s) => s.gold);
  const day = useMotelStore((s) => s.day);
  const selectedGuestId = useMotelStore((s) => s.selectedGuestId);
  const selectGuest = useMotelStore((s) => s.selectGuest);
  const assignGuest = useMotelStore((s) => s.assignGuest);
  const resolveEvent = useMotelStore((s) => s.resolveEvent);
  const collectTip = useMotelStore((s) => s.collectTip);
  const upgradeRoom = useMotelStore((s) => s.upgradeRoom);
  const resetGame = useMotelStore((s) => s.resetGame);

  const [modalRoomId, setModalRoomId] = useState<string | null>(null);
  const [tipAmounts, setTipAmounts] = useState<Record<string, number | null>>({});
  const [perfectMatches, setPerfectMatches] = useState<Record<string, boolean>>({});

  const goldScale = useRef(new Animated.Value(1)).current;
  const prevGoldRef = useRef(gold);

  useEffect(() => {
    if (gold !== prevGoldRef.current) {
      prevGoldRef.current = gold;
      goldScale.setValue(1);
      Animated.sequence([
        Animated.timing(goldScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(goldScale, { toValue: 1.0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [gold]);

  const hasSelection = selectedGuestId !== null;
  const modalRoom = modalRoomId ? (rooms.find((r) => r.id === modalRoomId) ?? null) : null;

  const handleCollect = useCallback(
    (room: Room) => {
      const amount = calcTip(room);
      collectTip(room.id);
      setTipAmounts((prev) => ({ ...prev, [room.id]: amount }));
      setTimeout(() => {
        setTipAmounts((prev) => ({ ...prev, [room.id]: null }));
      }, 1300);
    },
    [collectTip]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Animated.Text style={[styles.topBarText, { transform: [{ scale: goldScale }] }]}>
          💰 Gold: {gold}
        </Animated.Text>
        <Text style={styles.topBarText}>Day: {day}</Text>
      </View>

      <Text style={styles.sectionTitle}>Lobby Queue</Text>
      <View style={styles.queue}>
        {queue.map((guest) => {
          const selected = guest.id === selectedGuestId;
          return (
            <GuestCard
              key={guest.id}
              guest={guest}
              selected={selected}
              onPress={() => selectGuest(guest.id)}
            />
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Floor Plan</Text>
      <View style={styles.grid}>
        {[rooms.slice(0, 2), rooms.slice(2, 4)].map((row, rowIdx) => (
          <View key={rowIdx} style={styles.gridRow}>
            {row.map((room) => {
              const assignable = hasSelection && room.status === 'empty';
              const handleRoomPress = () => {
                if (room.status === 'event') setModalRoomId(room.id);
                else if (room.status === 'ready') handleCollect(room);
                else if (assignable) {
                  const selectedGuest = queue.find((g) => g.id === selectedGuestId);
                  if (selectedGuest?.type === 'supernatural' && room.type === 'cozy') {
                    setPerfectMatches((prev) => ({ ...prev, [room.id]: true }));
                    setTimeout(() => {
                      setPerfectMatches((prev) => ({ ...prev, [room.id]: false }));
                    }, 1700);
                  }
                  assignGuest(room.id);
                }
              };
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  assignable={assignable}
                  tipAmount={tipAmounts[room.id] ?? null}
                  showPerfectMatch={perfectMatches[room.id] ?? false}
                  gold={gold}
                  onPress={handleRoomPress}
                  onUpgrade={() => upgradeRoom(room.id)}
                />
              );
            })}
          </View>
        ))}
      </View>

      {hasSelection && (
        <Text style={styles.assignHint}>Tap a glowing room to assign</Text>
      )}

      <Pressable style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>🔄 Reset Game</Text>
      </Pressable>

      <Modal
        visible={modalRoom !== null && modalRoom.pendingEvent !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRoomId(null)}
      >
        <View style={styles.overlay}>
          {modalRoom?.pendingEvent && modalRoom.occupiedBy && (
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>{modalRoom.occupiedBy.emoji}</Text>
              <Text style={styles.modalGuestName}>{modalRoom.occupiedBy.name}</Text>
              <Text style={styles.modalDescription}>{modalRoom.pendingEvent.description}</Text>
              <View style={styles.modalChoices}>
                {modalRoom.pendingEvent.choices.map((choice, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.choiceButton}
                    onPress={() => {
                      resolveEvent(modalRoom.id, idx);
                      setModalRoomId(null);
                    }}
                  >
                    <Text style={styles.choiceButtonText}>{choice.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roomWrapper: {
    flex: 1,
  },
  room: {
    flex: 1,
    height: 160,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roomCozy: {
    backgroundColor: '#2d1b69',
  },
  roomAssignable: {
    backgroundColor: '#0d2e2c',
  },
  roomEvent: {
    backgroundColor: '#f0c04015',
    borderColor: '#f0c040',
  },
  roomReady: {
    backgroundColor: '#4caf5015',
    borderColor: '#4caf50',
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
  roomGuestCenter: {
    alignItems: 'center',
    gap: 4,
  },
  roomGuestEmoji: {
    fontSize: 38,
    textAlign: 'center',
  },
  roomOccupantName: {
    color: '#e8d5b7',
    fontSize: 12,
    textAlign: 'center',
  },
  roomBottom: {
    gap: 6,
  },
  roomHint: {
    color: '#555',
    fontSize: 12,
  },
  roomHintAssignable: {
    color: '#4ecdc4',
  },
  upgradeButton: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#7a6a2a',
    alignSelf: 'flex-start',
  },
  upgradeButtonDisabled: {
    borderColor: '#444',
  },
  upgradeButtonText: {
    color: '#a08030',
    fontSize: 10,
    fontWeight: '600',
  },
  upgradeButtonTextDisabled: {
    color: '#555',
  },
  badgeEvent: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0c040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEventText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  badgeReady: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeReadyText: {
    fontSize: 14,
    lineHeight: 16,
  },
  floatingTipContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingTipText: {
    color: '#f0c040',
    fontWeight: '700',
    fontSize: 20,
  },
  floatingMatchContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingMatchText: {
    color: '#c9a84c',
    fontWeight: '700',
    fontSize: 13,
  },
  assignHint: {
    color: '#4ecdc4',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.85,
  },
  resetButton: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e57373',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#e57373',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1e1e32',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a5a',
    gap: 12,
  },
  modalEmoji: {
    fontSize: 48,
  },
  modalGuestName: {
    color: '#c9a84c',
    fontSize: 18,
    fontWeight: '700',
  },
  modalDescription: {
    color: '#e8d5b7',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  modalChoices: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  choiceButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  choiceButtonText: {
    color: '#e8d5b7',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
