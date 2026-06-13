import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, GripVertical } from "lucide-react";
import { PageHeader } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import {
  useDeals,
  useCompanies,
  useContacts,
  DEAL_STAGES,
  formatCurrency,
} from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Deal, DealStage, LeadSource } from "../../lib/types";

const SOURCES: LeadSource[] = ["LGM", "Instantly", "Referral", "Website", "LinkedIn", "Cold Call", "Other"];

const STAGE_ACCENTS: Record<DealStage, string> = {
  new: "border-t-slate-500",
  contacted: "border-t-info",
  qualified: "border-t-accent",
  proposal: "border-t-violet-500",
  negotiation: "border-t-warning",
  won: "border-t-success",
  lost: "border-t-danger",
};

export default function DealsPage() {
  const { items: deals, add, update } = useDeals();
  const { items: companies } = useCompanies();
  const { items: contacts } = useContacts();
  const [modalOpen, setModalOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name;
  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : undefined;
  };

  const totals = useMemo(() => {
    const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
    return {
      open: open.reduce((s, d) => s + d.value, 0),
      won: deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0),
      count: open.length,
    };
  }, [deals]);

  const handleCreate = (form: FormData) => {
    const deal: Deal = {
      id: uid(),
      name: String(form.get("name") || ""),
      companyId: String(form.get("companyId") || "") || undefined,
      contactId: String(form.get("contactId") || "") || undefined,
      value: Number(form.get("value") || 0),
      currency: "EUR",
      stage: (form.get("stage") as DealStage) || "new",
      probability: Number(form.get("probability") || 10),
      expectedCloseDate: String(form.get("expectedCloseDate") || "") || undefined,
      source: (form.get("source") as LeadSource) || "Other",
      notes: String(form.get("notes") || "") || undefined,
      cost: Number(form.get("cost") || 0),
      createdAt: new Date().toISOString(),
    };
    add(deal);
    setModalOpen(false);
  };

  const onDrop = (stage: DealStage) => {
    if (!dragId) return;
    const patch: Partial<Deal> = { stage };
    if (stage === "won" || stage === "lost") patch.closedAt = new Date().toISOString();
    update(dragId, patch);
    setDragId(null);
  };

  return (
    <div>
      <PageHeader
        title="Pipeline de deals"
        subtitle={`${totals.count} deals ouverts · ${formatCurrency(totals.open)} en pipeline · ${formatCurrency(totals.won)} gagnés`}
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nouveau deal
          </Button>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(stage.key)}
              className="w-72 shrink-0"
            >
              <div className={`bg-surface border border-border border-t-2 ${STAGE_ACCENTS[stage.key]} rounded-xl p-3 min-h-[120px]`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-display font-semibold text-[13px]">{stage.label}</h3>
                  <span className="text-[11px] text-text-dim">{stageDeals.length}</span>
                </div>
                <p className="text-[11px] text-text-dim px-1 mb-2">{formatCurrency(stageTotal)}</p>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragId(deal.id)}
                      className="bg-surface-2 border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-start gap-1.5">
                        <GripVertical size={14} className="text-text-dim mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium leading-snug">{deal.name}</p>
                          {companyName(deal.companyId) && (
                            <Link to={`/companies/${deal.companyId}`} className="text-[11px] text-text-dim hover:text-accent">
                              {companyName(deal.companyId)}
                            </Link>
                          )}
                          {contactName(deal.contactId) && (
                            <p className="text-[11px] text-text-dim">{contactName(deal.contactId)}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[13px] font-semibold">{formatCurrency(deal.value, deal.currency)}</span>
                            <Badge color="info">{deal.source}</Badge>
                          </div>
                          {deal.lostReason && (
                            <p className="text-[11px] text-danger mt-1.5">{deal.lostReason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-[11px] text-text-dim text-center py-4 border border-dashed border-border rounded-lg">
                      Glissez un deal ici
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau deal">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom du deal"><Input name="name" required placeholder="ex: Refonte site — Atlas Retail" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entreprise">
              <Select name="companyId" defaultValue="">
                <option value="">Aucune</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Contact">
              <Select name="contactId" defaultValue="">
                <option value="">Aucun</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Valeur (€)"><Input type="number" name="value" required min={0} /></Field>
            <Field label="Coût estimé (€)"><Input type="number" name="cost" defaultValue={0} min={0} /></Field>
            <Field label="Probabilité (%)"><Input type="number" name="probability" defaultValue={20} min={0} max={100} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Étape">
              <Select name="stage" defaultValue="new">
                {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Date de clôture prévue"><Input type="date" name="expectedCloseDate" /></Field>
          </div>
          <Field label="Source">
            <Select name="source" defaultValue="LGM">
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Notes"><Textarea name="notes" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Créer le deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
