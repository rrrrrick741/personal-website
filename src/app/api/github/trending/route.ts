import {
  fetchWeeklyTrending,
  loadWeeklySnapshot,
  saveWeeklySnapshot,
  listAllWeeks,
  getWeekKey,
  getWeekDates,
} from "@/lib/github";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");

  if (week) {
    const snapshot = loadWeeklySnapshot(week);
    if (!snapshot) {
      return Response.json({ error: "No data for this week" }, { status: 404 });
    }
    return Response.json(
      { ...snapshot, availableWeeks: listAllWeeks() },
      {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=600" },
      }
    );
  }

  const currentWeek = getWeekKey();
  const cached = loadWeeklySnapshot(currentWeek);

  if (cached) {
    return Response.json(
      { ...cached, availableWeeks: listAllWeeks() },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      }
    );
  }

  try {
    const repos = await fetchWeeklyTrending();
    saveWeeklySnapshot(repos, currentWeek);

    const { startDate, endDate } = getWeekDates(currentWeek);

    return Response.json(
      {
        week: currentWeek,
        startDate,
        endDate,
        repos,
        availableWeeks: listAllWeeks(),
      },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json(
      { error: message, repos: [], availableWeeks: listAllWeeks() },
      { status: 200 }
    );
  }
}
