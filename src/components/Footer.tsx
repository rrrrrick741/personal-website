export default function Footer() {
  return (
    <footer className="border-t border-[--color-border] mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-[--color-text-secondary]">
        <span>&copy; {new Date().getFullYear()} Rick</span>
        <span>Built with Next.js</span>
      </div>
    </footer>
  );
}
