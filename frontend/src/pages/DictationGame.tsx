import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, RefreshCcw, Volume2, Mic } from "lucide-react";

type DictationWord = {
  id: string;
  word: string;
  meaning: string;
};

export default function DictationGame() {
  const navigate = useNavigate();
  const [words, setWords] = useState<DictationWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Oyun State'leri
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ses Önbelleği
  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // 1. Veri Çekme
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/game/dictation`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
             setWords(data);
          } else {
             setErrorMsg("Yeterli kelime bulunamadı.");
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

  // 2. Preload ve Otomatik Odaklanma
  useEffect(() => {
    if (words.length === 0) return;

    // Yeni soruya geçince input'u temizle ve odaklan
    setUserInput("");
    setStatus('playing');
    inputRef.current?.focus();

    // Sesleri önbelleğe al
    const preloadList = [words[currentIndex]?.word, words[currentIndex + 1]?.word];
    preloadList.forEach((text) => {
      if (text && !audioCache.current[text]) {
        const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
        const audio = new Audio(url);
        audio.preload = "auto";
        audio.load();
        audioCache.current[text] = audio;
      }
    });
  }, [currentIndex, words]);

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
          gameType: 'DICTATION',
          score: finalScore * 10, // Her doğru 10 puan
          correct: finalScore,
          wrong: words.length - finalScore
        })
      });
      console.log("Dictation sonucu kaydedildi.");
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  // 3. Ses Çalma Fonksiyonu (Hybrid)
  const handleSpeak = () => {
    const text = words[currentIndex]?.word;
    if (!text) return;

    window.speechSynthesis.cancel();
    if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    inputRef.current?.focus(); // Butona basınca odaktan çıkmasın

    playFallbackAudio(text);
  };

  const playFallbackAudio = (text: string) => {
      let audio = audioCache.current[text];
      if (!audio) {
          const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
          audio = new Audio(url);
          audioCache.current[text] = audio;
      }

      activeAudioRef.current = audio;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(() => {
              setIsSpeaking(false);
          });
      }

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
  };

  // 4. Cevap Kontrol
  const checkAnswer = () => {
    if (!words[currentIndex]) return;
    
    const correctWord = words[currentIndex].word.trim().toLowerCase();
    const userWord = userInput.trim().toLowerCase();
    let nextScore = score;

    if (userWord === correctWord) {
      setStatus('correct');
      nextScore = score + 1;
      setScore(nextScore);
    } else {
      setStatus('wrong');
    }

    const delay = userWord === correctWord ? 1000 : 2500;

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Oyun Bitti
        finishGame(nextScore);
      }
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && status === 'playing' && userInput.trim() !== "") {
      checkAnswer();
    }
  };

  if (loading) return <Layout><div className="min-h-screen flex justify-center items-center text-slate-500">Oyun Yükleniyor...</div></Layout>;
  if (errorMsg) return <Layout><div className="min-h-screen flex justify-center items-center text-red-500">{errorMsg}</div></Layout>;

  if (isFinished) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Kulaklar Sağlam! 🎧</h2>
            
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
                <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg hover:bg-violet-700 transition-colors flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Tekrar Oyna
                </button>
            </div>
        </div>
      </Layout>
    );
  }

  const currentWordObj = words[currentIndex];

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-12">
            <span className="text-sm font-bold text-slate-400">Soru {currentIndex + 1}/{words.length}</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">Skor: {score}</span>
        </div>

        {/* Ses Butonu (Kocaman) */}
        <div className="relative mb-10">
            <button
                onClick={handleSpeak}
                className={`
                    w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
                    ${isSpeaking 
                        ? 'bg-violet-100 dark:bg-violet-900/30 scale-110 shadow-[0_0_40px_rgba(139,92,246,0.3)]' 
                        : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 shadow-xl'}
                `}
            >
                <Volume2 className={`w-12 h-12 text-violet-600 dark:text-violet-400 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </button>
            <p className="text-center mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Dinlemek için tıkla
            </p>
        </div>

        {/* Input Alanı */}
        <div className="w-full mb-6">
            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== 'playing'}
                placeholder="Duyduğun kelimeyi yaz..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className={`
                    w-full text-center text-3xl font-bold py-4 bg-transparent border-b-4 outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700
                    ${status === 'correct' ? 'border-green-500 text-green-600' :
                      status === 'wrong' ? 'border-red-500 text-red-500' :
                      'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'}
                `}
            />
        </div>

        {/* Doğru Cevap (Yanlışsa Göster) */}
        <div className={`h-12 flex flex-col items-center justify-center transition-opacity duration-300 ${status === 'wrong' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Doğrusu</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-wider">{currentWordObj.word}</span>
        </div>

        {/* Buton */}
        <button
            onClick={checkAnswer}
            disabled={status !== 'playing' || !userInput.trim()}
            className="w-full py-4 mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
            {status === 'playing' ? 'Kontrol Et' : status === 'correct' ? 'Doğru! 🎉' : 'Yanlış 😔'}
        </button>

      </div>
    </Layout>
  );
}