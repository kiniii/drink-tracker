import { useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Session, useSession } from "../../context/SessionContext";

export default function HistoryScreen() {
  const { sessions, isLoaded, clearHistory } = useSession();

  const orderedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.startTime - a.startTime);
  }, [sessions]);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const drinksLast7Days = sessions.reduce((total, session) => {
      const drinksInLastWeek = session.drinks.filter(
        (drink) => drink.timestamp >= weekAgo
      ).length;

      return total + drinksInLastWeek;
    }, 0);

    const avgDrinksPerSession =
      totalSessions === 0
        ? 0
        : sessions.reduce(
            (total, session) => total + session.drinks.length,
            0
          ) / totalSessions;

    return {
      totalSessions,
      drinksLast7Days,
      avgDrinksPerSession,
    };
  }, [sessions]);

  function handleClearHistory() {
    if (sessions.length === 0) return;

    Alert.alert(
      "Clear history?",
      "This will permanently remove all saved sessions from your history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear history",
          style: "destructive",
          onPress: clearHistory,
        },
      ]
    );
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <Text style={styles.screenTitle}>History</Text>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={orderedSessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.screenTitle}>History</Text>

              {sessions.length > 0 ? (
                <Pressable
                  onPress={handleClearHistory}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.clearButtonPressed,
                  ]}
                >
                  <Text style={styles.clearButtonText}>Clear history</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                label="last 7 days"
                value={String(stats.drinksLast7Days)}
              />
              <StatCard
                label="average per session"
                value={stats.avgDrinksPerSession.toFixed(1)}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No past sessions yet</Text>
            <Text style={styles.emptyText}>
              End a session on the Tonight tab and it will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => <SessionListItem session={item} />}
      />
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.statCard, fullWidth && styles.statCardFull]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getSessionDurationMs(session: Session) {
  if (!session.endTime) return 0;
  return session.endTime - session.startTime;
}

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function getDrinksPerHour(session: Session) {
  const drinks = session.drinks;

  if (drinks.length < 2) return drinks.length; // 0 or 1 drink → just return count

  const sorted = [...drinks].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const first = sorted[0].timestamp;
  const last = sorted[sorted.length - 1].timestamp;

  const durationHours = (last - first) / (1000 * 60 * 60);

  if (durationHours <= 0) return drinks.length;

  return drinks.length / durationHours;
}

function SessionListItem({ session }: { session: Session }) {
  const durationMs = getSessionDurationMs(session);
  const duration = formatDuration(durationMs);
  const drinksPerHour = getDrinksPerHour(session);

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionCardTop}>
        <Text style={styles.sessionDate}>
          {formatSessionDate(session.startTime)}
        </Text>
        <Text style={styles.sessionDrinkCount}>
          {session.drinks.length}{" "}
          {session.drinks.length === 1 ? "drink" : "drinks"}
        </Text>
      </View>

      <Text style={styles.sessionMeta}>
        {formatTime(session.startTime)}
        {session.endTime ? ` → ${formatTime(session.endTime)}` : ""}
        {session.endTime ? ` • ${duration}` : ""}
      </Text>

      {session.endTime && (
        <Text style={styles.sessionSubMeta}>
          ~{Math.round(drinksPerHour)} drinks/hour
        </Text>
      )}
    </View>
  );
}

function formatSessionDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();

  const isSameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isSameDay) {
    return "Today";
  }

  return date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f9fafb",
  },
  loadingText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 40,
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearButtonPressed: {
    opacity: 0.8,
  },
  clearButtonText: {
    color: "#fca5a5",
    fontSize: 14,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 18,
  },
  statCardFull: {
    flexBasis: "100%",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: "#9ca3af",
  },
  emptyState: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
  sessionCard: {
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  sessionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f9fafb",
  },
  sessionDrinkCount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#d1d5db",
  },
  sessionMeta: {
    fontSize: 14,
    color: "#9ca3af",
  },
  sessionSubMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});
