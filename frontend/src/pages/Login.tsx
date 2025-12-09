import { BookOpen, Sparkles, Target, Trophy, Brain, Zap, Award } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:5001/auth/google";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      
      {/* Left Side - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 lg:rounded-r-[3rem]">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              KelimoApp
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Hoş Geldin
            </h1>
            <p className="text-lg text-slate-400">
              Dil öğrenme yolculuğuna başlamak için giriş yap
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 hover:bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3 group"
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
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Devam ederek{" "}
            <a href="#" className="text-slate-400 hover:text-slate-300 underline">
              Kullanım Şartları
            </a>{" "}
            ve{" "}
            <a href="#" className="text-slate-400 hover:text-slate-300 underline">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursun
          </p>
        </div>
      </div>

      {/* Right Side - Visual/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden lg:rounded-l-[3rem]">
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
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16 text-white">
          <div className="max-w-md space-y-12">
            
            {/* Main Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Her Gün Yeni Kelimeler Öğren
              </h2>
              <p className="text-xl text-purple-100">
                Kişiselleştirilmiş öğrenme deneyimi ile dil becerilerini geliştir
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Akıllı Öğrenme</h3>
                  <p className="text-purple-100 text-sm">Adaptif algoritma ile kişisel gelişim</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Hızlı İlerleme</h3>
                  <p className="text-purple-100 text-sm">Günlük pratiklerle sürekli gelişim</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Başarı Takibi</h3>
                  <p className="text-purple-100 text-sm">Hedeflerine ulaşmanı izle</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}