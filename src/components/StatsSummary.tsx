import type { LearningEntry } from "@/lib/learning";
import { getLearningStats } from "@/lib/learning";

interface Props {
  entries: LearningEntry[];
}

export default function StatsSummary({ entries }: Props) {
  const stats = getLearningStats(entries);

  const items = [
    { label: "Total Hours", value: `${stats.totalHours}h` },
    { label: "This Week", value: `${stats.thisWeekHours}h` },
    { label: "Entries", value: stats.totalEntries },
    { label: "Subjects", value: stats.uniqueSubjects },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="border border-[--color-border] rounded-lg p-4 text-center bg-white"
        >
          <div className="text-2xl font-semibold text-[--color-text] mb-1">
            {value}
          </div>
          <div className="text-xs text-[--color-text-secondary] uppercase tracking-wider">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
