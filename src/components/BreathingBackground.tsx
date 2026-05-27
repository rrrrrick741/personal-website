export default function BreathingBackground() {
  return (
    <div
      aria-hidden="true"
      data-blob-container
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      <div className="absolute inset-0 paper-grid opacity-45" />
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-accent-soft) 35%, transparent), transparent)",
        }}
      />
      <div className="absolute left-8 top-24 hidden h-40 w-px bg-[--color-border] md:block" />
      <div className="absolute left-8 top-24 hidden h-px w-28 bg-[--color-border] md:block" />
      <div className="absolute right-10 bottom-16 hidden h-px w-36 bg-[--color-border] md:block" />
      <div className="absolute right-10 bottom-16 hidden h-28 w-px bg-[--color-border] md:block" />
      <div className="absolute left-[12%] bottom-24 h-2 w-16 rounded-full bg-[--color-sage]/35" />
      <div className="absolute right-[16%] top-32 h-2 w-20 rounded-full bg-[--color-ink-blue]/20" />
    </div>
  );
}
