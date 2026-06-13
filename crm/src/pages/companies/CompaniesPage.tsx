import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Building2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { useCompanies, useContacts, useDeals, formatCurrency } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Company } from "../../lib/types";

export default function CompaniesPage() {
  const { items: companies, add } = useCompanies();
  const { items: contacts } = useContacts();
  const { items: deals } = useDeals();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(
    () =>
      companies.filter(
        (c) => !search || `${c.name} ${c.industry ?? ""}`.toLowerCase().includes(search.toLowerCase())
      ),
    [companies, search]
  );

  const contactCount = (id: string) => contacts.filter((c) => c.companyId === id).length;
  const pipelineValue = (id: string) =>
    deals.filter((d) => d.companyId === id && d.stage !== "lost").reduce((s, d) => s + d.value, 0);

  const handleCreate = (form: FormData) => {
    const company: Company = {
      id: uid(),
      name: String(form.get("name") || ""),
      domain: String(form.get("domain") || "") || undefined,
      industry: String(form.get("industry") || "") || undefined,
      size: String(form.get("size") || "") || undefined,
      website: String(form.get("website") || "") || undefined,
      city: String(form.get("city") || "") || undefined,
      country: String(form.get("country") || "") || undefined,
      notes: String(form.get("notes") || "") || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
    };
    add(company);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Entreprises"
        subtitle={`${companies.length} entreprises dans votre base`}
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nouvelle entreprise
          </Button>
        }
      />

      <div className="relative mb-4 w-full sm:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une entreprise..."
          className="bg-surface-2 border border-border-light rounded-lg pl-9 pr-3 py-2 text-[13px] w-full placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/40"
        />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState title="Aucune entreprise" subtitle="Ajustez votre recherche ou créez une nouvelle entreprise." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} to={`/companies/${c.id}`}>
              <Card className="p-5 hover:border-accent/30 transition-colors h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-text">{c.name}</p>
                    <p className="text-[11px] text-text-dim">{c.city}{c.country ? `, ${c.country}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {c.industry && <Badge color="info">{c.industry}</Badge>}
                  {c.size && <Badge color="slate">{c.size} employés</Badge>}
                </div>
                <div className="flex items-center justify-between text-[12px] text-text-muted pt-3 border-t border-border">
                  <span>{contactCount(c.id)} contacts</span>
                  <span className="font-semibold text-text">{formatCurrency(pipelineValue(c.id))}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle entreprise">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom"><Input name="name" required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domaine"><Input name="domain" placeholder="exemple.fr" /></Field>
            <Field label="Site web"><Input name="website" placeholder="https://exemple.fr" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Secteur"><Input name="industry" /></Field>
            <Field label="Taille"><Input name="size" placeholder="10-50" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville"><Input name="city" /></Field>
            <Field label="Pays"><Input name="country" /></Field>
          </div>
          <Field label="Notes"><Textarea name="notes" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Créer l'entreprise</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
