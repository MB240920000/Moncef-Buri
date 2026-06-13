import { useCollection } from "./storage";
import {
  seedCampaigns,
  seedCompanies,
  seedContacts,
  seedDeals,
  seedDevis,
  seedTasks,
  seedWebsites,
  seedWorkflows,
} from "./seed";
import type {
  Campaign,
  Company,
  Contact,
  Deal,
  Devis,
  Task,
  WebsiteProject,
  Workflow,
} from "./types";

export const useCompanies = () => useCollection<Company>("companies", seedCompanies);
export const useContacts = () => useCollection<Contact>("contacts", seedContacts);
export const useDeals = () => useCollection<Deal>("deals", seedDeals);
export const useDevisList = () => useCollection<Devis>("devis", seedDevis);
export const useTasks = () => useCollection<Task>("tasks", seedTasks);
export const useCampaigns = () => useCollection<Campaign>("campaigns", seedCampaigns);
export const useWebsites = () => useCollection<WebsiteProject>("websites", seedWebsites);
export const useWorkflows = () => useCollection<Workflow>("workflows", seedWorkflows);

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export function devisTotal(devis: Devis) {
  const ht = devis.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const tva = devis.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
  return { ht, tva, ttc: ht + tva };
}

export const DEAL_STAGES: { key: Deal["stage"]; label: string }[] = [
  { key: "new", label: "Nouveau" },
  { key: "contacted", label: "Contacté" },
  { key: "qualified", label: "Qualifié" },
  { key: "proposal", label: "Proposition" },
  { key: "negotiation", label: "Négociation" },
  { key: "won", label: "Gagné" },
  { key: "lost", label: "Perdu" },
];

export const CONTACT_STATUSES: { key: Contact["status"]; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "bg-slate-500" },
  { key: "prospect", label: "Prospect", color: "bg-info" },
  { key: "qualified", label: "Qualifié", color: "bg-accent" },
  { key: "customer", label: "Client", color: "bg-success" },
  { key: "lost", label: "Perdu", color: "bg-danger" },
];

export const DEVIS_STATUSES: { key: Devis["status"]; label: string; color: string }[] = [
  { key: "draft", label: "Brouillon", color: "bg-slate-500" },
  { key: "sent", label: "Envoyé", color: "bg-info" },
  { key: "accepted", label: "Accepté", color: "bg-success" },
  { key: "refused", label: "Refusé", color: "bg-danger" },
  { key: "expired", label: "Expiré", color: "bg-warning" },
];
