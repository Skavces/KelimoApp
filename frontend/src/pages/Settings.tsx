import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Bell, Shield, Smartphone } from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
          Ayarlar
        </h1>

        <div className="space-y-6">

          <section className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-violet-500" />
              Görünüm
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Tema Tercihi</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Uygulamanın görünümünü değiştir.
                </p>
              </div>
              
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  theme === "dark" ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`${
                    theme === "dark" ? "translate-x-7" : "translate-x-1"
                  } inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center shadow-sm`}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3.5 h-3.5 text-violet-600" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
          </section>

          {/* Bildirim Ayarları (Dummy) */}
          <section className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-fuchsia-500" />
              Bildirimler
            </h2>
            <div className="flex items-center justify-between opacity-50 cursor-not-allowed grayscale">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">E-posta Bildirimleri</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Haftalık ilerleme raporu al.</p>
              </div>
              {/* Dummy Toggle Switch */}
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded-full relative">
                <div className="absolute left-1 top-1 w-5 h-5 bg-white dark:bg-slate-600 rounded-full shadow-sm"></div>
              </div>
            </div>
          </section>

          {/* Gizlilik (Dummy) */}
          <section className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              Gizlilik
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Şifre değiştirme ve hesap silme işlemleri yakında eklenecek.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}