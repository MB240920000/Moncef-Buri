import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-display font-semibold text-lg">Nexus CRM</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-text-muted">
                <X size={20} />
              </button>
            </div>
            <MobileNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-text-muted">
            <Menu size={22} />
          </button>
          <span className="font-display font-semibold">Nexus CRM</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
