import { StyleSheet, Text, View } from "react-native";
import { DailyDrinkCount } from "../utils/trends";

const MAX_BAR_HEIGHT = 96;
const MIN_BAR_HEIGHT = 4;

type TrendChartProps = {
  data: DailyDrinkCount[];
};

export function TrendChart({ data }: TrendChartProps) {
  const maxCount = Math.max(1, ...data.map((bucket) => bucket.count));

  return (
    <View style={styles.card}>
      <View style={styles.barsRow}>
        {data.map((bucket) => {
          const barHeight =
            bucket.count === 0
              ? MIN_BAR_HEIGHT
              : Math.max(
                  MIN_BAR_HEIGHT,
                  (bucket.count / maxCount) * MAX_BAR_HEIGHT
                );

          return (
            <View key={bucket.date} style={styles.barColumn}>
              <Text style={styles.barValue}>
                {bucket.count > 0 ? bucket.count : ""}
              </Text>

              <View
                accessibilityLabel={`${bucket.label}: ${bucket.count} ${
                  bucket.count === 1 ? "drink" : "drinks"
                }`}
                style={[
                  styles.bar,
                  { height: barHeight },
                  bucket.isToday && styles.barToday,
                ]}
              />

              <Text
                style={[
                  styles.barLabel,
                  bucket.isToday && styles.barLabelToday,
                ]}
              >
                {bucket.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 12,
    marginBottom: 28,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d1d5db",
    marginBottom: 4,
    height: 14,
  },
  bar: {
    width: "60%",
    minWidth: 6,
    borderRadius: 4,
    backgroundColor: "#3f3b63",
  },
  barToday: {
    backgroundColor: "#7F77DE",
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: "#6b7280",
  },
  barLabelToday: {
    color: "#9ca3af",
    fontWeight: "700",
  },
});
