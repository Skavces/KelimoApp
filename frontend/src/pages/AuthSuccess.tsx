// frontend/src/pages/AuthSuccess.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // 1200ms → kullanıcı "yönlendiriliyor" ekranını görebilsin
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-fadeIn flex flex-col items-center gap-4
                        bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl px-10 py-8 rounded-2xl
                        border border-slate-200 dark:border-slate-800 shadow-xl 
                        text-center text-slate-900 dark:text-slate-200 transition-colors duration-300">

          <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />

          <h2 className="text-xl font-semibold">Google ile giriş başarılı</h2>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dashboard'a yönlendiriliyorsun...
          </p>
        </div>
      </div>
    </Layout>
  );
}