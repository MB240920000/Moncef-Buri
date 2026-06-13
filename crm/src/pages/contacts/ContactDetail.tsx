import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Link2, Building2, Pencil, Trash2 } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import {
  useContacts,
  useCompanies,
  useDeals,
  useTasks,
  useDevisList,
  CONTACT_STATUSES,
  DEAL_STAGES,
  formatCurrency,
  formatDate,
} from "../../lib/data";
import type { Contact, ContactStatus, LeadSource } from "../../lib/types";

const SOURCES: LeadSource[] = ["LGM", "Instantly", "Referral", "Website", "LinkedIn", "Cold Call", "Other"];

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: contacts, update, remove } = useContacts();
  const { items: companies } = useCompanies();
  const { items: deals } = useDeals();
  const { items: tasks } = useTasks();
  const { items: devisList } = useDevisList();
  const [editOpen, setEditOpen] = useState(false);

  const contact = contacts.find((c) => c.id === id);
  if (!contact) {
    return <EmptyState title="Contact introuvable" action={<Link to="/contacts"><Button>Retour aux contacts</Button></Link>} />;
  }

  const company = companies.find((c) => c.id === contact.companyId);
  const status = CONTACT_STATUSES.find((s) => s.key === contact.status)!;
  const relatedDeals = deals.filter((d) => d.contactId === contact.id);
  const relatedTasks = tasks.filter((t) => t.contactId === contact.id);
  const relatedDevis = devisList.filter((d) => d.contactId === contact.id);

  const handleSave = (form: FormData) => {
    const patch: Partial<Contact> = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      jobTitle: String(form.get("jobTitle") || "") || undefined,
      companyId: String(form.get("companyId") || "") || undefined,
      linkedin: String(form.get("linkedin") || "") || undefined,
      source: form.get("source") as LeadSource,
      status: form.get("status") as ContactStatus,
      notes: String(form.get("notes") || "") || undefined,
    };
    update(contact.id, patch);
    setEditOpen(false);
  };

  return (
    <div>
      <button onClick={() => navigate("/contacts")} className="flex items-center gap-1.5 text-text-muted hover:text-text text-[13px] mb-4">
        <ArrowLeft size={14} /> Retour aux contacts
      </button>

      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.jobTitle ? `${contact.jobTitle}${company ? ` chez ${company.name}` : ""}` : undefined}
        actions={
          <>
            <Button onClick={() => setEditOpen(true)}><Pencil size={14} /> Modifier</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Supprimer ce contact ?")) {
                  remove(contact.id);
                  navigate("/contacts");
                }
              }}
            >
              <Trash2 size={14} />
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge color={status.color.includes("info") ? "info" : status.color.includes("success") ? "success" : status.color.includes("danger") ? "danger" : status.color.includes("accent") ? "accent" : "slate"}>
                {status.label}
              </Badge>
              <Badge color="info">{contact.source}</Badge>
            </div>
            <ul className="space-y-2.5 text-[13px]">
              {contact.email && (
                <li className="flex items-center gap-2 text-text-muted"><Mail size={14} /> {contact.email}</li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2 text-text-muted"><Phone size={14} /> {contact.phone}</li>
              )}
              {contact.linkedin && (
                <li className="flex items-center gap-2 text-text-muted">
                  <Link2 size={14} />
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent truncate">{contact.linkedin}</a>
                </li>
              )}
              {company && (
                <li className="flex items-center gap-2 text-text-muted">
                  <Building2 size={14} />
                  <Link to={`/companies/${company.id}`} className="hover:text-accent">{company.name}</Link>
                </li>
              )}
            </ul>
            <div className="mt-4 pt-4 border-t border-border text-[12px] text-text-dim">
              Créé le {formatDate(contact.createdAt)}
              {contact.lastContactedAt && <> · Dernier contact: {formatDate(contact.lastContactedAt)}</>}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-[13px] text-text-muted whitespace-pre-wrap">{contact.notes || "Aucune note pour le moment."}</p>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3 text-sm">Deals associés ({relatedDeals.length})</h3>
            {relatedDeals.length === 0 ? (
              <p className="text-[13px] text-text-dim">Aucun deal associé.</p>
            ) : (
              <ul className="space-y-2">
                {relatedDeals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <div>
                      <p className="text-[13px] font-medium">{d.name}</p>
                      <p className="text-[11px] text-text-dim">{DEAL_STAGES.find((s) => s.key === d.stage)?.label}</p>
                    </div>
                    <span className="text-[13px] font-semibold">{formatCurrency(d.value, d.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3 text-sm">Devis ({relatedDevis.length})</h3>
            {relatedDevis.length === 0 ? (
              <p className="text-[13px] text-text-dim">Aucun devis pour ce contact.</p>
            ) : (
              <ul className="space-y-2">
                {relatedDevis.map((d) => (
                  <li key={d.id}>
                    <Link to={`/devis/${d.id}`} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border hover:border-accent/30">
                      <div>
                        <p className="text-[13px] font-medium text-accent">{d.number}</p>
                        <p className="text-[11px] text-text-dim">{d.title}</p>
                      </div>
                      <Badge color="slate">{d.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3 text-sm">Tâches ({relatedTasks.length})</h3>
            {relatedTasks.length === 0 ? (
              <p className="text-[13px] text-text-dim">Aucune tâche associée.</p>
            ) : (
              <ul className="space-y-2">
                {relatedTasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <p className={`text-[13px] ${t.done ? "line-through text-text-dim" : ""}`}>{t.title}</p>
                    <span className="text-[11px] text-text-dim">{formatDate(t.dueDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier le contact">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom"><Input name="firstName" defaultValue={contact.firstName} required /></Field>
            <Field label="Nom"><Input name="lastName" defaultValue={contact.lastName} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><Input type="email" name="email" defaultValue={contact.email} /></Field>
            <Field label="Téléphone"><Input name="phone" defaultValue={contact.phone} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Poste"><Input name="jobTitle" defaultValue={contact.jobTitle} /></Field>
            <Field label="Entreprise">
              <Select name="companyId" defaultValue={contact.companyId ?? ""}>
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="LinkedIn"><Input name="linkedin" defaultValue={contact.linkedin} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source">
              <Select name="source" defaultValue={contact.source}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Statut">
              <Select name="status" defaultValue={contact.status}>
                {CONTACT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Notes"><Textarea name="notes" defaultValue={contact.notes} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
