import { getTodayTodos, addTodo, toggleTodo, deleteTodo } from "@/lib/todos";

export async function GET() {
  return Response.json(getTodayTodos());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, project } = body;

    if (!text) {
      return Response.json({ error: "缺少内容" }, { status: 400 });
    }

    const todo = addTodo(text, project);
    return Response.json(todo, { status: 201 });
  } catch {
    return Response.json({ error: "添加失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "缺少 ID" }, { status: 400 });
    }

    const todo = toggleTodo(id);
    if (!todo) return Response.json({ error: "未找到" }, { status: 404 });
    return Response.json(todo);
  } catch {
    return Response.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "缺少 ID" }, { status: 400 });

  const ok = deleteTodo(id);
  return Response.json({ success: ok });
}
