import Link from "next/link";
import { getAllLearningEntries, getRecentEntries } from "@/lib/learning";
import StatsSummary from "@/components/StatsSummary";

export const dynamic = "force-static";

export default function Home() {
  const entries = getAllLearningEntries();
  const recent = getRecentEntries(entries, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Hero */}
      <section className="mb-24">
        <h1 className="text-4xl font-bold tracking-tight text-[--color-text] mb-4">
          Hey, I&apos;m Rick.
        </h1>
        <p className="text-lg text-[--color-text-secondary] max-w-xl leading-relaxed">
          A personal space to track what I learn and share the daily news that
          matters — politics, economics, and AI.
        </p>
      </section>

      {/* Section Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
        <Link
          href="/learning"
          className="block border border-[--color-border] rounded-xl p-8 hover:bg-[--color-bg-secondary] transition-colors no-underline group"
        >
          <div className="text-sm text-[--color-text-secondary] uppercase tracking-widest mb-4">
            Learning
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors">
            Study Log
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            Daily learning records — what I studied and how long.
          </p>
        </Link>
        <Link
          href="/news"
          className="block border border-[--color-border] rounded-xl p-8 hover:bg-[--color-bg-secondary] transition-colors no-underline group"
        >
          <div className="text-sm text-[--color-text-secondary] uppercase tracking-widest mb-4">
            News
          </div>
          <h2 className="text-2xl font-semibold text-[--color-text] mb-2 group-hover:text-[--color-accent] transition-colors">
            Daily Digest
          </h2>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            Top 10 stories across politics, economics, and AI — updated daily.
          </p>
        </Link>
      </section>

      {/* Recent Learning */}
      {entries.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm uppercase tracking-widest text-[--color-text-secondary]">
              Recent Learning
            </h3>
            <Link
              href="/learning"
              className="text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors no-underline"
            >
              View all &rarr;
            </Link>
          </div>
          <StatsSummary entries={entries} />
          <div className="mt-6 space-y-4">
            {recent.map((entry) => (
              <div
                key={entry.slug}
                className="border border-[--color-border] rounded-lg p-4 bg-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <time className="text-xs text-[--color-text-secondary]">
                      {entry.date}
                    </time>
                    <h4 className="text-base font-medium text-[--color-text] mt-1">
                      {entry.subject}
                    </h4>
                  </div>
                  <span className="text-sm text-[--color-text-secondary]">
                    {entry.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {entries.length === 0 && (
        <section className="text-center py-12">
          <p className="text-[--color-text-secondary] text-sm">
            No learning records yet. Start tracking your learning journey.
          </p>
          <Link
            href="/admin"
            className="inline-block mt-4 text-sm text-[--color-text] underline hover:text-[--color-accent]"
          >
            Add your first entry &rarr;
          </Link>
        </section>
      )}
    </div>
  );
}
