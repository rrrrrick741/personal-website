"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          subject,
          duration: parseInt(duration),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          content,
        }),
      });

      if (!res.ok) throw new Error("保存失败");

      setMessage("学习记录保存成功！");
      setSubject("");
      setDuration("");
      setTags("");
      setContent("");
      router.refresh();
    } catch {
      setMessage("保存失败，请重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-2">
          管理
        </h1>
        <p className="text-sm text-[--color-text-secondary]">
          添加新的学习记录。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-[--color-text-secondary] mb-1.5">
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-[--color-border] rounded-[--radius-sm] px-4 py-2.5 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-[--color-text-secondary] mb-1.5">
            主题
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="例如：React 性能优化"
            className="w-full border border-[--color-border] rounded-[--radius-sm] px-4 py-2.5 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
          />
        </div>

        <div>
          <label className="block text-xs text-[--color-text-secondary] mb-1.5">
            时长（分钟）
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min={1}
            placeholder="120"
            className="w-full border border-[--color-border] rounded-[--radius-sm] px-4 py-2.5 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
          />
        </div>

        <div>
          <label className="block text-xs text-[--color-text-secondary] mb-1.5">
            标签（逗号分隔）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="React, Frontend"
            className="w-full border border-[--color-border] rounded-[--radius-sm] px-4 py-2.5 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary]"
          />
        </div>

        <div>
          <label className="block text-xs text-[--color-text-secondary] mb-1.5">
            内容（Markdown）
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            placeholder="- 虚拟 DOM 原理&#10;- useMemo / useCallback 最佳实践"
            className="w-full border border-[--color-border] rounded-[--radius-sm] px-4 py-2.5 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-tertiary] resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[--color-text] text-white text-sm font-medium py-3 rounded-full hover:bg-[--color-accent-hover] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "保存中..." : "保存记录"}
        </button>

        {message && (
          <p
            className={`text-sm text-center ${
              message.includes("失败")
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
