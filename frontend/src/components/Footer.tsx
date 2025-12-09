export default function Footer() {
  return (
    <footer className="border-t border-slate-800/70 bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between text-xs text-slate-500">
        <span>© {new Date().getFullYear()} dil-uygulamasi</span>
        <span className="text-[11px]">
          Beta • sadece Google hesabıyla giriş
        </span>
      </div>
    </footer>
  );
}
