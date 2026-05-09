import { fetchAllNews } from "@/lib/news";

export const revalidate = 3600; // ISR: refresh every hour

export async function GET() {
  try {
    const data = await fetchAllNews();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    const empty = { politics: [], economics: [], ai: [] };
    return Response.json(empty, { status: 200 });
  }
}
