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

      if (!res.ok) throw new Error("Save failed");

      setMessage("Learning record saved successfully!");
      setSubject("");
      setDuration("");
      setTags("");
      setContent("");
      router.refresh();
    } catch {
      setMessage("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-2">
          Admin
        </h1>
        <p className="text-[--color-text-secondary]">
          Add a new learning record.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-[--color-text-secondary] mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-[--color-border] rounded-lg px-4 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[--color-text-secondary] mb-1.5">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. React Performance Optimization"
            className="w-full border border-[--color-border] rounded-lg px-4 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-secondary]"
          />
        </div>

        <div>
          <label className="block text-sm text-[--color-text-secondary] mb-1.5">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min={1}
            placeholder="120"
            className="w-full border border-[--color-border] rounded-lg px-4 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-secondary]"
          />
        </div>

        <div>
          <label className="block text-sm text-[--color-text-secondary] mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="React, Frontend"
            className="w-full border border-[--color-border] rounded-lg px-4 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-secondary]"
          />
        </div>

        <div>
          <label className="block text-sm text-[--color-text-secondary] mb-1.5">
            Content (Markdown)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            placeholder="- Virtual DOM principles&#10;- useMemo / useCallback best practices"
            className="w-full border border-[--color-border] rounded-lg px-4 py-2 text-sm text-[--color-text] bg-white focus:outline-none focus:border-[--color-text] transition-colors placeholder:text-[--color-text-secondary] resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[--color-text] text-white text-sm font-medium py-3 rounded-lg hover:bg-[--color-accent] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Record"}
        </button>

        {message && (
          <p
            className={`text-sm text-center ${
              message.includes("Failed")
                ? "text-red-600"
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
