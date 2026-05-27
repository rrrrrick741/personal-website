export default function Footer() {
  return (
    <footer className="border-t border-[--color-border] mt-auto bg-[--color-bg]/80">
      <div className="page-shell py-7 flex items-center justify-between text-xs text-[--color-text-tertiary]">
        <span>&copy; {new Date().getFullYear()} Rick</span>
        <span className="flex items-center gap-2">
          <span className="h-px w-8 bg-[--color-border]" />
          Next.js 构建
        </span>
      </div>
    </footer>
  );
}
