import { Github, Linkedin} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Sol Taraf: Marka ve Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            KelimoApp
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            © {currentYear} 
            <span className="hidden md:inline mx-1">•</span>
            Made by Selim Kavaklıçeşme
          </span>
        </div>

        {/* Sağ Taraf: Sosyal Medya ve Versiyon */}
        <div className="flex items-center gap-6">
          {/* İkonlar */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:scale-110 transform duration-200">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:scale-110 transform duration-200">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* Versiyon Badge */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
          
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 text-[10px] font-bold uppercase tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
            </span>
            v1.0
          </span>
        </div>

      </div>
    </footer>
  );
}