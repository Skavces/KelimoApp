import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { BookOpen, ChevronUp, ChevronDown } from "lucide-react";

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
  const [showMeaning, setShowMeaning] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isFlipping, setIsFlipping] = useState<{ [key: string]: boolean }>({});

  const token = localStorage.getItem("token");
  const decoded = decodeJwt(token);
  const userId = decoded?.sub || null;

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch("http://localhost:5001/words/feed");
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
  }, []);

  const total = words.length;
  const currentWord = total > 0 ? words[currentIndex] : null;

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
        await fetch(`http://localhost:5001/words/${id}/swipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            status: "LEARNED",
          }),
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

  const progressPercent =
    total === 0 ? 0 : ((currentIndex + 1) / total) * 100;

  return (
    <Layout>
      <div className="fixed inset-0 overflow-hidden bg-slate-950">
        {/* Progress bar - fixed top */}
        <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-medium text-slate-400">
                {learnedIds.length} kelime öğrenildi
              </span>
              <span className="text-xs font-semibold text-violet-400">
                {total === 0 ? "0/0" : `${currentIndex + 1}/${total}`}
              </span>
            </div>
            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-400 text-sm">
              Kelimeler yükleniyor...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && total === 0 && (
          <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-md w-full p-6 rounded-2xl border border-slate-800 bg-slate-900/70 text-center">
              <p className="text-slate-200 font-medium mb-2">
                Henüz kelime bulunamadı
              </p>
              <p className="text-sm text-slate-400">
                Backend’e birkaç Word kaydı ekleyince burada görünmeye
                başlayacak.
              </p>
            </div>
          </div>
        )}

        {/* Reels-style scrolling container */}
        {total > 0 && (
          <div
            ref={containerRef}
            className="h-full overflow-hidden relative"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Navigation arrows - Instagram style */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex((i) => i - 1);
                    setShowMeaning({});
                  }
                }}
                disabled={currentIndex === 0}
                className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group shadow-lg hover:shadow-xl"
              >
                <ChevronUp className="w-7 h-7 text-slate-300 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => {
                  if (currentIndex < total - 1) {
                    setCurrentIndex((i) => i + 1);
                    setShowMeaning({});
                  }
                }}
                disabled={currentIndex === total - 1}
                className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group shadow-lg hover:shadow-xl"
              >
                <ChevronDown className="w-7 h-7 text-slate-300 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div
              className="h-full transition-transform duration-500 ease-out"
              style={{
                transform: `translateY(calc(-${
                  currentIndex * 100
                }vh + ${isDragging ? currentY : 0}px))`,
              }}
            >
              {words.map((word) => (
                <div
                  key={word.id}
                  className="h-screen w-full flex items-center justify-center p-4"
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
                      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                        {/* Content */}
                        <div className="relative px-8 py-8 min-h-[540px] flex flex-col">
                          {/* Header badge */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 self-start mb-6">
                            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs font-medium text-violet-300">
                              Kelime Kartı
                            </span>
                          </div>

                          {/* Word */}
                          <div className="mb-8 flex items-center justify-center">
                            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-transparent">
                              {word.word}
                            </h1>
                          </div>

                          {/* Meaning section */}
                          <div className="flex-1">
                            {showMeaning[word.id] ? (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
                                  <h2 className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">
                                    Türkçe Anlamı
                                  </h2>
                                  <p className="text-lg font-medium text-slate-100">
                                    {word.meaning}
                                  </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-800/20 border border-slate-700/30">
                                  <h2 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                                    Örnek Kullanım
                                  </h2>
                                  <p className="text-sm text-slate-300 leading-relaxed italic">
                                    "{word.example}"
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30 border-dashed">
                                  <p className="text-sm text-slate-400">
                                    Anlamı ve örnek cümleyi görmek için{" "}
                                    <span className="text-violet-400 font-semibold">
                                      Çevir
                                    </span>{" "}
                                    butonuna dokun
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="mt-8 space-y-3">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => toggleMeaning(word.id)}
                                className="flex-1 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 text-sm font-semibold transition-all active:scale-95"
                              >
                                {showMeaning[word.id] ? "Gizle" : "Çevir"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLearned(word.id)}
                                className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all active:scale-95"
                              >
                                ✓ Öğrendim
                              </button>
                            </div>

                            <div className="text-center pt-2">
                              <p className="text-xs text-slate-500">
                                {currentIndex < total - 1
                                  ? "↑ Yukarı kaydır veya scroll yap"
                                  : "Tüm kelimeler tamamlandı! 🎉"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced shadow layers */}
                    <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 blur-2xl" />
                    <div className="absolute -inset-8 -z-20 rounded-[48px] bg-gradient-to-br from-slate-900/40 to-slate-950/40 blur-3xl" />
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
