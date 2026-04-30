import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMotelStore } from '../store/useMotelStore';

export default function HomeScreen() {
  const checkedIn = useMotelStore((s) => s.checkedIn);
  const checkIn = useMotelStore((s) => s.checkIn);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {checkedIn ? 'Welcome, weary traveler' : 'Hello Mischief Motel'}
      </Text>
      {!checkedIn && (
        <TouchableOpacity style={styles.button} onPress={checkIn}>
          <Text style={styles.buttonText}>Check in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    gap: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e8d5b7',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#c9a84c',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: '600',
  },
});
