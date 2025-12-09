import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import Layout from "../components/Layout";

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

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const decoded = decodeJwt(token);

  const displayName = decoded?.name || decoded?.email || "kullanıcı";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Hoş geldin */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Hoş geldin,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {displayName}
              </span>{" "}
              👋
            </h1>
            <p className="text-lg text-slate-400">
              Bugün birkaç yeni kelime öğrenmeye hazır mısın?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-400" />
              </div>
              <span className="text-2xl font-bold">127</span>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">
              Öğrenilen Kelime
            </h3>
            <p className="text-sm text-slate-400">Bu hafta 12 yeni kelime</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold">89%</span>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Doğruluk Oranı</h3>
            <p className="text-sm text-slate-400">Son 50 alıştırmada</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-fuchsia-400" />
              </div>
              <span className="text-2xl font-bold">7</span>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Gün Serisi</h3>
            <p className="text-sm text-slate-400">Devam ediyor! 🔥</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kelime Öğren */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-violet-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-100">
              Yeni Kelimeler
            </h3>
            <p className="text-slate-400 mb-4">
              Bugünün kelimelerini öğrenmeye başla ve kelime dağarcığını
              genişlet.
            </p>
            <div className="flex items-center gap-2 text-sm text-violet-400">
              <span className="font-medium">15 kelime hazır</span>
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            </div>
          </div>

          {/* Pratik Yap */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-100">
              Alıştırma Yap
            </h3>
            <p className="text-slate-400 mb-4">
              Öğrendiğin kelimeleri pekiştir ve unutma eğrisini yen.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <span className="font-medium">23 kelime bekliyor</span>
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
          </div>

          {/* İlerleme */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-fuchsia-500/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-fuchsia-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-100">
              İlerlemeni Gör
            </h3>
            <p className="text-slate-400 mb-4">
              Başarılarını, istatistiklerini ve rozetlerini incele.
            </p>
            <div className="flex items-center gap-2 text-sm text-fuchsia-400">
              <span className="font-medium">3 yeni rozet kazandın</span>
              <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
            </div>
          </div>

          {/* Kelime Listem */}
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-100">
              Kelime Listem
            </h3>
            <p className="text-slate-400 mb-4">
              Tüm öğrendiğin kelimeleri ve anlamlarını gör.
            </p>
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <span className="font-medium">127 kelime arşivinde</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
