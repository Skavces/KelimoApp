import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, XCircle } from "lucide-react";

type ScrambleWord = {
  id: string;
  word: string;
  meaning: string;
};

export default function WordScramble() {
  const navigate = useNavigate();
  const [words, setWords] = useState<ScrambleWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Oyun State'leri
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number, char: string }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: number, char: string }[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // 1. Veri Çekme
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/game/scramble`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
             setWords(data);
          } else {
             setErrorMsg("Yeterli kelime bulunamadı veya veri formatı hatalı.");
          }
        } else {
          setErrorMsg(`Sunucu hatası: ${res.status}.`);
        }
      } catch (e) {
        console.error("Fetch Hatası:", e);
        setErrorMsg("Bağlantı hatası oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [apiUrl, token]);

  // 2. Yeni Soru Hazırlığı
  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      const wordObj = words[currentIndex];
      if (wordObj && wordObj.word) {
          const word = wordObj.word.toUpperCase();
          const letters = word.split('').map((char, index) => ({ id: index, char }));
          setScrambledLetters(letters.sort(() => 0.5 - Math.random()));
          setSelectedLetters([]);
          setStatus('playing');
      }
    }
  }, [currentIndex, words]);

  // --- YENİ EKLENEN: Oyunu Kaydetme Fonksiyonu ---
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
          gameType: 'SCRAMBLE',
          score: finalScore * 10, // Her kelime 10 puan
          correct: finalScore,
          wrong: words.length - finalScore
        })
      });
      console.log("Scramble sonucu kaydedildi.");
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  // 3. Fonksiyonlar
  const handleLetterClick = useCallback((letterObj: { id: number, char: string }) => {
    if (status !== 'playing') return;
    setSelectedLetters(prev => [...prev, letterObj]);
    setScrambledLetters(prev => prev.filter(l => l.id !== letterObj.id));
  }, [status]);

  const handleUndoClick = useCallback((letterObj: { id: number, char: string }) => {
    if (status !== 'playing') return;
    setSelectedLetters(prev => prev.filter(l => l.id !== letterObj.id));
    setScrambledLetters(prev => [...prev, letterObj]);
  }, [status]);

  const checkAnswer = useCallback(() => {
    if (!words[currentIndex] || status !== 'playing') return;

    const currentWord = words[currentIndex].word.toUpperCase();
    const userWord = selectedLetters.map(l => l.char).join('');

    if (userWord.length !== currentWord.length) return;

    let delay = 1500;
    
    // Skoru yerel değişkende tutuyoruz ki son soruda güncel haliyle gönderebilelim
    let nextScore = score; 

    if (userWord === currentWord) {
      setStatus('correct');
      nextScore = score + 1; // Doğruysa artır
      setScore(nextScore);   // State güncelle
    } else {
      setStatus('wrong');
      delay = 2500;
      // Yanlışsa nextScore aynı kalır
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Oyun bitti, son hesaplanan skoru gönder
        finishGame(nextScore);
      }
    }, delay);
  }, [words, currentIndex, selectedLetters, status, score, token, apiUrl]); // score dependency'e eklendi

  // 4. Klavye Dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (status !== 'playing') return;

        const key = e.key.toUpperCase();

        if (e.key === 'Backspace') {
            if (selectedLetters.length > 0) {
                const lastLetter = selectedLetters[selectedLetters.length - 1];
                handleUndoClick(lastLetter);
            }
            return;
        }

        if (e.key === 'Enter') {
            checkAnswer();
            return;
        }

        if (/^[A-Z]$/.test(key)) {
            const matchingLetter = scrambledLetters.find(l => l.char === key);
            if (matchingLetter) {
                handleLetterClick(matchingLetter);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrambledLetters, selectedLetters, status, handleLetterClick, handleUndoClick, checkAnswer]);


  // --- RENDER ---
  if (loading) return <Layout><div className="min-h-screen flex justify-center items-center text-slate-500">Oyun Yükleniyor...</div></Layout>;
  if (errorMsg) return <Layout><div className="min-h-screen flex flex-col justify-center items-center text-red-500 gap-4"><p>{errorMsg}</p><button onClick={() => navigate('/practice')} className="px-4 py-2 bg-slate-200 rounded-lg text-slate-800">Geri Dön</button></div></Layout>;
  if (words.length === 0) return <Layout><div className="min-h-screen flex justify-center items-center text-slate-500">Yeterli kelime yok.</div></Layout>;

  const currentWordObj = words[currentIndex];
  if (!currentWordObj) return <Layout><div className="p-10 text-center">Bir hata oluştu.</div></Layout>;

  if (isFinished) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Harika İş! 🧩</h2>
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 mt-8">
                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Toplam Skor</div>
                <div className="text-5xl font-bold text-violet-600 dark:text-violet-400">
                    {score} <span className="text-2xl text-slate-400">/ {words.length}</span>
                </div>
            </div>
            <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/practice')} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Listeye Dön
                </button>
                <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg hover:bg-violet-700 transition-colors">Tekrar Oyna</button>
            </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-12">
            <span className="text-sm font-bold text-slate-400">Soru {currentIndex + 1}/{words.length}</span>
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-bold">Skor: {score}</span>
        </div>

        {/* Anlam (İpucu) */}
        <h2 className="text-xl md:text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2 text-center animate-in fade-in slide-in-from-bottom-4">
            "{currentWordObj.meaning}"
        </h2>

        {/* Cevap Alanı (Boşluklar) */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 min-h-[64px]">
            {selectedLetters.map((l) => (
                <button
                    key={l.id}
                    onClick={() => handleUndoClick(l)}
                    className={`
                        w-12 h-14 rounded-xl text-2xl font-bold border-b-4 transition-all active:scale-95 shadow-sm
                        ${status === 'correct' ? 'bg-green-500 border-green-700 text-white' : 
                          status === 'wrong' ? 'bg-red-500 border-red-700 text-white' : 
                          'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'}
                    `}
                >
                    {l.char}
                </button>
            ))}
            {/* Boş placeholder kutuları */}
            {Array.from({ length: Math.max(0, currentWordObj.word.length - selectedLetters.length) }).map((_, i) => (
                <div key={i} className="w-12 h-14 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800" />
            ))}
        </div>

        {/* --- YENİ EKLENEN KISIM: DOĞRU CEVAP GÖSTERİMİ --- */}
        {status === 'wrong' && (
            <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-1">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wide">Doğru Cevap</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-widest">
                    {currentWordObj.word.toUpperCase()}
                </div>
            </div>
        )}

        {/* Karışık Harfler */}
        <div className={`flex flex-wrap gap-3 justify-center mb-12 max-w-md transition-opacity duration-300 ${status !== 'playing' ? 'opacity-50 pointer-events-none' : ''}`}>
            {scrambledLetters.map((l) => (
                <button
                    key={l.id}
                    onClick={() => handleLetterClick(l)}
                    className="w-12 h-14 rounded-xl bg-violet-100 dark:bg-slate-800 hover:bg-violet-200 dark:hover:bg-slate-700 border-b-4 border-violet-300 dark:border-slate-950 text-violet-700 dark:text-violet-300 text-xl font-bold transition-all active:scale-95 active:border-b-0 active:translate-y-1 shadow-sm"
                >
                    {l.char}
                </button>
            ))}
        </div>

        {/* Kontrol Butonu */}
        <button
            onClick={checkAnswer}
            disabled={selectedLetters.length !== currentWordObj.word.length || status !== 'playing'}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-lg shadow-xl shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
            {status === 'playing' ? 'Kontrol Et (Enter)' : status === 'correct' ? 'Doğru! 🎉' : 'Yanlış 😔'}
        </button>

      </div>
    </Layout>
  );
}