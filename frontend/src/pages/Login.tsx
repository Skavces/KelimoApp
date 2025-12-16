import { BookOpen, Sparkles, Brain, Zap, Award, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex transition-colors duration-300 relative">
      
      {/* Theme Button */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm border border-slate-200 dark:border-slate-800"
          title={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500 animate-in spin-in-90 duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-violet-600 animate-in spin-in-90 duration-300" />
          )}
        </button>
      </div>

      {/* Left Side - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent transition-all">
              KelimoApp
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white transition-colors">
              Hoş Geldin
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors">
              Dil öğrenme yolculuğuna başlamak için giriş yap
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-white text-slate-900 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl shadow-lg border border-slate-200 dark:border-transparent hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google ile devam et</span>
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center leading-relaxed">
            Devam ederek{" "}
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 underline transition-colors">
              Kullanım Şartları
            </a>{" "}
            ve{" "}
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 underline transition-colors">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursun
          </p>
        </div>
      </div>

      {/* Right Side - Visual/Hero */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden rounded-[3rem] h-[90vh] shadow-2xl shadow-violet-500/20">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-white/10 rounded-3xl backdrop-blur-sm animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-sm animate-pulse" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white h-full">
          <div className="max-w-md space-y-12">
            
            {/* Main Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-1 ring-white/30">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Her Gün Yeni Kelimeler Öğren
              </h2>
              <p className="text-xl text-purple-100/90">
                Kişiselleştirilmiş öğrenme deneyimi ile dil becerilerini geliştir
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6 flex flex-col items-center w-full">
              <div className="flex items-start gap-4 w-full max-w-xs group">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Akıllı Öğrenme</h3>
                  <p className="text-purple-100/80 text-sm">Adaptif algoritma ile kişisel gelişim</p>
                </div>
              </div>

              <div className="flex items-start gap-4 w-full max-w-xs group">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Hızlı İlerleme</h3>
                  <p className="text-purple-100/80 text-sm">Günlük pratiklerle sürekli gelişim</p>
                </div>
              </div>

              <div className="flex items-start gap-4 w-full max-w-xs group">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Başarı Takibi</h3>
                  <p className="text-purple-100/80 text-sm">Hedeflerine ulaşmanı izle</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        </div>
      </div>

    </div>
  );
}