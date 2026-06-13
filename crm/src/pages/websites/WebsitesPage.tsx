import { useState } from "react";
import { Plus, Globe, ExternalLink, Activity, Gauge, Users, Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState, StatCard } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { useWebsites, useCompanies, formatDate } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { WebsiteProject } from "../../lib/types";

export default function WebsitesPage() {
  const { items: websites, add, update, remove } = useWebsites();
  const { items: companies } = useCompanies();
  const [modalOpen, setModalOpen] = useState(false);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name;

  const avgUptime = websites.length ? (websites.reduce((s, w) => s + w.uptime, 0) / websites.length).toFixed(2) : "0";
  const totalVisitors = websites.reduce((s, w) => s + w.monthlyVisitors, 0);
  const issues = websites.filter((w) => w.status === "issue").length;

  const handleCreate = (form: FormData) => {
    const site: WebsiteProject = {
      id: uid(),
      name: String(form.get("name") || ""),
      url: String(form.get("url") || ""),
      companyId: String(form.get("companyId") || "") || undefined,
      monthlyVisitors: Number(form.get("monthlyVisitors") || 0),
      conversionRate: Number(form.get("conversionRate") || 0),
      avgLoadTime: Number(form.get("avgLoadTime") || 0),
      uptime: Number(form.get("uptime") || 100),
      lastChecked: new Date().toISOString(),
      status: (form.get("status") as WebsiteProject["status"]) || "live",
    };
    add(site);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Sites web"
        subtitle="Vue d'ensemble de la performance de votre site (Bolt) et de vos sites clients."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Ajouter un site
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Visiteurs mensuels (total)" value={totalVisitors.toLocaleString("fr-FR")} icon={<Users size={18} />} />
        <StatCard label="Disponibilité moyenne" value={`${avgUptime}%`} icon={<Activity size={18} />} />
        <StatCard label="Sites avec incident" value={String(issues)} icon={<Gauge size={18} />} />
      </div>

      {websites.length === 0 ? (
        <Card><EmptyState title="Aucun site" subtitle="Ajoutez votre site Bolt ou les sites de vos clients pour suivre leur performance." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((w) => (
            <Card key={w.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold">{w.name}</h4>
                    {companyName(w.companyId) && <p className="text-[11px] text-text-dim">{companyName(w.companyId)}</p>}
                  </div>
                </div>
                <Badge color={w.status === "live" ? "success" : w.status === "issue" ? "danger" : "warning"}>
                  {w.status === "live" ? "En ligne" : w.status === "issue" ? "Incident" : "Maintenance"}
                </Badge>
              </div>

              <a href={w.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-accent hover:underline mb-3 truncate">
                {w.url} <ExternalLink size={11} />
              </a>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat label="Visiteurs / mois" value={w.monthlyVisitors.toLocaleString("fr-FR")} />
                <Stat label="Taux de conversion" value={`${w.conversionRate}%`} />
                <Stat label="Temps de chargement" value={`${w.avgLoadTime}s`} />
                <Stat label="Disponibilité" value={`${w.uptime}%`} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-text-dim">Vérifié le {formatDate(w.lastChecked)}</span>
                <div className="flex items-center gap-1">
                  <select
                    value={w.status}
                    onChange={(e) => update(w.id, { status: e.target.value as WebsiteProject["status"], lastChecked: new Date().toISOString() })}
                    className="bg-surface-2 border border-border-light rounded-lg px-2 py-1 text-[11px]"
                  >
                    <option value="live">En ligne</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="issue">Incident</option>
                  </select>
                  <button onClick={() => remove(w.id)} className="text-text-dim hover:text-danger p-1"><Trash2 size={13} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un site">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom"><Input name="name" required /></Field>
          <Field label="URL"><Input name="url" required placeholder="https://..." /></Field>
          <Field label="Entreprise liée">
            <Select name="companyId" defaultValue="">
              <option value="">Aucune (mon site)</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Visiteurs / mois"><Input type="number" name="monthlyVisitors" min={0} defaultValue={0} /></Field>
            <Field label="Taux de conversion (%)"><Input type="number" step="0.1" name="conversionRate" min={0} defaultValue={0} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Temps de chargement (s)"><Input type="number" step="0.1" name="avgLoadTime" min={0} defaultValue={1} /></Field>
            <Field label="Disponibilité (%)"><Input type="number" step="0.01" name="uptime" min={0} max={100} defaultValue={100} /></Field>
          </div>
          <Field label="Statut">
            <Select name="status" defaultValue="live">
              <option value="live">En ligne</option>
              <option value="maintenance">Maintenance</option>
              <option value="issue">Incident</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg p-2">
      <p className="text-[13px] font-semibold">{value}</p>
      <p className="text-[10px] text-text-dim uppercase tracking-wide">{label}</p>
    </div>
  );
}
