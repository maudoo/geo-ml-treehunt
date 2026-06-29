import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import client from '../../src/api/client';

interface LeaderboardPlayer {
  display_name: string;
  xp: number;
}

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await client.get('/quests/leaderboard');
        setPlayers(response.data);
      } catch {
        console.error('Failed to fetch leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🏆 Leaderboard</Text>
      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name}>{item.display_name}</Text>
            <Text style={styles.xp}>{item.xp} XP</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d6a4f',
    width: 40,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#1b4332',
  },
  xp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d6a4f',
  },
});