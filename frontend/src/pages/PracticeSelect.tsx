import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { Languages, Type, AlertCircle, Play, Puzzle, Quote, Brain, Mic } from "lucide-react";

export default function PracticeSelect() {
  const navigate = useNavigate();
  const [learnedCount, setLearnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Oyunların açılması için gereken minimum kelime sayısı
  const MIN_WORD_COUNT = 5;
  
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch(`${apiUrl}/words/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) {
              const data = await res.json();
              setLearnedCount(data.learnedCount || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, [apiUrl, token]);

  const handleStartGame = (path: string) => {
    if (learnedCount < MIN_WORD_COUNT) return;
    navigate(path);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Alıştırma Merkezi 🎮
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Hafızanı test et ve öğrendiklerini pekiştir.
        </p>

        {/* Uyarı: Yetersiz Kelime */}
        {!loading && learnedCount < MIN_WORD_COUNT && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Yetersiz Kelime Sayısı</h3>
                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                    Oyunları oynayabilmek için en az {MIN_WORD_COUNT} kelime öğrenmelisin. 
                    Şu an {learnedCount} kelime biliyorsun.
                </p>
                <button 
                    onClick={() => navigate('/learn')}
                    className="mt-2 text-xs font-bold text-amber-900 dark:text-amber-300 underline"
                >
                    Hemen Kelime Öğren →
                </button>
            </div>
          </div>
        )}

        {/* Oyun Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Oyun: İngilizce -> Türkçe */}
          <div 
            onClick={() => handleStartGame('/practice/game?mode=EN_TR')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-violet-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                  <Languages className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kelime Eşleştirme</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Sana İngilizce kelimeyi vereceğiz, doğru Türkçe anlamını bulmaya çalışacaksın.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

          {/* 2. Oyun: Türkçe -> İngilizce */}
          <div 
            onClick={() => handleStartGame('/practice/game?mode=TR_EN')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-fuchsia-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
             <div>
               <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mb-6 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
                  <Type className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ters Köşe</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Bu sefer Türkçe anlamını vereceğiz, doğru İngilizce karşılığını sen bulacaksın.
              </p>
             </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

          {/* 3. Oyun: Kelime Kurmaca (Scramble) */}
          <div 
            onClick={() => handleStartGame('/practice/scramble')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
             <div>
               <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <Puzzle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kelime Kurmaca</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Karışık harfleri sıraya diz ve gizli kelimeyi ortaya çıkar. Yazım becerini geliştir.
              </p>
             </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

          {/* 4. Oyun: Cümle Tamamlama */}
          <div 
            onClick={() => handleStartGame('/practice/fill-blank')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
             <div>
               <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Quote className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cümle Tamamlama</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Bağlamı yakala! Boş bırakılan yere hangi kelimenin geleceğini bularak cümleyi tamamla.
              </p>
             </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

          {/* 5. Oyun: Hafıza Kartları - DÜZELTME: COL-SPAN KALDIRILDI */}
          <div 
            onClick={() => handleStartGame('/practice/memory')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-pink-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
             <div>
                <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <Brain className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hafıza Kartları</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Kartları çevir, eşleri bul! Görsel hafızanı kullanarak kelimeleri ve anlamlarını eşleştir.
                </p>
             </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

          {/* 6. Oyun: Dinle ve Yaz - DÜZELTME: COL-SPAN KALDIRILDI */}
          <div 
            onClick={() => handleStartGame('/practice/dictation')}
            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                ${learnedCount >= MIN_WORD_COUNT 
                    ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'}
            `}
          >
             <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dinle ve Yaz</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Kulağını test et! Duyduğun kelimeyi doğru harflerle yazabilecek misin?
                </p>
             </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mt-auto">
                <Play className="w-4 h-4 fill-current" />
                Oyuna Başla
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}