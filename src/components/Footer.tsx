export default function Footer() {
  return (
    <footer className="border-t border-[--color-border] mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-[--color-text-tertiary]">
        <span>&copy; {new Date().getFullYear()} Rick</span>
        <span>Next.js 构建</span>
      </div>
    </footer>
  );
}
