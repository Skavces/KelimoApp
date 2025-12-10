import { BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            KelimoApp
          </span>
        </div>

        {/* Sağ taraf */}
        <div className="flex items-center gap-4">
          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-sm text-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış yap</span>
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
}
