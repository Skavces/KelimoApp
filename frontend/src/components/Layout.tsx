// frontend/src/components/Layout.tsx
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
