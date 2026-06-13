import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader, Card, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { useContacts, useCompanies, CONTACT_STATUSES, formatDate } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Contact, ContactStatus, LeadSource } from "../../lib/types";

const SOURCES: LeadSource[] = ["LGM", "Instantly", "Referral", "Website", "LinkedIn", "Cold Call", "Other"];

export default function ContactsPage() {
  const { items: contacts, add } = useContacts();
  const { items: companies } = useCompanies();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        !search ||
        `${c.firstName} ${c.lastName} ${c.email ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name ?? "—";

  const handleCreate = (form: FormData) => {
    const newContact: Contact = {
      id: uid(),
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      jobTitle: String(form.get("jobTitle") || "") || undefined,
      companyId: String(form.get("companyId") || "") || undefined,
      source: (form.get("source") as LeadSource) || "Other",
      status: (form.get("status") as ContactStatus) || "lead",
      tags: [],
      notes: String(form.get("notes") || "") || undefined,
      createdAt: new Date().toISOString(),
    };
    add(newContact);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contacts dans votre base`}
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nouveau contact
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un contact..."
            className="bg-surface-2 border border-border-light rounded-lg pl-9 pr-3 py-2 text-[13px] w-64 placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/40"
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border ${statusFilter === "all" ? "bg-accent/15 border-accent/30 text-white" : "border-border-light text-text-muted hover:text-text"}`}
        >
          Tous
        </button>
        {CONTACT_STATUSES.map((s) => (
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
          <EmptyState title="Aucun contact" subtitle="Ajustez vos filtres ou créez un nouveau contact." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-text-dim text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Entreprise</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Dernier contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const status = CONTACT_STATUSES.find((s) => s.key === c.status)!;
                  return (
                    <tr key={c.id} className="border-t border-border hover:bg-surface-2/50">
                      <td className="px-5 py-3">
                        <Link to={`/contacts/${c.id}`} className="font-medium text-text hover:text-accent">
                          {c.firstName} {c.lastName}
                        </Link>
                        {c.jobTitle && <p className="text-[11px] text-text-dim">{c.jobTitle}</p>}
                      </td>
                      <td className="px-5 py-3 text-text-muted">{companyName(c.companyId)}</td>
                      <td className="px-5 py-3 text-text-muted">{c.email ?? "—"}</td>
                      <td className="px-5 py-3">
                        <Badge color="info">{c.source}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={status.color.includes("info") ? "info" : status.color.includes("success") ? "success" : status.color.includes("danger") ? "danger" : status.color.includes("accent") ? "accent" : "slate"}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-text-muted">{formatDate(c.lastContactedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau contact">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom"><Input name="firstName" required /></Field>
            <Field label="Nom"><Input name="lastName" required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><Input type="email" name="email" /></Field>
            <Field label="Téléphone"><Input name="phone" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Poste"><Input name="jobTitle" /></Field>
            <Field label="Entreprise">
              <Select name="companyId" defaultValue="">
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source">
              <Select name="source" defaultValue="LGM">
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Statut">
              <Select name="status" defaultValue="lead">
                {CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Notes"><Textarea name="notes" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Créer le contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
