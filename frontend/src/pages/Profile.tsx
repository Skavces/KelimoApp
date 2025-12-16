import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/Layout";
import { User, Mail, Camera, Loader2, Save, X, Check } from "lucide-react";
import Cropper from "react-easy-crop"; // Kırpma kütüphanesi
import getCroppedImg from "../utils/canvasUtils"; // Yardımcı fonksiyon

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Kırpma State'leri ---
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Seçilen ham resim
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false); // Kırpma ekranı açık mı?

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Profil Verisini Çek
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Profil yüklenemedi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiUrl, token]);

  // 1. Dosya seçildiğinde çalışır (Direkt yüklemez, kırpma ekranını açar)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Dosyayı okuyup tarayıcıda gösterilebilir bir URL'e çeviriyoruz
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropping(true); // Kırpma ekranını aç
      });
      reader.readAsDataURL(file);
    }
  };

  // Kırpma işlemi bittiğinde koordinatları kaydet
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 2. Kırpılmış resmi sunucuya yükle (Kaydet butonuna basınca)
  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      // Canvas yardımcı fonksiyonu ile kırpılmış resmi (blob) oluştur
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedImageBlob) {
          throw new Error("Resim kırpılamadı.");
      }

      // Blob'u dosyaya çevirip FormData'ya ekle
      const formData = new FormData();
      formData.append("file", croppedImageBlob, "cropped-avatar.jpg");

      // Backend'e gönder
      const res = await fetch(`${apiUrl}/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({ ...prev, avatar: data.url }));
        setIsCropping(false); // Modalı kapat
        setImageSrc(null); // Geçici resmi temizle
      } else {
        const errData = await res.json();
        alert(`Hata: ${errData.message || 'Yükleme başarısız'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Kırpma ekranını kapat
  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
  };

  // URL Düzeltici (Null yerine undefined döndürerek TS hatasını çözer)
  const getAvatarSrc = (avatarPath: string | null) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${apiUrl}${avatarPath}`;
  };

  if (loading) return <Layout><div className="flex h-screen items-center justify-center">Yükleniyor...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-10 relative">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Profilim</h1>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
          
          {/* --- MEVCUT PROFİL FOTOĞRAFI --- */}
          <div className="relative group cursor-pointer mb-6" onClick={handleImageClick}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg relative">
              {user?.avatar ? (
                <img 
                  src={getAvatarSrc(user.avatar)}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {!uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            {/* Gizli Input - Değeri her seferinde sıfırlanır */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
              className="hidden" 
              accept="image/*"
            />
            <p className="text-center text-xs text-slate-400 mt-2 group-hover:text-violet-500 transition-colors">Fotoğrafı Değiştir</p>
          </div>

          {/* --- KULLANICI BİLGİLERİ --- */}
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Ad Soyad</label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <User className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{user?.name || "İsimsiz"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">E-Posta Adresi</label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full">
             <button className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
               <Save className="w-4 h-4" /> Bilgileri Güncelle (Yakında)
            </button>
          </div>

        </div>

        {/* --- YENİLENMİŞ KIRPMA MODALI (PREMIUM TASARIM) --- */}
        {isCropping && imageSrc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            
            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              
              {/* Header: Başlık ve Kapatma Butonu */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-violet-400" />
                  Fotoğrafı Kırp
                </h3>
                <button 
                  onClick={handleCancelCrop}
                  className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cropper Alanı */}
              <div className="relative w-full h-80 bg-slate-950">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                  // Kırpma alanı stil özelleştirmesi
                  style={{
                    containerStyle: { backgroundColor: '#0f172a' }, // slate-950
                    cropAreaStyle: { border: '2px solid #a78bfa' } // violet-400
                  }}
                />
              </div>
              
              {/* Kontroller (Slider ve Butonlar) */}
              <div className="p-6 flex flex-col gap-6 bg-slate-800">
                
                {/* Zoom Slider */}
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm font-medium">Yakınlaştır</span>
                  <div className="flex-1 relative flex items-center">
                    {/* Slider Çubuğu Arka Planı */}
                    <div className="absolute inset-x-0 h-1.5 bg-slate-700 rounded-full"></div>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        // Tailwind accent color ve webkit stilleri
                        className="relative w-full h-1.5 bg-transparent rounded-full appearance-none cursor-pointer accent-violet-500 z-10"
                        style={{ WebkitAppearance: 'none' }} 
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-8 text-right">{zoom.toFixed(1)}x</span>
                </div>
                
                {/* Butonlar */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleCancelCrop}
                        disabled={uploading}
                        className="px-4 py-3 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-700/50 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        İptal Et
                    </button>
                    <button
                        onClick={handleUploadCroppedImage}
                        disabled={uploading}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {uploading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}