import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

const HIDDEN_ROUTES = [
  "/learn",
  "/practice/dictation",
  "/practice/fill-blank", 
  "/practice/memory",
  "/practice/quiz",
  "/practice/scramble"
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isHiddenPage = HIDDEN_ROUTES.includes(location.pathname);
  const isDashboard = location.pathname === "/dashboard";
  const [showFooter, setShowFooter] = useState(!isHiddenPage && !isDashboard);

  useEffect(() => {
    if (isHiddenPage) {
      setShowFooter(false);
      return;
    }

    if (!isDashboard) {
      setShowFooter(true);
      return;
    }

    const handleScroll = () => {
      setShowFooter(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);

  }, [isHiddenPage, isDashboard]); 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
      </main>

      {/* Footer Wrapper */}
      <div 
        className={`transition-opacity duration-500 ease-in-out ${
          showFooter 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
      >
        {!isHiddenPage && <Footer />}
      </div>
    </div>
  );
}