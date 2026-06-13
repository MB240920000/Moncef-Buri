import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader, Card, EmptyState, StatCard } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  useDevisList,
  useCompanies,
  devisTotal,
  DEVIS_STATUSES,
  formatCurrency,
  formatDate,
} from "../../lib/data";
import { FileText, FileCheck, FileClock } from "lucide-react";
import type { DevisStatus } from "../../lib/types";

export default function DevisPage() {
  const { items: devisList } = useDevisList();
  const { items: companies } = useCompanies();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DevisStatus | "all">("all");

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name ?? "—";

  const filtered = useMemo(
    () =>
      devisList.filter((d) => {
        const matchesSearch = !search || `${d.number} ${d.title}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || d.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [devisList, search, statusFilter]
  );

  const totals = useMemo(() => {
    const accepted = devisList.filter((d) => d.status === "accepted");
    const sent = devisList.filter((d) => d.status === "sent");
    return {
      accepted: accepted.reduce((s, d) => s + devisTotal(d).ttc, 0),
      pending: sent.reduce((s, d) => s + devisTotal(d).ttc, 0),
      pendingCount: sent.length,
    };
  }, [devisList]);

  return (
    <div>
      <PageHeader
        title="Devis"
        subtitle={`${devisList.length} devis créés`}
        actions={
          <Link to="/devis/new">
            <Button variant="primary"><Plus size={14} /> Nouveau devis</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total devis" value={String(devisList.length)} icon={<FileText size={18} />} />
        <StatCard label="En attente de réponse" value={formatCurrency(totals.pending)} sub={`${totals.pendingCount} devis envoyés`} icon={<FileClock size={18} />} />
        <StatCard label="Acceptés (valeur TTC)" value={formatCurrency(totals.accepted)} icon={<FileCheck size={18} />} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un devis..."
            className="bg-surface-2 border border-border-light rounded-lg pl-9 pr-3 py-2 text-[13px] w-64 placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/40"
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border ${statusFilter === "all" ? "bg-accent/15 border-accent/30 text-white" : "border-border-light text-text-muted hover:text-text"}`}
        >
          Tous
        </button>
        {DEVIS_STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border ${statusFilter === s.key ? "bg-accent/15 border-accent/30 text-white" : "border-border-light text-text-muted hover:text-text"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="Aucun devis" subtitle="Créez votre premier devis pour un client." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-text-dim text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Numéro</th>
                  <th className="px-5 py-3 font-medium">Titre</th>
                  <th className="px-5 py-3 font-medium">Entreprise</th>
                  <th className="px-5 py-3 font-medium">Émis le</th>
                  <th className="px-5 py-3 font-medium">Valide jusqu'au</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium text-right">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const status = DEVIS_STATUSES.find((s) => s.key === d.status)!;
                  const { ttc } = devisTotal(d);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-surface-2/50">
                      <td className="px-5 py-3">
                        <Link to={`/devis/${d.id}`} className="text-accent font-medium hover:underline">{d.number}</Link>
                      </td>
                      <td className="px-5 py-3">{d.title}</td>
                      <td className="px-5 py-3 text-text-muted">{companyName(d.companyId)}</td>
                      <td className="px-5 py-3 text-text-muted">{formatDate(d.issueDate)}</td>
                      <td className="px-5 py-3 text-text-muted">{formatDate(d.validUntil)}</td>
                      <td className="px-5 py-3">
                        <Badge color={status.color.includes("info") ? "info" : status.color.includes("success") ? "success" : status.color.includes("danger") ? "danger" : status.color.includes("warning") ? "warning" : "slate"}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">{formatCurrency(ttc, d.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
