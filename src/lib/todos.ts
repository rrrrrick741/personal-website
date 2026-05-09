import fs from "fs";
import path from "path";

export interface Todo {
  id: string;
  date: string;
  text: string;
  completed: boolean;
  project?: string;
  order: number;
}

const DATA_DIR = path.join(process.cwd(), "content");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

function readTodos(): Todo[] {
  if (!fs.existsSync(TODOS_FILE)) return [];
  const raw = fs.readFileSync(TODOS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeTodos(todos: Todo[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), "utf-8");
}

export function getTodayTodos(): Todo[] {
  const today = new Date().toISOString().split("T")[0];
  return readTodos()
    .filter((t) => t.date === today)
    .sort((a, b) => a.order - b.order);
}

export function addTodo(text: string, project?: string): Todo {
  const todos = readTodos();
  const today = new Date().toISOString().split("T")[0];
  const maxOrder = todos
    .filter((t) => t.date === today)
    .reduce((max, t) => Math.max(max, t.order), -1);

  const newTodo: Todo = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: today,
    text,
    completed: false,
    project,
    order: maxOrder + 1,
  };
  todos.push(newTodo);
  writeTodos(todos);
  return newTodo;
}

export function toggleTodo(id: string): Todo | null {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  todo.completed = !todo.completed;
  writeTodos(todos);
  return todo;
}

export function deleteTodo(id: string): boolean {
  const todos = readTodos();
  const filtered = todos.filter((t) => t.id !== id);
  if (filtered.length === todos.length) return false;
  writeTodos(filtered);
  return true;
}

export function updateTodoText(id: string, text: string): Todo | null {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  todo.text = text;
  writeTodos(todos);
  return todo;
}

export function reorderTodos(ids: string[]): void {
  const todos = readTodos();
  for (let i = 0; i < ids.length; i++) {
    const todo = todos.find((t) => t.id === ids[i]);
    if (todo) todo.order = i;
  }
  writeTodos(todos);
}
