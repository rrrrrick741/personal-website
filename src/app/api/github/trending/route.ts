import {
  fetchWeeklyTrending,
  getWeekKey,
  getWeekDates,
  getRecentWeekKeys,
} from "@/lib/github";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");

  try {
    let startDate: string | undefined;
    let weekKey: string;
    let displayDates: { startDate: string; endDate: string };

    if (week) {
      weekKey = week;
      displayDates = getWeekDates(week);
      startDate = displayDates.startDate;
    } else {
      weekKey = getWeekKey();
      displayDates = getWeekDates(weekKey);
    }

    const repos = await fetchWeeklyTrending(startDate);

    return Response.json(
      {
        week: weekKey,
        startDate: displayDates.startDate,
        endDate: displayDates.endDate,
        repos,
        availableWeeks: getRecentWeekKeys(),
      },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json(
      { error: message, repos: [], availableWeeks: getRecentWeekKeys() },
      { status: 200 }
    );
  }
}
