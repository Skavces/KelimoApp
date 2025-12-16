import { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  ChevronRight,
  Flame, // Alev ikonu eklendi
  Trophy
} from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

// JWT Decode fonksiyonu (Kullanıcı adını almak için)
type DecodedToken = {
  sub: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
};

function decodeJwt(token: string | null): DecodedToken | null {
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const percentEncoded = Array.from(binary)
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("");
    const json = decodeURIComponent(percentEncoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State: Backend'den gelecek veriler
  const [stats, setStats] = useState({ 
    learnedCount: 0, 
    accuracy: 0, 
    streak: 0,
    totalCount: 0 
  });
  
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const decoded = decodeJwt(token);
  const displayName = decoded?.name || decoded?.email || "Öğrenci";
  
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/words/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Backend'den gelen veriyi state'e atıyoruz
          setStats({
            learnedCount: data.learnedCount || 0,
            accuracy: data.accuracy || 0, // Backend'de eklediğimiz doğruluk oranı
            streak: data.streak || 0,     // Backend'de hesapladığımız gerçek streak
            totalCount: data.totalCount || 0
          });
        }
      } catch (err) {
        console.error("İstatistikler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, apiUrl]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Hoş geldin Başlığı */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
              Hoş geldin,{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent capitalize">
                {displayName}
              </span>{" "}
              👋
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Bugün öğrenmek için harika bir gün!
            </p>
          </div>
        </div>

        {/* İstatistik Kartları (Üst 3 Kart) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* 1. Öğrenilen Kelime */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? "-" : stats.learnedCount}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Öğrenilen Kelime
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Toplam kelime hazinen</p>
          </div>

          {/* 2. Doğruluk Oranı (Backend'den geliyor) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? "-" : `%${stats.accuracy}`}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Başarı Oranı</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ortalama performansın</p>
          </div>

          {/* 3. Gün Serisi (Streak) - Backend'den geliyor */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Flame className={`w-6 h-6 ${stats.streak > 0 ? 'text-orange-600 dark:text-orange-400 animate-pulse' : 'text-slate-400'}`} />
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? "-" : stats.streak} <span className="text-lg font-normal text-slate-400">Gün</span>
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Gün Serisi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Zinciri kırma! 🔥</p>
          </div>
        </div>

        {/* Action Cards (Alt Kısım - Linkler) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Yeni Kelimeler */}
          <div
            className="group p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm 
            hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/learn")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Yeni Kelimeler
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Kartları kaydırarak yeni kelimeler keşfet.
            </p>
          </div>

          {/* Alıştırma Yap */}
          <div 
            onClick={() => navigate("/practice")}
            className="group p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm 
            hover:shadow-xl hover:shadow-fuchsia-500/10 hover:border-fuchsia-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                <Target className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-fuchsia-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
              Alıştırma Yap
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Oyunlarla hafızanı test et ve eğlen.
            </p>
          </div>

          {/* İlerleme */}
          <div 
            className="group p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm 
            hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              İlerlemeni Gör
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Rozetlerini ve istatistiklerini incele.
            </p>
          </div>

          {/* Kelime Listem */}
          <div 
            className="group p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm 
            hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/my-words")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              Kelime Listem
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Öğrendiğin <span className="font-bold text-cyan-600 dark:text-cyan-400">{stats.learnedCount}</span> kelimeyi incele.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}