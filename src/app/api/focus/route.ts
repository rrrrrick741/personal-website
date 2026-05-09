import { getAllFocusSessions, addFocusSession, deleteFocusSession, getFocusStats } from "@/lib/focus";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "stats") {
    return Response.json(getFocusStats());
  }

  return Response.json(getAllFocusSessions());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project, subject, duration, date, notes } = body;

    if (!project || !subject || !duration) {
      return Response.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const session = addFocusSession({
      date: date || new Date().toISOString().split("T")[0],
      project,
      subject,
      duration: parseInt(String(duration)),
      notes: notes || "",
    });

    return Response.json(session, { status: 201 });
  } catch {
    return Response.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "缺少 ID" }, { status: 400 });

  const ok = deleteFocusSession(id);
  return Response.json({ success: ok });
}
