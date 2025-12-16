import { useState, useEffect } from "react";
import Layout from "../components/Layout"; 
import { Search, BookOpen } from "lucide-react";

type Word = {
  id: string;
  text: string;
  meaning: string;
  example: string | null;
  level: string | null;
};

export default function MyWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchLearnedWords = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/words/learned`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setWords(data);
        }
      } catch (err) {
        console.error("Kelimeler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearnedWords();
  }, [apiUrl, token]);

  const filteredWords = words.filter(
    (w) =>
      w.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-8 pt-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Kelime Koleksiyonum
            </h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-medium">
                {words.length}
              </span>
              <span>kelime öğrendin</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 dark:group-focus-within:text-violet-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Koleksiyonda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
             </div>
          ) : filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="group relative flex flex-col p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 dark:hover:border-violet-500 rounded-2xl transition-all duration-300 hover:shadow-lg dark:hover:shadow-violet-500/10 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md uppercase tracking-wider border border-transparent dark:border-slate-800">
                      {word.level || 'GENEL'}
                    </span>
                    <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {word.text}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2 font-medium">
                    {word.meaning}
                  </p>
                  
                  {word.example && (
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                       <p className="text-xs text-slate-500 dark:text-slate-500 italic line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        "{word.example}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'Sonuç bulunamadı' : 'Listen henüz boş'}
              </h3>
              <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                {searchTerm 
                  ? `"${searchTerm}" aramasıyla eşleşen bir kelime bulamadık.` 
                  : "Öğrenmeye başladığında kelimelerin burada birikecek."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}