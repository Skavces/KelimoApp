import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { ChevronUp, ChevronDown, Volume2 } from "lucide-react";

// --- JWT Decode ---
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

type WordCard = {
  id: string;
  word: string;
  meaning: string;
  example: string;
};

export default function Learn() {
  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState<{ [key: string]: boolean }>({});
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dikey Kaydırma State'leri
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const [isFlipping, setIsFlipping] = useState<{ [key: string]: boolean }>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- SES ÖNBELLEĞİ (CACHE) ---
  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const token = localStorage.getItem("token");
  const decoded = decodeJwt(token);
  const userId = decoded?.sub || null;

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const initVoice = () => { window.speechSynthesis.getVoices(); };
    initVoice();
    window.speechSynthesis.onvoiceschanged = initVoice;
  }, []);

  useEffect(() => {
    const fetchWords = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/words/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const mapped: WordCard[] = data.map((w: any) => ({
          id: w.id,
          word: w.text,
          meaning: w.meaning,
          example: w.example ?? "",
        }));
        setWords(mapped);
      } catch (err) {
        console.error("Kelime feed alınırken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [token, apiUrl]);

  // --- PRELOAD ---
  useEffect(() => {
    if (words.length === 0) return;

    const preloadList = [
      words[currentIndex]?.word,
      words[currentIndex + 1]?.word,
    ];

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

  const total = words.length;

  // --- SPEAK FONKSİYONU ---
  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();

    window.speechSynthesis.cancel();
    if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);

    const voices = window.speechSynthesis.getVoices();

    // Senaryo A: Native
    if (voices.length > 0) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => playFallbackAudio(text);
        window.speechSynthesis.speak(utterance);
    } 
    // Senaryo B: Fallback
    else {
        playFallbackAudio(text);
    }
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
          playPromise.catch(error => {
              console.error("Playback hatası:", error);
              setIsSpeaking(false);
          });
      }

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (total === 0) return;
    if (Math.abs(e.deltaY) > 10) {
      if (e.deltaY > 0 && currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
        setShowMeaning({});
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setShowMeaning({});
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (total === 0) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    setCurrentY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(currentY) > 100) {
      if (currentY < 0 && currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
        setShowMeaning({});
      } else if (currentY > 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setShowMeaning({});
      }
    }
    setCurrentY(0);
    setStartY(0);
  };

  const handleLearned = async (id: string) => {
    if (!learnedIds.includes(id)) {
      setLearnedIds((prev) => [...prev, id]);
    }
    if (userId) {
      try {
        await fetch(`${apiUrl}/words/${id}/swipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "LEARNED" }),
        });
      } catch (err) {
        console.error("Swipe kaydedilirken hata:", err);
      }
    }
    if (currentIndex < total - 1) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setShowMeaning({});
      }, 200);
    }
  };

  const toggleMeaning = (id: string) => {
    setIsFlipping((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setShowMeaning((prev) => ({ ...prev, [id]: !prev[id] }));
    }, 150);
    setTimeout(() => {
      setIsFlipping((prev) => ({ ...prev, [id]: false }));
    }, 300);
  };

  const progressPercent = total === 0 ? 0 : ((currentIndex + 1) / total) * 100;

  return (
    <Layout>
      <div className="fixed inset-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {learnedIds.length} kelime öğrenildi
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {total === 0 ? "0/0" : `${currentIndex + 1}/${total}`}
              </span>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-500 dark:text-slate-300 text-sm">
              Kelimeler yükleniyor...
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && total === 0 && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center shadow-lg">
              <p className="text-slate-900 dark:text-white font-medium mb-2">
                Şu an yeni kelime yok
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Harika gidiyorsun! Tüm kelimeleri tamamladın.
              </p>
            </div>
          </div>
        )}

        {/* Scrolling container (Reels style) */}
        {total > 0 && (
          <div
            ref={containerRef}
            className="h-full overflow-hidden relative"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Arrows */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 hidden md:flex">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex((i) => i - 1);
                    setShowMeaning({});
                  }
                }}
                disabled={currentIndex === 0}
                className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group shadow-lg"
              >
                <ChevronUp className="w-7 h-7 text-slate-600 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => {
                  if (currentIndex < total - 1) {
                    setCurrentIndex((i) => i + 1);
                    setShowMeaning({});
                  }
                }}
                disabled={currentIndex === total - 1}
                className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group shadow-lg"
              >
                <ChevronDown className="w-7 h-7 text-slate-600 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Slider Wrapper */}
            <div
              className="h-full transition-transform duration-500 ease-out"
              style={{
                transform: `translateY(calc(-${currentIndex * 100}vh + ${isDragging ? currentY : 0}px))`,
              }}
            >
              {words.map((word) => (
                <div
                  key={word.id}
                  className="h-screen w-full flex items-center justify-center p-4 pt-16"
                >
                  <div className="relative w-full max-w-md">
                    <div
                      className="relative transition-all duration-300 ease-in-out"
                      style={{
                        transform: isFlipping[word.id]
                          ? "rotateY(90deg) scale(0.95)"
                          : "rotateY(0deg) scale(1)",
                        transformStyle: "preserve-3d",
                        opacity: isFlipping[word.id] ? 0.3 : 1,
                      }}
                    >
                      {/* Kart */}
                      <div className="relative rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none overflow-hidden">
                        
                        {/* İçerik */}
                        <div className="relative px-8 py-8 min-h-[500px] flex flex-col">
                          
                          {/* YENİ ROZET BUTONU */}
                          {/* "Kelime Kartı" -> "Telaffuzu Dinle" butonu oldu */}
                          <button
                            onClick={(e) => handleSpeak(word.word, e)}
                            className={`
                              inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                              bg-violet-100 dark:bg-violet-900/30 
                              border border-violet-200 dark:border-violet-800 
                              self-start mb-6 transition-all active:scale-95 hover:bg-violet-200 dark:hover:bg-violet-900/50 cursor-pointer
                              ${isSpeaking ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-950' : ''}
                            `}
                          >
                            <Volume2 className={`w-3.5 h-3.5 text-violet-600 dark:text-violet-300 ${isSpeaking ? 'animate-pulse' : ''}`} />
                            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                              Telaffuzu Dinle
                            </span>
                          </button>

                          {/* KELİME (Artık yanındaki buton gitti, temiz) */}
                          <div className="mb-8 w-full flex justify-center">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
                                {word.word}
                            </h1>
                          </div>

                          <div className="flex-1">
                            {showMeaning[word.id] ? (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Anlam */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                  <h2 className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-wider">
                                    Türkçe Anlamı
                                  </h2>
                                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                    {word.meaning}
                                  </p>
                                </div>
                                {/* Örnek */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                  <h2 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wider">
                                    Örnek Kullanım
                                  </h2>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    "{word.example}"
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed">
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Anlamı ve örnek cümleyi görmek için{" "}
                                    <span className="text-violet-600 dark:text-violet-400 font-semibold">
                                      Çevir
                                    </span>{" "}
                                    butonuna dokun
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Butonlar */}
                          <div className="mt-8 space-y-3">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => toggleMeaning(word.id)}
                                className="flex-1 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all active:scale-95"
                              >
                                {showMeaning[word.id] ? "Gizle" : "Çevir"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLearned(word.id)}
                                className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                              >
                                ✓ Öğrendim
                              </button>
                            </div>
                            <div className="text-center pt-2">
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {currentIndex < total - 1
                                  ? "↑ Yukarı kaydır veya scroll yap"
                                  : "Tüm kelimeler tamamlandı! 🎉"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Glow */}
                    <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 blur-2xl opacity-50 dark:opacity-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}