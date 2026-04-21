import { useMemo,useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Drink, DrinkType, useSession } from "../../context/SessionContext";

const DRINK_OPTIONS: { label: string; type: DrinkType }[] = [
  { label: "Beer", type: "beer" },
  { label: "Wine", type: "wine" },
  { label: "Cocktail", type: "cocktail" },
  { label: "Shot", type: "shot" },
];

export default function TonightScreen() {
  const {
    currentSession,
    logDrink,
    undoLastDrink,
    endSession,
    commitPendingSession,
    undoEndSession,
    isLoaded,
  } = useSession();

  const drinks = useMemo(() => {
    if (!currentSession) return [];
    return [...currentSession.drinks].sort((a, b) => b.timestamp - a.timestamp);
  }, [currentSession]);

  const [showToast, setShowToast] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [LastSessionDrinkCount, setLastSessionDrinkCount] = useState(0);

  const drinkCount = currentSession?.drinks.length ?? 0;
  const sessionMeta = currentSession
    ? `drinks logged • started ${formatTime(currentSession.startTime)}`
    : "No drinks logged yet";

    function handleEndSession() {
      if (drinkCount === 0) return;
    
      setLastSessionDrinkCount(drinkCount);
      endSession();
      showUndoToast();
    }

    function showUndoToast() {
      setShowToast(true);
    
      const id = setTimeout(() => {
        commitPendingSession();
        setShowToast(false);
      }, 8000);
    
      setTimeoutId(id);
    }

    function handleUndoEndSession() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    
      undoEndSession();
      setShowToast(false);
    }



  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <Text style={styles.screenTitle}>Tonight</Text>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={drinks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Text style={styles.screenTitle}>Tonight</Text>

              {drinkCount > 0 ? (
                <Pressable
                  onPress={handleEndSession}
                  style={({ pressed }) => [
                    styles.topEndButton,
                    pressed && styles.topEndButtonPressed,
                  ]}
                >
                  <Text style={styles.topEndButtonText}>End session</Text>
                </Pressable>
              ) : (
                <View style={styles.topBarSpacer} />
              )}
            </View>

            <View style={styles.heroCard}>
              
              <Text style={styles.heroCount}>{drinkCount}</Text>
              <Text style={styles.heroMeta}>{sessionMeta}</Text>
            </View>

            <View style={styles.buttonRow}>
              {DRINK_OPTIONS.map((option) => (
                <DrinkButton
                  key={option.type}
                  label={option.label}
                  onPress={() => logDrink(option.type)}
                />
              ))}
            </View>

            <View style={styles.secondaryActions}>
              <Pressable
                onPress={undoLastDrink}
                disabled={drinkCount === 0}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  drinkCount === 0 && styles.secondaryButtonDisabled,
                  pressed && drinkCount > 0 && styles.secondaryButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    drinkCount === 0 && styles.secondaryButtonTextDisabled,
                  ]}
                >
                  Undo
                </Text>
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing yet</Text>
            <Text style={styles.emptyText}>
              Tap beer, wine, cocktail, or shot to start tonight's session!
            </Text>
          </View>
        }
        renderItem={({ item }) => <DrinkListItem item={item} />}
      />
                  {showToast && (
  <View style={styles.toast}>
    <Text style={styles.toastText}>
      Session saved ({LastSessionDrinkCount} drinks)
    </Text>

    <Pressable onPress={handleUndoEndSession}>
      <Text style={styles.toastAction}>Undo</Text>
    </Pressable>
  </View>
)}
    </SafeAreaView>
  );
}

type DrinkButtonProps = {
  label: string;
  onPress: () => void;
};

function DrinkButton({ label, onPress }: DrinkButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.drinkButton,
        pressed && styles.drinkButtonPressed,
      ]}
    >
      <Text style={styles.drinkButtonText}>{label}</Text>
    </Pressable>
  );
}

function DrinkListItem({ item }: { item: Drink }) {
  return (
    <View style={styles.drinkItem}>
      <View>
        <Text style={styles.drinkItemTitle}>{capitalize(item.type)}</Text>
        <Text style={styles.drinkItemTime}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 40,
  },
  topBarSpacer: {
    width: 110,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f9fafb",
  },
  loadingText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 20,
  },
  topEndButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  topEndButtonPressed: {
    opacity: 0.8,
  },
  topEndButtonText: {
    color: "#fca5a5",
    fontSize: 14,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  heroCount: {
    fontSize: 56,
    fontWeight: "800",
    color: "#f9fafb",
    lineHeight: 64,
  },
  heroMeta: {
    marginTop: 8,
    fontSize: 15,
    color: "#d1d5db",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  drinkButton: {
    flex: 1,
    backgroundColor: "#7F77DE",
    paddingVertical: 18,
    minHeight: 56,
    justifyContent: "center",
    borderRadius: 16,
    alignItems: "center",
  },
  drinkButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  drinkButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryActions: {
    marginBottom: 28,
  },
  secondaryButton: {
    backgroundColor: "#2A2945",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: "#f3f4f6",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButtonTextDisabled: {
    color: "#9ca3af",
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#9ca3af",
  },
  emptyState: {
    borderRadius: 18,
    paddingVertical: 20,
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
  drinkItem: {
    paddingVertical: 12,
    marginBottom: 10,
  },
  drinkItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 4,
  },
  drinkItemTime: {
    fontSize: 14,
    color: "#9ca3af",
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5, 
  },
  
  toastText: {
    color: '#f9fafb',
    fontSize: 14,
  },
  
  toastAction: {
    color: '#a78bfa',
    fontWeight: '700',
    fontSize: 14,
  },
});