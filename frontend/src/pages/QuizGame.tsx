import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, RefreshCcw } from "lucide-react";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function QuizGame() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'EN_TR';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Gerçek API'den soru çekme
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/quiz?mode=${mode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          console.error("Sorular yüklenemedi");
        }
      } catch (err) {
        console.error("Quiz hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [mode, apiUrl, token]);

  // --- YENİ EKLENEN KISIM: Oyunu Kaydetme Fonksiyonu ---
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
          gameType: 'QUIZ',
          score: finalScore * 10, // Her doğru cevap 10 XP
          correct: finalScore,
          wrong: questions.length - finalScore
        })
      });
      console.log("Oyun sonucu başarıyla kaydedildi!");
    } catch (error) {
      console.error("Oyun sonucu kaydedilirken hata oluştu:", error);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption) return; 
    setSelectedOption(option);

    // Skoru anlık hesaplayalım ki son soruda güncel veri gitsin
    let nextScore = score;
    if (option === questions[currentQIndex].correctAnswer) {
      nextScore = score + 1;
      setScore(nextScore);
    } 

    // 1.5 sn sonra sonraki soru veya bitiş
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // Oyun Bitti - Yeni fonksiyonu çağırıyoruz
        finishGame(nextScore);
      }
    }, 1500);
  };

  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center text-slate-500">Oyun Hazırlanıyor...</div></Layout>;
  
  if (questions.length === 0) return <Layout><div className="min-h-screen flex items-center justify-center text-slate-500">Soru bulunamadı.</div></Layout>;

  // SONUÇ EKRANI
  if (isFinished) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tebrikler! 🎉</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
                Alıştırmayı tamamladın. Puanın hesabına eklendi.
            </p>
            
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Toplam Skor</div>
                <div className="text-5xl font-bold text-violet-600 dark:text-violet-400">
                    {score} <span className="text-2xl text-slate-400">/ {questions.length}</span>
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <button 
                    onClick={() => navigate('/practice')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Listeye Dön
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/25"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Tekrar Oyna
                </button>
            </div>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex + 1) / questions.length) * 100;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        
        {/* Header & Progress */}
        <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Soru {currentQIndex + 1}/{questions.length}
                </span>
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    Skor: {score}
                </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-violet-500 transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        {/* Soru Kartı */}
        <div className="text-center mb-10">
            <h3 className="text-lg text-slate-500 dark:text-slate-400 mb-4 font-medium uppercase tracking-wider">
                {mode === 'EN_TR' ? 'Bu kelimenin anlamı ne?' : 'Bu kelimenin İngilizcesi ne?'}
            </h3>
            <div className="inline-block px-10 py-6 bg-white dark:bg-slate-950 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none min-w-[300px]">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                    {currentQ.question}
                </h1>
            </div>
        </div>

        {/* Şıklar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, idx) => {
                let btnClass = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20";
                
                if (selectedOption) {
                    if (option === currentQ.correctAnswer) {
                        btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                    } else if (option === selectedOption && option !== currentQ.correctAnswer) {
                        btnClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                    } else {
                        btnClass = "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-900 opacity-50";
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={!!selectedOption}
                        className={`
                            p-6 rounded-2xl border-2 text-lg font-semibold transition-all duration-200
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