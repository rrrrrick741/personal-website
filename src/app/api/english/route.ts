import { getAllWords, addWord, deleteWord, toggleMastered, getStats, seedIfEmpty } from "@/lib/english";

seedIfEmpty();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "stats") {
    return Response.json(getStats());
  }

  return Response.json(getAllWords());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, definition, example, tags } = body;

    if (!word || !definition) {
      return Response.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const newWord = addWord({
      word,
      definition,
      example: example || "",
      tags: tags || [],
    });

    return Response.json(newWord, { status: 201 });
  } catch {
    return Response.json({ error: "添加失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return Response.json({ error: "缺少 ID" }, { status: 400 });

    const updated = toggleMastered(id);
    if (!updated) return Response.json({ error: "未找到" }, { status: 404 });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "缺少 ID" }, { status: 400 });

  const ok = deleteWord(id);
  return Response.json({ success: ok });
}
