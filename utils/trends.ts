import { Session } from "../context/SessionContext";

export type DailyDrinkCount = {
  /** Start-of-day timestamp (local time) this bucket represents. */
  date: number;
  /** Short display label, e.g. "Mon" or "Today". */
  label: string;
  count: number;
  isToday: boolean;
};

/**
 * Buckets drinks from completed sessions into calendar-day counts, oldest
 * first, ending on `now`'s day.
 *
 * Bucketing uses each drink's own timestamp rather than its session's
 * startTime, so a session that runs past midnight still attributes its
 * drinks to the correct day.
 *
 * Only committed `sessions` are considered (matching the existing
 * `drinksLast7Days` / `avgDrinksPerSession` stats), not an in-progress
 * `currentSession` or `pendingSession`.
 *
 * @param sessions Completed sessions to aggregate.
 * @param days Number of trailing days to include (default 14).
 * @param now Reference "today" timestamp, injectable for testing.
 */
export function getDailyDrinkCounts(
  sessions: Session[],
  days: number = 14,
  now: number = Date.now()
): DailyDrinkCount[] {
  const today = new Date(now);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const buckets: DailyDrinkCount[] = [];

  for (let i = days - 1; i >= 0; i--) {
    // Using setDate/new Date(y, m, d) (rather than raw millisecond math)
    // so calendar arithmetic stays correct across DST transitions.
    const dayStart = new Date(todayYear, todayMonth, todayDate - i);
    const dayEnd = new Date(todayYear, todayMonth, todayDate - i + 1);
    const isToday = i === 0;

    buckets.push({
      date: dayStart.getTime(),
      label: isToday
        ? "Today"
        : dayStart.toLocaleDateString([], { weekday: "short" }),
      count: 0,
      isToday,
    });

    void dayEnd; // bucket end is implicit (next bucket's start); kept for clarity above
  }

  const bucketStarts = buckets.map((bucket) => bucket.date);

  for (const session of sessions) {
    for (const drink of session.drinks) {
      // Find the bucket whose day the drink falls into. Drinks older than
      // the oldest bucket, or from the future, are outside the window.
      const bucketIndex = bucketStarts.findIndex((start, idx) => {
        const nextStart =
          idx + 1 < bucketStarts.length ? bucketStarts[idx + 1] : Infinity;
        return drink.timestamp >= start && drink.timestamp < nextStart;
      });

      if (bucketIndex !== -1) {
        buckets[bucketIndex].count += 1;
      }
    }
  }

  return buckets;
}
