import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Save, Trash2 } from "lucide-react";
import { Card, PageHeader } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import {
  useDevisList,
  useCompanies,
  useContacts,
  useDeals,
  formatCurrency,
  formatDate,
  DEVIS_STATUSES,
} from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Devis, DevisItem, DevisStatus } from "../../lib/types";

function emptyItem(): DevisItem {
  return { id: uid(), description: "", quantity: 1, unitPrice: 0, vatRate: 20 };
}

function nextDevisNumber(count: number) {
  const year = new Date().getFullYear();
  return `DEVIS-${year}-${String(count + 1).padStart(3, "0")}`;
}

export default function DevisEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: devisList, add, update, remove } = useDevisList();
  const { items: companies } = useCompanies();
  const { items: contacts } = useContacts();
  const { items: deals } = useDeals();

  const existing = devisList.find((d) => d.id === id);
  const isNew = !existing;

  const [draft, setDraft] = useState<Devis>(
    () =>
      existing ?? {
        id: uid(),
        number: nextDevisNumber(devisList.length),
        title: "",
        status: "draft",
        issueDate: new Date().toISOString().slice(0, 10),
        validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        currency: "EUR",
        items: [emptyItem()],
        createdAt: new Date().toISOString(),
      }
  );

  const filteredContacts = useMemo(
    () => contacts.filter((c) => !draft.companyId || c.companyId === draft.companyId),
    [contacts, draft.companyId]
  );

  const totals = useMemo(() => {
    const ht = draft.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const tva = draft.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
    return { ht, tva, ttc: ht + tva };
  }, [draft.items]);

  const company = companies.find((c) => c.id === draft.companyId);
  const contact = contacts.find((c) => c.id === draft.contactId);

  const updateItem = (itemId: string, patch: Partial<DevisItem>) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    }));
  };

  const addItem = () => setDraft((d) => ({ ...d, items: [...d.items, emptyItem()] }));
  const removeItem = (itemId: string) =>
    setDraft((d) => ({ ...d, items: d.items.filter((it) => it.id !== itemId) }));

  const handleSave = () => {
    if (isNew) add(draft);
    else update(draft.id, draft);
    navigate("/devis");
  };

  const handleDelete = () => {
    if (!isNew && confirm("Supprimer ce devis ?")) {
      remove(draft.id);
      navigate("/devis");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/devis")} className="flex items-center gap-1.5 text-text-muted hover:text-text text-[13px] mb-4 print:hidden">
        <ArrowLeft size={14} /> Retour aux devis
      </button>

      <div className="print:hidden">
        <PageHeader
          title={isNew ? "Nouveau devis" : draft.number}
          subtitle={isNew ? "Créez un devis pour un prospect ou client" : "Modifier le devis"}
          actions={
            <>
              <Button onClick={() => window.print()}><Printer size={14} /> Imprimer / PDF</Button>
              {!isNew && <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /></Button>}
              <Button variant="primary" onClick={handleSave}><Save size={14} /> Enregistrer</Button>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4 print:hidden">
          <Card className="p-5 space-y-3">
            <Field label="Titre du devis">
              <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="ex: Refonte site e-commerce" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entreprise">
                <Select
                  value={draft.companyId ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, companyId: e.target.value || undefined, contactId: undefined }))}
                >
                  <option value="">Aucune</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Contact">
                <Select
                  value={draft.contactId ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, contactId: e.target.value || undefined }))}
                >
                  <option value="">Aucun</option>
                  {filteredContacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Deal lié">
              <Select value={draft.dealId ?? ""} onChange={(e) => setDraft((d) => ({ ...d, dealId: e.target.value || undefined }))}>
                <option value="">Aucun</option>
                {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Émis le">
                <Input type="date" value={draft.issueDate.slice(0, 10)} onChange={(e) => setDraft((d) => ({ ...d, issueDate: e.target.value }))} />
              </Field>
              <Field label="Valide jusqu'au">
                <Input type="date" value={draft.validUntil?.slice(0, 10) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, validUntil: e.target.value }))} />
              </Field>
              <Field label="Statut">
                <Select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as DevisStatus }))}>
                  {DEVIS_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </Select>
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm">Lignes du devis</h3>
              <Button size="sm" onClick={addItem}><Plus size={12} /> Ajouter une ligne</Button>
            </div>
            <div className="space-y-2">
              {draft.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Prix unitaire"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="TVA %"
                      value={item.vatRate}
                      onChange={(e) => updateItem(item.id, { vatRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="text-text-dim hover:text-danger p-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Field label="Notes / conditions de paiement">
              <Textarea value={draft.notes ?? ""} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} rows={4} />
            </Field>
          </Card>
        </div>

        {/* Live preview */}
        <div className="devis-preview">
          <Card className="p-8 bg-white text-[#111] border-none print:shadow-none print:rounded-none">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="font-display text-xl font-bold">DEVIS</h2>
                <p className="text-[13px] text-gray-500">{draft.number}</p>
              </div>
              <div className="text-right text-[13px] text-gray-600">
                <p className="font-semibold text-gray-900">Moncef Buri</p>
                <p>Freelance — Web &amp; Marketing</p>
                <p>burimoncef@gmail.com</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-[13px]">
              <div>
                <p className="text-gray-400 uppercase text-[11px] font-semibold mb-1">Émis le</p>
                <p>{formatDate(draft.issueDate)}</p>
                {draft.validUntil && (
                  <>
                    <p className="text-gray-400 uppercase text-[11px] font-semibold mt-3 mb-1">Valide jusqu'au</p>
                    <p>{formatDate(draft.validUntil)}</p>
                  </>
                )}
              </div>
              <div>
                <p className="text-gray-400 uppercase text-[11px] font-semibold mb-1">Client</p>
                <p className="font-semibold">{company?.name ?? "—"}</p>
                {contact && <p>{contact.firstName} {contact.lastName}</p>}
                {contact?.email && <p className="text-gray-500">{contact.email}</p>}
                {(company?.city || company?.country) && (
                  <p className="text-gray-500">{[company?.city, company?.country].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>

            {draft.title && <h3 className="font-display font-semibold mb-3">{draft.title}</h3>}

            <table className="w-full text-[13px] mb-6">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-400 text-[11px] uppercase">
                  <th className="py-2 font-medium">Description</th>
                  <th className="py-2 font-medium text-right">Qté</th>
                  <th className="py-2 font-medium text-right">Prix unitaire</th>
                  <th className="py-2 font-medium text-right">TVA</th>
                  <th className="py-2 font-medium text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2">{item.description || "—"}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unitPrice, draft.currency)}</td>
                    <td className="py-2 text-right">{item.vatRate}%</td>
                    <td className="py-2 text-right">{formatCurrency(item.quantity * item.unitPrice, draft.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-56 text-[13px] space-y-1.5">
                <div className="flex justify-between text-gray-500">
                  <span>Total HT</span>
                  <span>{formatCurrency(totals.ht, draft.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA</span>
                  <span>{formatCurrency(totals.tva, draft.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span>{formatCurrency(totals.ttc, draft.currency)}</span>
                </div>
              </div>
            </div>

            {draft.notes && (
              <div className="text-[12px] text-gray-500 border-t border-gray-200 pt-4 whitespace-pre-wrap">
                {draft.notes}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
