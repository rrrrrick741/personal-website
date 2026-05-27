"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo } from "@/lib/todos";

export default function TodoPanel() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchTodos);
  }, [fetchTodos]);

  async function handleAdd() {
    if (!newText.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos((prev) => [...prev, todo]);
      setNewText("");
    }
  }

  async function handleToggle(id: string) {
    const res = await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    if (res.ok) setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className="warm-surface rounded-[--radius-lg] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[--color-text]">今日待办</h3>
        {todos.length > 0 && (
          <span className="text-xs text-[--color-text-tertiary]">
            {completed}/{todos.length}
          </span>
        )}
      </div>

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="添加新任务..."
          className="flex-1 border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-text] bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-[--radius-sm] bg-[--color-text] text-white text-sm font-medium hover:bg-[--color-accent-hover] transition-colors shrink-0"
        >
          添加
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 bg-[--color-bg-secondary] rounded-[--radius-sm] animate-pulse" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <p className="text-xs text-[--color-text-tertiary] text-center py-6">
          今天还没有待办事项
        </p>
      ) : (
        <ul className="space-y-1 list-none m-0 p-0">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 group px-2 py-1.5 -mx-2 rounded-[--radius-sm] hover:bg-[--color-bg-tertiary] transition-colors"
            >
              <button
                onClick={() => handleToggle(todo.id)}
                className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                  todo.completed
                    ? "bg-[--color-text] border-[--color-text]"
                    : "border-[--color-border] hover:border-[--color-text]"
                }`}
              >
                {todo.completed && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-white m-auto">
                    <path
                      d="M2.5 6l2.5 2.5 4.5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  todo.completed
                    ? "line-through text-[--color-text-tertiary]"
                    : "text-[--color-text]"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-[--color-text-tertiary] hover:text-red-500 transition-all text-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
