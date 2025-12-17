import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { 
  Trophy, Flame, Target, Calendar, TrendingUp, Medal, Star,
  Gamepad2, CheckCircle2, XCircle, Clock, ChevronRight
} from "lucide-react";

export default function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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

  // Veri null gelirse patlamasın diye önlem
  const { totalLearned, accuracy, weeklyData, badges, recentGames, totalScore, streak } = data || {};

  // Pasta Grafik Verisi
  const accuracyChartData = [
    { name: 'Doğru', value: accuracy || 0, color: '#8b5cf6' },
    { name: 'Yanlış', value: 100 - (accuracy || 0), color: '#cbd5e1' },
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
              value: totalScore || 0,
              icon: Trophy, 
              color: "text-yellow-500", 
              bg: "bg-yellow-100 dark:bg-yellow-900/20" 
            },
            { 
              label: "Gün Serisi", 
              value: `${streak || 0} Gün`,
              icon: Flame, 
              color: "text-orange-500", 
              bg: "bg-orange-100 dark:bg-orange-900/20" 
            },
            { 
              label: "Öğrenilen", 
              value: totalLearned || 0, 
              icon: Calendar, 
              color: "text-blue-500", 
              bg: "bg-blue-100 dark:bg-blue-900/20" 
            },
            { 
              label: "Başarı Oranı", 
              value: `%${accuracy || 0}`, 
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
              Son 7 Günlük Aktivite (Öğrenilen Kelime)
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
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">%{accuracy || 0}</span>
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

        {/* Rozetler Kısayolu */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" />
              Başarı Rozetleri
            </h3>
            <button 
              onClick={() => navigate('/achievements')}
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
             {/* Şık bir özet kartı */}
             <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between cursor-pointer shadow-lg shadow-violet-500/20 transform transition hover:scale-[1.01]"
                  onClick={() => navigate("/achievements")}>
                <div>
                   <h4 className="text-lg font-bold">Rozet Koleksiyonunu Görüntüle</h4>
                   <p className="text-violet-100 text-sm mt-1">
                     Şu ana kadar kazanılan: <span className="font-bold">{badges ? badges.filter((b:any) => b.unlocked).length : 0}</span> / 16
                   </p>
                </div>
                <div className="flex -space-x-3 pl-4">
                   <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-yellow-900"><Star className="w-5 h-5" /></div>
                   <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white"><Flame className="w-5 h-5" /></div>
                   <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white"><Target className="w-5 h-5" /></div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-xs font-bold">...</div>
                </div>
             </div>
          </div>
        </div>

        {/* Son Oyun Geçmişi */}
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
                          {game.gameType === 'QUIZ' ? 'Kelime Eşleştirme' :
                           game.gameType === 'FILL_BLANK' ? 'Cümle Tamamlama' : 
                           game.gameType === 'SCRAMBLE' ? 'Kelime Kurmaca' :
                           game.gameType === 'MEMORY' ? 'Hafıza Kartları' : 
                           game.gameType === 'DICTATION' ? 'Dinle ve Yaz' : 
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