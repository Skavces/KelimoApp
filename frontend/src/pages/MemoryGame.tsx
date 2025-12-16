import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, RefreshCcw, Brain } from "lucide-react";

type MemoryCard = {
  id: string;
  matchId: string;
  text: string;
  type: 'EN' | 'TR';
};

export default function MemoryGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Oyun Durumu
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]); // Şu an açık olanlar (max 2)
  const [matchedIds, setMatchedIds] = useState<string[]>([]); // Eşleşmiş ID'ler
  const [moves, setMoves] = useState(0); // Hamle sayısı
  const [isProcessing, setIsProcessing] = useState(false); // Kartlar geri dönerken tıklamayı engelle

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // 1. Oyunu Başlat / Veri Çek
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${apiUrl}/words/game/memory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCards(data);
        } else {
          setErrorMsg("Yeterli kelime bulunamadı.");
        }
      } catch (e) {
        setErrorMsg("Bağlantı hatası.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [apiUrl, token]);

  // 2. Kart Tıklama Mantığı
  const handleCardClick = (card: MemoryCard) => {
    // Eğer işlem yapılıyorsa, zaten açıksa veya zaten eşleşmişse tıklama
    if (isProcessing || flippedCards.includes(card) || matchedIds.includes(card.matchId)) return;

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    // İkinci kart açıldıysa kontrol et
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsProcessing(true); // Tıklamayı kilitle
      checkForMatch(newFlipped);
    }
  };

  // 3. Eşleşme Kontrolü
  const checkForMatch = (currentFlipped: MemoryCard[]) => {
    const [card1, card2] = currentFlipped;

    if (card1.matchId === card2.matchId) {
      // EŞLEŞTİ!
      setMatchedIds(prev => [...prev, card1.matchId]);
      setFlippedCards([]); // Seçilenleri temizle
      setIsProcessing(false); // Kilidi aç
    } else {
      // EŞLEŞMEDİ!
      setTimeout(() => {
        setFlippedCards([]); // Kartları kapat
        setIsProcessing(false); // Kilidi aç
      }, 1000); // 1 saniye bekle ki kullanıcı görsün
    }
  };

  // Oyun Bitti mi?
  const isFinished = cards.length > 0 && matchedIds.length === (cards.length / 2);

  // --- RENDER ---
  if (loading) return <Layout><div className="min-h-screen flex justify-center items-center text-slate-500">Kartlar Karılıyor...</div></Layout>;
  if (errorMsg) return <Layout><div className="min-h-screen flex justify-center items-center text-red-500">{errorMsg}</div></Layout>;

  if (isFinished) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hafıza Şampiyonu! 🧠</h2>
            
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 mt-8">
                <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Toplam Hamle</div>
                <div className="text-5xl font-bold text-violet-600 dark:text-violet-400">
                    {moves}
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-violet-500" />
                Hafıza Kartları
            </h1>
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-300">
                Hamle: {moves}
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card) => {
                const isFlipped = flippedCards.includes(card);
                const isMatched = matchedIds.includes(card.matchId);
                const isOpen = isFlipped || isMatched;

                return (
                    <div 
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`
                            aspect-[3/4] md:aspect-square cursor-pointer perspective-1000 group relative
                        `}
                    >
                        {/* Kartın İçeriği (Animasyonlu Dönüş) */}
                        <div className={`
                            w-full h-full transition-all duration-500 transform-style-3d relative rounded-xl shadow-sm border
                            ${isOpen ? 'bg-white dark:bg-slate-900 border-violet-500 rotate-y-180' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
                        `}>
                            
                            {/* ÖN YÜZ (KAPALI HALİ) - Desenli */}
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl">
                                    <Brain className="w-8 h-8 text-white/50" />
                                </div>
                            )}

                            {/* ARKA YÜZ (AÇIK HALİ) - Yazılı */}
                            {isOpen && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center rounded-xl bg-white dark:bg-slate-950">
                                    <span className="text-xs font-bold text-slate-400 uppercase mb-1">
                                        {card.type === 'EN' ? '🇬🇧' : '🇹🇷'}
                                    </span>
                                    <span className={`font-bold text-slate-900 dark:text-white ${card.text.length > 8 ? 'text-sm' : 'text-lg'}`}>
                                        {card.text}
                                    </span>
                                    {isMatched && <CheckCircle2 className="w-4 h-4 text-green-500 mt-2" />}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>

      </div>
    </Layout>
  );
}