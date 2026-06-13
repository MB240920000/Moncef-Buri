import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  FileText,
  CalendarDays,
  Megaphone,
  BarChart3,
  Globe,
  Workflow,
  Settings,
  Sparkles,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Vue d'ensemble",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "CRM",
    items: [
      { to: "/contacts", label: "Contacts", icon: Users },
      { to: "/companies", label: "Entreprises", icon: Building2 },
      { to: "/deals", label: "Deals", icon: Handshake },
      { to: "/devis", label: "Devis", icon: FileText },
    ],
  },
  {
    label: "Activité",
    items: [
      { to: "/calendar", label: "Calendrier & Tâches", icon: CalendarDays },
      { to: "/campaigns", label: "Prospection (LGM/Instantly)", icon: Megaphone },
      { to: "/workflows", label: "Workflows", icon: Workflow },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { to: "/reports", label: "Rapports & Rentabilité", icon: BarChart3 },
      { to: "/websites", label: "Sites web", icon: Globe },
    ],
  },
  {
    label: "",
    items: [{ to: "/settings", label: "Paramètres", icon: Settings }],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen border-r border-border bg-surface sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">Nexus CRM</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label || "bottom"}>
            {group.label && (
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-dim">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-accent/15 text-white border border-accent/30"
                        : "text-text-muted hover:text-text hover:bg-surface-2"
                    }`
                  }
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="rounded-xl bg-surface-2 border border-border p-3">
          <p className="text-[12px] font-semibold text-text mb-1">Moncef Buri</p>
          <p className="text-[11px] text-text-dim">Freelance — Web & Marketing</p>
        </div>
      </div>
    </aside>
  );
}
