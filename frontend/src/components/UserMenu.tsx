import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
  avatar?: string;
};

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const getAvatarSrc = (avatarPath: string | undefined | null) => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http")) return avatarPath; 
    return `${apiUrl}${avatarPath}`;
  };

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
        setUser({
            name: payload.name,
            email: payload.email,
            avatar: payload.picture,
        });
      } catch (e) {
        console.error("Token decode hatası", e);
      }

      const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${apiUrl}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser({
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar 
                });
            }
        } catch (error) {
            console.error("Kullanıcı verisi güncellenemedi", error);
        }
      };

      fetchUserProfile();
    }
  }, [token, apiUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  const avatarSrc = getAvatarSrc(user.avatar);

  return (
    <div className="relative" ref={menuRef}>
      {/* Tıklanabilir Profil Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
      >
        {/* Avatar Çerçevesi */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* İsim ve Ok Simgesi */}
        <div className="hidden md:flex items-center gap-2 pr-2">
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
              {user.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user.email}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Açılır Menü (Dropdown) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-none overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Menü Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Hesabım</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{user.email}</p>
          </div>

          {/* Menü Linkleri */}
          <div className="p-2">
            <button 
              onClick={() => navigate('/profile')} 
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors text-left"
            >
              <User className="w-4 h-4" />
              Profilim
            </button>
            
            <button 
              onClick={() => navigate('/settings')} 
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors text-left"
            >
              <Settings className="w-4 h-4" />
              Ayarlar
            </button>
          </div>

          {/* Ayırıcı Çizgi */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />

          {/* Çıkış Yap */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}