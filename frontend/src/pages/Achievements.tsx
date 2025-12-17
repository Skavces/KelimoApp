import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { 
  Trophy, Lock, Star, Flame, Target, Zap, 
  Crown, Medal, Book, Gamepad2, Award 
} from "lucide-react";

// Rozet Tanımları (Backend ID'leri ile eşleşmeli)
const BADGE_DEFINITIONS = [
  // KELİME (Learning)
  { id: 101, category: "Kelime", name: "İlk Adım", desc: "10 kelime öğren", icon: <Star />, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
  { id: 102, category: "Kelime", name: "Kelime Çırağı", desc: "50 kelime öğren", icon: <Book />, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { id: 103, category: "Kelime", name: "Kelime Avcısı", desc: "100 kelime öğren", icon: <Target />, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
  { id: 104, category: "Kelime", name: "Sözlük Gibi", desc: "500 kelime öğren", icon: <Award />, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
  { id: 105, category: "Kelime", name: "Dil Üstadı", desc: "1000 kelime öğren", icon: <Crown />, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },

  // SERİ (Streak)
  { id: 201, category: "Seri", name: "Isınma Turu", desc: "3 gün seri yap", icon: <Flame />, color: "text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20" },
  { id: 202, category: "Seri", name: "Alev Alev", desc: "7 gün seri yap", icon: <Flame />, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20" },
  { id: 203, category: "Seri", name: "Durdurulamaz", desc: "14 gün seri yap", icon: <Zap />, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
  { id: 204, category: "Seri", name: "Aylık Maraton", desc: "30 gün seri yap", icon: <Trophy />, color: "text-fuchsia-500", bg: "bg-fuchsia-100 dark:bg-fuchsia-900/20" },

  // PUAN & OYUN
  { id: 301, category: "Oyun", name: "Puan Toplayıcı", desc: "100 XP topla", icon: <Medal />, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/20" },
  { id: 302, category: "Oyun", name: "Skor Makinesi", desc: "1000 XP topla", icon: <Medal />, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
  { id: 303, category: "Oyun", name: "Efsane", desc: "5000 XP topla", icon: <Crown />, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
  { id: 304, category: "Oyun", name: "Oyuncu", desc: "10 oyun oyna", icon: <Gamepad2 />, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-900/20" },
  { id: 305, category: "Oyun", name: "Bağımlı", desc: "50 oyun oyna", icon: <Gamepad2 />, color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/20" },

  // KALİTE
  { id: 401, category: "Ustalık", name: "Keskin Nişancı", desc: "%90 başarı (min 50 soru)", icon: <Target />, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/20" },
  { id: 402, category: "Ustalık", name: "Mükemmeliyetçi", desc: "%100 başarı (min 20 soru)", icon: <Star />, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/20" },
];

export default function Achievements() {
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserBadges(data.badges || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [apiUrl, token]);

  // Kategorilere göre grupla
  const categories = ["Kelime", "Seri", "Oyun", "Ustalık"];

  // Kazanılan toplam rozet sayısı
  const unlockedCount = userBadges.filter(b => b.unlocked).length;
  const totalCount = BADGE_DEFINITIONS.length;

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-500" />
              Başarı Rozetleri
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Öğrenme yolculuğundaki başarılarını koleksiyonuna ekle!
            </p>
          </div>
          <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Toplanan</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {unlockedCount} <span className="text-slate-400 text-lg">/ {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Kategoriler Loop */}
        <div className="space-y-12">
          {categories.map((cat) => {
            const catBadges = BADGE_DEFINITIONS.filter(b => b.category === cat);
            
            return (
              <div key={cat}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-2 border-l-4 border-violet-500">
                  {cat} Rozetleri
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {catBadges.map((badgeDef) => {
                    const userStatus = userBadges.find((b) => b.id === badgeDef.id);
                    const isUnlocked = userStatus?.unlocked;

                    return (
                      <div 
                        key={badgeDef.id}
                        className={`
                          relative p-6 rounded-2xl border flex flex-col items-center text-center gap-4 transition-all duration-300
                          ${isUnlocked 
                            ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] hover:shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 grayscale opacity-70'}
                        `}
                      >
                        {/* Ikon Alanı */}
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-inner
                          ${isUnlocked ? badgeDef.bg : 'bg-slate-200 dark:bg-slate-800'}
                        `}>
                          {isUnlocked ? (
                            <div className={badgeDef.color}>{badgeDef.icon}</div>
                          ) : (
                            <Lock className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        {/* Metin Alanı */}
                        <div>
                          <h4 className={`font-bold ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            {badgeDef.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {badgeDef.desc}
                          </p>
                        </div>

                        {/* Unlocked Etiketi */}
                        {isUnlocked && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Layout>
  );
}