import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Alanı */}
        <div
          className="group flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/dashboard")}
        >
          {/* İkon Kutusu */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <BookOpen className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Logo Metni */}
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent group-hover:to-violet-500 dark:group-hover:to-violet-400 transition-all duration-300">
            KelimoApp
          </span>
        </div>

        {/* Sağ Taraf: Profil Menüsü */}
        <div className="flex items-center gap-4">
          {token ? <UserMenu /> : null}
        </div>
      </div>
    </header>
  );
}