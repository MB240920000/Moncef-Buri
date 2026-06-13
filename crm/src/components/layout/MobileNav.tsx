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
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Entreprises", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Handshake },
  { to: "/devis", label: "Devis", icon: FileText },
  { to: "/calendar", label: "Calendrier & Tâches", icon: CalendarDays },
  { to: "/campaigns", label: "Prospection", icon: Megaphone },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/reports", label: "Rapports", icon: BarChart3 },
  { to: "/websites", label: "Sites web", icon: Globe },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

export default function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="p-3 space-y-0.5 overflow-y-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              isActive ? "bg-accent/15 text-white border border-accent/30" : "text-text-muted hover:bg-surface-2"
            }`
          }
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
