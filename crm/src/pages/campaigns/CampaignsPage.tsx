import { useMemo, useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PageHeader, Card, StatCard, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { useCampaigns, formatDate } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Campaign, CampaignPlatform, CampaignStatus } from "../../lib/types";

export default function CampaignsPage() {
  const { items: campaigns, add, update, remove } = useCampaigns();
  const [modalOpen, setModalOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<CampaignPlatform | "all">("all");

  const filtered = campaigns.filter((c) => platformFilter === "all" || c.platform === platformFilter);

  const totals = useMemo(() => {
    const sent = campaigns.reduce((s, c) => s + c.messagesSent, 0);
    const replied = campaigns.reduce((s, c) => s + c.replied, 0);
    const positive = campaigns.reduce((s, c) => s + c.positiveReplies, 0);
    const meetings = campaigns.reduce((s, c) => s + c.meetingsBooked, 0);
    return {
      sent,
      replyRate: sent ? ((replied / sent) * 100).toFixed(1) : "0",
      positiveRate: replied ? ((positive / replied) * 100).toFixed(1) : "0",
      meetings,
    };
  }, [campaigns]);

  const chartData = filtered.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    Envoyés: c.messagesSent,
    Ouverts: c.opened,
    Réponses: c.replied,
    "Réponses positives": c.positiveReplies,
    "RDV obtenus": c.meetingsBooked,
  }));

  const handleCreate = (form: FormData) => {
    const campaign: Campaign = {
      id: uid(),
      name: String(form.get("name") || ""),
      platform: (form.get("platform") as CampaignPlatform) || "LGM",
      status: (form.get("status") as CampaignStatus) || "active",
      startDate: String(form.get("startDate") || new Date().toISOString().slice(0, 10)),
      endDate: String(form.get("endDate") || "") || undefined,
      contactsTargeted: Number(form.get("contactsTargeted") || 0),
      messagesSent: Number(form.get("messagesSent") || 0),
      opened: Number(form.get("opened") || 0),
      replied: Number(form.get("replied") || 0),
      positiveReplies: Number(form.get("positiveReplies") || 0),
      meetingsBooked: Number(form.get("meetingsBooked") || 0),
      notes: String(form.get("notes") || "") || undefined,
    };
    add(campaign);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Prospection — LGM & Instantly"
        subtitle="Suivez la performance de vos campagnes d'outreach LinkedIn et cold email."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Ajouter une campagne
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Messages envoyés" value={totals.sent.toLocaleString("fr-FR")} icon={<Megaphone size={18} />} />
        <StatCard label="Taux de réponse" value={`${totals.replyRate}%`} sub="Réponses / Envoyés" />
        <StatCard label="Taux positif" value={`${totals.positiveRate}%`} sub="Réponses positives / Réponses" />
        <StatCard label="RDV obtenus" value={String(totals.meetings)} sub="Sur toutes les campagnes" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(["all", "LGM", "Instantly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border ${platformFilter === p ? "bg-accent/15 border-accent/30 text-white" : "border-border-light text-text-muted hover:text-text"}`}
          >
            {p === "all" ? "Toutes les plateformes" : p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState title="Aucune campagne" subtitle="Ajoutez vos campagnes LGM ou Instantly pour suivre leur performance." /></Card>
      ) : (
        <>
          <Card className="p-5 mb-4">
            <h3 className="font-display font-semibold mb-4">Tunnel de conversion par campagne</h3>
            <ResponsiveContainer width="100%" height={Math.max(260, filtered.length * 70)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a3d" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#8b93ab", fontSize: 11 }} width={160} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Envoyés" fill="#475569" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Ouverts" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Réponses" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Réponses positives" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="RDV obtenus" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => {
              const replyRate = c.messagesSent ? ((c.replied / c.messagesSent) * 100).toFixed(1) : "0";
              const positiveRate = c.replied ? ((c.positiveReplies / c.replied) * 100).toFixed(1) : "0";
              return (
                <Card key={c.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge color={c.platform === "LGM" ? "accent" : "info"}>{c.platform}</Badge>
                        <Badge color={c.status === "active" ? "success" : c.status === "paused" ? "warning" : c.status === "draft" ? "slate" : "info"}>{c.status}</Badge>
                      </div>
                      <h4 className="font-display font-semibold mt-2">{c.name}</h4>
                      <p className="text-[11px] text-text-dim">
                        Démarré le {formatDate(c.startDate)}{c.endDate ? ` · Terminé le ${formatDate(c.endDate)}` : ""}
                      </p>
                    </div>
                    <button onClick={() => { if (confirm("Supprimer cette campagne ?")) remove(c.id); }} className="text-text-dim hover:text-danger text-[12px]">
                      Supprimer
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <Metric label="Ciblés" value={c.contactsTargeted} />
                    <Metric label="Envoyés" value={c.messagesSent} />
                    <Metric label="Ouverts" value={c.opened} />
                    <Metric label="Réponses" value={c.replied} sub={`${replyRate}%`} />
                    <Metric label="Positives" value={c.positiveReplies} sub={`${positiveRate}%`} />
                    <Metric label="RDV" value={c.meetingsBooked} />
                  </div>

                  {c.notes && <p className="text-[12px] text-text-muted border-t border-border pt-2">{c.notes}</p>}

                  <div className="mt-3">
                    <select
                      value={c.status}
                      onChange={(e) => update(c.id, { status: e.target.value as CampaignStatus })}
                      className="bg-surface-2 border border-border-light rounded-lg px-2 py-1 text-[12px]"
                    >
                      <option value="active">Active</option>
                      <option value="paused">En pause</option>
                      <option value="completed">Terminée</option>
                      <option value="draft">Brouillon</option>
                    </select>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une campagne">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom de la campagne"><Input name="name" required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plateforme">
              <Select name="platform" defaultValue="LGM">
                <option value="LGM">La Growth Machine</option>
                <option value="Instantly">Instantly</option>
              </Select>
            </Field>
            <Field label="Statut">
              <Select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminée</option>
                <option value="draft">Brouillon</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date de début"><Input type="date" name="startDate" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
            <Field label="Date de fin"><Input type="date" name="endDate" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Contacts ciblés"><Input type="number" name="contactsTargeted" min={0} defaultValue={0} /></Field>
            <Field label="Messages envoyés"><Input type="number" name="messagesSent" min={0} defaultValue={0} /></Field>
            <Field label="Ouverts"><Input type="number" name="opened" min={0} defaultValue={0} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Réponses"><Input type="number" name="replied" min={0} defaultValue={0} /></Field>
            <Field label="Réponses positives"><Input type="number" name="positiveReplies" min={0} defaultValue={0} /></Field>
            <Field label="RDV obtenus"><Input type="number" name="meetingsBooked" min={0} defaultValue={0} /></Field>
          </div>
          <Field label="Notes"><Textarea name="notes" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg p-2 text-center">
      <p className="text-[15px] font-display font-semibold">{value.toLocaleString("fr-FR")}</p>
      <p className="text-[10px] text-text-dim uppercase tracking-wide">{label}{sub ? ` · ${sub}` : ""}</p>
    </div>
  );
}
