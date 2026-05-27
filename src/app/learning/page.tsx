import { getAllLearningEntries } from "@/lib/learning";
import LearningCard from "@/components/LearningCard";
import StatsSummary from "@/components/StatsSummary";

export const dynamic = "force-static";

export default function LearningPage() {
  const entries = getAllLearningEntries();

  return (
    <div className="page-shell py-16">
      <header className="mb-12 border-b border-[--color-border] pb-8">
        <p className="eyebrow mb-3">Study Log</p>
        <h1 className="text-3xl font-semibold text-[--color-text] mb-2">
          Learning
        </h1>
        <p className="text-[--color-text-secondary]">
          Daily study log. What I learned and how long it took.
        </p>
      </header>

      {entries.length > 0 ? (
        <>
          <StatsSummary entries={entries} />
          <div className="mt-10 space-y-4">
            {entries.map((entry) => (
              <LearningCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-[--color-text-secondary]">
            No learning records yet.
          </p>
        </div>
      )}
    </div>
  );
}
