import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { Card, PageHeader, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/Field";
import {
  useCompanies,
  useContacts,
  useDeals,
  useDevisList,
  useWebsites,
  DEAL_STAGES,
  formatCurrency,
  formatDate,
} from "../../lib/data";
import type { Company } from "../../lib/types";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: companies, update, remove } = useCompanies();
  const { items: contacts } = useContacts();
  const { items: deals } = useDeals();
  const { items: devisList } = useDevisList();
  const { items: websites } = useWebsites();
  const [editOpen, setEditOpen] = useState(false);

  const company = companies.find((c) => c.id === id);
  if (!company) {
    return <EmptyState title="Entreprise introuvable" action={<Link to="/companies"><Button>Retour</Button></Link>} />;
  }

  const relatedContacts = contacts.filter((c) => c.companyId === company.id);
  const relatedDeals = deals.filter((d) => d.companyId === company.id);
  const relatedDevis = devisList.filter((d) => d.companyId === company.id);
  const relatedWebsites = websites.filter((w) => w.companyId === company.id);

  const handleSave = (form: FormData) => {
    const patch: Partial<Company> = {
      name: String(form.get("name") || ""),
      domain: String(form.get("domain") || "") || undefined,
      website: String(form.get("website") || "") || undefined,
      industry: String(form.get("industry") || "") || undefined,
      size: String(form.get("size") || "") || undefined,
      city: String(form.get("city") || "") || undefined,
      country: String(form.get("country") || "") || undefined,
      notes: String(form.get("notes") || "") || undefined,
    };
    update(company.id, patch);
    setEditOpen(false);
  };

  return (
    <div>
      <button onClick={() => navigate("/companies")} className="flex items-center gap-1.5 text-text-muted hover:text-text text-[13px] mb-4">
        <ArrowLeft size={14} /> Retour aux entreprises
      </button>

      <PageHeader
        title={company.name}
        subtitle={[company.industry, company.city, company.country].filter(Boolean).join(" · ")}
        actions={
          <>
            <Button onClick={() => setEditOpen(true)}><Pencil size={14} /> Modifier</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Supprimer cette entreprise ?")) {
                  remove(company.id);
                  navigate("/companies");
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
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {company.industry && <Badge color="info">{company.industry}</Badge>}
              {company.size && <Badge color="slate">{company.size} employés</Badge>}
              {company.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
            <ul className="space-y-2.5 text-[13px]">
              {company.website && (
                <li className="flex items-center gap-2 text-text-muted">
                  <Globe size={14} />
                  <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-accent truncate">{company.website}</a>
                </li>
              )}
              {(company.city || company.country) && (
                <li className="flex items-center gap-2 text-text-muted">
                  <MapPin size={14} /> {[company.city, company.country].filter(Boolean).join(", ")}
                </li>
              )}
              <li className="flex items-center gap-2 text-text-muted"><Users size={14} /> {relatedContacts.length} contacts</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border text-[12px] text-text-dim">
              Créé le {formatDate(company.createdAt)}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-[13px] text-text-muted whitespace-pre-wrap">{company.notes || "Aucune note pour le moment."}</p>
          </Card>

          {relatedWebsites.length > 0 && (
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-2 text-sm">Sites web</h3>
              <ul className="space-y-2">
                {relatedWebsites.map((w) => (
                  <li key={w.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-border text-[13px]">
                    <span>{w.name}</span>
                    <Badge color={w.status === "live" ? "success" : w.status === "issue" ? "danger" : "warning"}>{w.status}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3 text-sm">Contacts ({relatedContacts.length})</h3>
            {relatedContacts.length === 0 ? (
              <p className="text-[13px] text-text-dim">Aucun contact lié.</p>
            ) : (
              <ul className="space-y-2">
                {relatedContacts.map((c) => (
                  <li key={c.id}>
                    <Link to={`/contacts/${c.id}`} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border hover:border-accent/30">
                      <div>
                        <p className="text-[13px] font-medium">{c.firstName} {c.lastName}</p>
                        <p className="text-[11px] text-text-dim">{c.jobTitle}</p>
                      </div>
                      <Badge color="info">{c.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3 text-sm">Deals ({relatedDeals.length})</h3>
            {relatedDeals.length === 0 ? (
              <p className="text-[13px] text-text-dim">Aucun deal lié.</p>
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
              <p className="text-[13px] text-text-dim">Aucun devis lié.</p>
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
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier l'entreprise">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom"><Input name="name" defaultValue={company.name} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domaine"><Input name="domain" defaultValue={company.domain} /></Field>
            <Field label="Site web"><Input name="website" defaultValue={company.website} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Secteur"><Input name="industry" defaultValue={company.industry} /></Field>
            <Field label="Taille"><Input name="size" defaultValue={company.size} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville"><Input name="city" defaultValue={company.city} /></Field>
            <Field label="Pays"><Input name="country" defaultValue={company.country} /></Field>
          </div>
          <Field label="Notes"><Textarea name="notes" defaultValue={company.notes} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
