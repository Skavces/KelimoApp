import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { 
  Trophy, Flame, Target, Calendar, TrendingUp, Medal, Lock, Star,
  Gamepad2, CheckCircle2, XCircle, Clock
} from "lucide-react";

// Rozet Tanımları (Statik, sadece kilit durumu dinamik olacak)
const BADGE_DEFINITIONS = [
  { id: 1, name: "Yeni Başlayan", desc: "İlk 10 kelimeyi öğren", icon: <Star className="w-5 h-5 text-yellow-500" /> },
  { id: 2, name: "Alev Alev", desc: "7 Günlük seri yap", icon: <Flame className="w-5 h-5 text-orange-500" /> }, 
  { id: 3, name: "Kelime Avcısı", desc: "100 kelimeye ulaş", icon: <Target className="w-5 h-5 text-blue-500" /> },
  { id: 4, name: "Usta Dilci", desc: "%90 başarı ve 20+ oyun", icon: <Medal className="w-5 h-5 text-purple-500" /> },
];

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Veri çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl, token]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </Layout>
    );
  }

  // API'den gelen verileri parçalayalım
  // recentGames, totalScore ve streak artık backend'den geliyor
  const { totalLearned, accuracy, weeklyData, badges, recentGames, totalScore, streak } = data;

  // Pasta Grafik Verisi (Gerçek)
  const accuracyChartData = [
    { name: 'Doğru', value: accuracy, color: '#8b5cf6' },
    { name: 'Yanlış', value: 100 - accuracy, color: '#cbd5e1' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            İlerleme Durumu 📈
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerçek zamanlı öğrenme analizin ve oyun geçmişin.
          </p>
        </div>

        {/* Üst İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { 
              label: "Toplam Puan", 
              value: totalScore || 0, // Backend'den gelen gerçek skor
              icon: Trophy, 
              color: "text-yellow-500", 
              bg: "bg-yellow-100 dark:bg-yellow-900/20" 
            },
            { 
              label: "Gün Serisi", 
              value: `${streak} Gün`, // Backend'den gelen gerçek streak
              icon: Flame, 
              color: "text-orange-500", 
              bg: "bg-orange-100 dark:bg-orange-900/20" 
            },
            { 
              label: "Öğrenilen", 
              value: totalLearned, 
              icon: Calendar, 
              color: "text-blue-500", 
              bg: "bg-blue-100 dark:bg-blue-900/20" 
            },
            { 
              label: "Başarı Oranı", 
              value: `%${accuracy}`, 
              icon: TrendingUp, 
              color: "text-emerald-500", 
              bg: "bg-emerald-100 dark:bg-emerald-900/20" 
            },
          ].map((stat, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Haftalık Aktivite */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-500" />
              Son 7 Günlük Aktivite
            </h3>
            <div className="h-[300px] w-full">
              {weeklyData && weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="words" fill="#8b5cf6" radius={[8, 8, 8, 8]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Henüz veri yok.
                </div>
              )}
            </div>
          </div>

          {/* Başarı Oranı */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 w-full">
              <Target className="w-5 h-5 text-emerald-500" />
              Başarı Dağılımı
            </h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyChartData}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                    dataKey="value" stroke="none"
                  >
                    {accuracyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">%{accuracy}</span>
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Doğru</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Yanlış</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rozetler */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            Başarı Rozetleri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {BADGE_DEFINITIONS.map((badgeDef) => {
              // Backend'den gelen unlocked bilgisini bul
              const isUnlocked = badges.find((b: any) => b.id === badgeDef.id)?.unlocked;

              return (
                <div 
                  key={badgeDef.id}
                  onMouseEnter={() => setHoveredBadge(badgeDef.id)}
                  onMouseLeave={() => setHoveredBadge(null)}
                  className={`
                    relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3
                    ${isUnlocked 
                      ? 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-200 dark:border-violet-500/30' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale'
                    }
                  `}
                >
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm
                    ${isUnlocked ? 'bg-white dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-800'}
                  `}>
                    {isUnlocked ? badgeDef.icon : <Lock className="w-6 h-6 text-slate-400" />}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{badgeDef.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{badgeDef.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- YENİ EKLENEN: SON OYUN GEÇMİŞİ --- */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-500" />
            Son Oyun Geçmişi
          </h3>

          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {recentGames && recentGames.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentGames.map((game: any) => (
                  <div key={game.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    
                    {/* Sol Taraf: İkon ve Oyun Adı */}
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                        ${game.gameType === 'QUIZ' ? 'bg-orange-100 text-orange-600' : 
                          game.gameType === 'SCRAMBLE' ? 'bg-blue-100 text-blue-600' :
                          game.gameType === 'MEMORY' ? 'bg-purple-100 text-purple-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {game.gameType === 'QUIZ' ? 'Kelime Testi' : 
                           game.gameType === 'SCRAMBLE' ? 'Kelime Avı' :
                           game.gameType === 'MEMORY' ? 'Hafıza Oyunu' : 
                           game.gameType === 'DICTATION' ? 'Dinleme' : 
                           game.gameType}
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(game.createdAt).toLocaleDateString("tr-TR", { 
                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Orta: Skor ve Doğru/Yanlış */}
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end">
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> {game.correct} Doğru
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-red-500">
                          <XCircle className="w-3 h-3" /> {game.wrong} Yanlış
                        </div>
                      </div>
                      
                      {/* Puan Badge */}
                      <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-slate-700 dark:text-slate-300 min-w-[70px] text-center">
                        +{game.score} XP
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // Eğer hiç oyun yoksa boş ekran
              <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Henüz kayıtlı bir oyun geçmişi yok.</p>
                <p className="text-sm mt-1">Biraz pratik yaparak puan toplamaya başla!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}