import type { LearningEntry } from "@/lib/learning";

interface Props {
  entry: LearningEntry;
}

export default function LearningCard({ entry }: Props) {
  return (
    <article className="border border-[--color-border] rounded-lg p-6 bg-white hover:bg-[--color-bg-secondary] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <time className="text-sm text-[--color-text-secondary] block mb-1">
            {entry.date}
          </time>
          <h3 className="text-lg font-semibold text-[--color-text] m-0">
            {entry.subject}
          </h3>
        </div>
        <span className="text-sm text-[--color-text-secondary] bg-[--color-bg-secondary] px-3 py-1 rounded-full whitespace-nowrap">
          {entry.duration} min
        </span>
      </div>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 border border-[--color-border] rounded text-[--color-text-secondary]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="text-sm text-[--color-text-secondary] leading-relaxed prose-p:m-0 prose-li:text-sm">
        {entry.content}
      </div>
    </article>
  );
}
