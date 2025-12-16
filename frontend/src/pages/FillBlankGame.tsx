import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Quote, RefreshCcw } from "lucide-react";

type FillBlankQuestion = {
  id: string;
  question: string; // Gizli cümle
  correctAnswer: string;
  options: string[];
  meaning: string; // İpucu
};

export default function FillBlankGame() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Veri Çekme
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/game/fill-blank`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
             setQuestions(data);
          } else {
             setErrorMsg("Yeterli örnek cümleli kelime bulunamadı.");
          }
        } else {
          setErrorMsg(`Sunucu hatası: ${res.status}`);
        }
      } catch (e) {
        setErrorMsg("Bağlantı hatası.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [apiUrl, token]);

  // --- YENİ EKLENEN: Kayıt Fonksiyonu ---
  const finishGame = async (finalScore: number) => {
    setIsFinished(true);
    try {
      await fetch(`${apiUrl}/words/game-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameType: 'FILL_BLANK', // Veritabanında bu string'i kullanıyorsan
          score: finalScore * 10, // Her doğru 10 puan
          correct: finalScore,
          wrong: questions.length - finalScore
        })
      });
      console.log("FillBlank sonucu kaydedildi.");
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);

    const currentQ = questions[currentIndex];
    let nextScore = score;
    
    if (option === currentQ.correctAnswer) {
      nextScore = score + 1;
      setScore(nextScore);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(p => p + 1);
        setSelectedOption(null);
      } else {
        // Oyun Bitti
        finishGame(nextScore);
      }
    }, 1500);
  };

  // --- RENDER ---
  if (loading) return <Layout><div className="min-h-screen flex justify-center items-center text-slate-500">Oyun Hazırlanıyor...</div></Layout>;
  if (errorMsg) return <Layout><div className="min-h-screen flex justify-center items-center text-red-500">{errorMsg}</div></Layout>;

  // Sonuç Ekranı
  if (isFinished) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tebrikler! 🎉</h2>
            
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 mt-8">
                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Toplam Skor</div>
                <div className="text-5xl font-bold text-violet-600 dark:text-violet-400">
                    {score} <span className="text-2xl text-slate-400">/ {questions.length}</span>
                </div>
            </div>
            <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/practice')} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Listeye Dön
                </button>
                <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg hover:bg-violet-700 transition-colors flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Tekrar Oyna
                </button>
            </div>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
            <span className="text-sm font-bold text-slate-400">Soru {currentIndex + 1}/{questions.length}</span>
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-bold">Skor: {score}</span>
        </div>

        {/* Cümle Kartı */}
        <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center mb-10 shadow-sm">
            <Quote className="absolute top-6 left-6 w-8 h-8 text-violet-200 dark:text-violet-900 rotate-180" />
            
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentQ.question.split('{{BLANK}}').map((part, i, arr) => (
                    <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                            <span className={`inline-block border-b-4 px-2 mx-1 min-w-[100px] text-center transition-colors align-bottom ${
                                selectedOption 
                                  ? (selectedOption === currentQ.correctAnswer ? 'text-green-600 border-green-500' : 'text-red-500 border-red-500')
                                  : 'text-violet-600 border-violet-500 dark:border-violet-400'
                            }`}>
                                {/* Boşluk gösterimi: Cevap seçilmişse o cevap, yoksa alt çizgi */}
                                {selectedOption ? (selectedOption === currentQ.correctAnswer ? currentQ.correctAnswer : selectedOption) : ''}
                            </span>
                        )}
                    </span>
                ))}
            </h2>
            
            {/* İpucu (Türkçesi) */}
            <div className="mt-6 inline-block px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    İpucu: {currentQ.meaning}
                </p>
            </div>
        </div>

        {/* Şıklar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => {
                let btnClass = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20";
                
                if (selectedOption) {
                    if (option === currentQ.correctAnswer) {
                        btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                    } else if (option === selectedOption) {
                        btnClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                    } else {
                        btnClass = "opacity-50 pointer-events-none";
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={!!selectedOption}
                        className={`
                            p-5 rounded-xl border-2 text-lg font-semibold transition-all duration-200
                            ${btnClass}
                            ${!selectedOption ? 'active:scale-95' : ''}
                        `}
                    >
                        {option}
                    </button>
                )
            })}
        </div>

      </div>
    </Layout>
  );
}