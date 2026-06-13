import { Link } from "react-router-dom";
import { Handshake, FileText, Megaphone, CalendarCheck, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, PageHeader, StatCard } from "../components/ui/Layout";
import Badge from "../components/ui/Badge";
import {
  useDeals,
  useDevisList,
  useTasks,
  useCampaigns,
  useCompanies,
  useContacts,
  formatCurrency,
  formatDate,
  DEAL_STAGES,
  DEVIS_STATUSES,
} from "../lib/data";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

export default function Dashboard() {
  const { items: deals } = useDeals();
  const { items: devisList } = useDevisList();
  const { items: tasks } = useTasks();
  const { items: campaigns } = useCampaigns();
  const { items: companies } = useCompanies();
  const { items: contacts } = useContacts();

  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);

  const now = new Date();
  const wonThisMonth = deals.filter(
    (d) =>
      d.stage === "won" &&
      d.closedAt &&
      new Date(d.closedAt).getMonth() === now.getMonth() &&
      new Date(d.closedAt).getFullYear() === now.getFullYear()
  );
  const revenueThisMonth = wonThisMonth.reduce((s, d) => s + d.value, 0);
  const costThisMonth = wonThisMonth.reduce((s, d) => s + (d.cost ?? 0), 0);
  const marginThisMonth = revenueThisMonth - costThisMonth;

  const todayStr = new Date().toDateString();
  const tasksToday = tasks.filter((t) => !t.done && new Date(t.dueDate).toDateString() === todayStr);

  const pendingDevis = devisList.filter((d) => d.status === "sent");

  const stageData = DEAL_STAGES.filter((s) => s.key !== "won" && s.key !== "lost").map((s) => ({
    name: s.label,
    value: deals.filter((d) => d.stage === s.key).reduce((sum, d) => sum + d.value, 0),
  }));

  const campaignReplies = campaigns.map((c) => ({
    name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
    réponses: c.replied,
    positives: c.positiveReplies,
    platform: c.platform,
  }));

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name ?? "—";
  const contactName = (id?: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "—";
  };

  return (
    <div>
      <PageHeader
        title="Bonjour Moncef 👋"
        subtitle="Voici un aperçu de votre activité de prospection et de votre pipeline."
        actions={
          <Link to="/deals">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/20">
              <Handshake size={14} /> Voir le pipeline
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pipeline ouvert"
          value={formatCurrency(pipelineValue)}
          sub={`${openDeals.length} deals en cours`}
          icon={<Handshake size={18} />}
        />
        <StatCard
          label="Revenu encaissé (mois)"
          value={formatCurrency(revenueThisMonth)}
          sub={`Marge: ${formatCurrency(marginThisMonth)}`}
          icon={<TrendingUp size={18} />}
          trend={{ value: "vs mois dernier", positive: true }}
        />
        <StatCard
          label="Devis en attente"
          value={String(pendingDevis.length)}
          sub={`${formatCurrency(pendingDevis.reduce((s, d) => s + d.items.reduce((a, i) => a + i.quantity * i.unitPrice * (1 + i.vatRate / 100), 0), 0))} potentiels`}
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Tâches aujourd'hui"
          value={String(tasksToday.length)}
          sub={`${tasks.filter((t) => !t.done).length} tâches actives au total`}
          icon={<CalendarCheck size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Valeur du pipeline par étape</h3>
            <Link to="/deals" className="text-[12px] text-accent hover:underline">Voir le pipeline →</Link>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3d" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={{ stroke: "#232a3d" }} tickLine={false} />
              <YAxis tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {stageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Répartition des deals</h3>
            <Link to="/reports" className="text-[12px] text-accent hover:underline">Rapports →</Link>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stageData.filter((s) => s.value > 0)}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {stageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Megaphone size={16} className="text-accent" /> Performance des campagnes
            </h3>
            <Link to="/campaigns" className="text-[12px] text-accent hover:underline">Voir tout →</Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={campaignReplies} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3d" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#8b93ab", fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="réponses" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="positives" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Tâches d'aujourd'hui</h3>
            <Link to="/calendar" className="text-[12px] text-accent hover:underline">Calendrier →</Link>
          </div>
          {tasksToday.length === 0 ? (
            <p className="text-text-muted text-[13px] py-6 text-center">Rien de prévu aujourd'hui 🎉</p>
          ) : (
            <ul className="space-y-2">
              {tasksToday.map((t) => (
                <li key={t.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-2 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{t.title}</p>
                    <p className="text-[11px] text-text-dim mt-0.5">
                      {companyName(t.companyId)} {t.contactId ? `· ${contactName(t.contactId)}` : ""}
                    </p>
                  </div>
                  <Badge color={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "slate"}>
                    {t.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <FileText size={16} className="text-accent" /> Devis récents
          </h3>
          <Link to="/devis" className="text-[12px] text-accent hover:underline">Voir tout →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-text-dim text-[11px] uppercase tracking-wider">
                <th className="pb-2 font-medium">Numéro</th>
                <th className="pb-2 font-medium">Titre</th>
                <th className="pb-2 font-medium">Entreprise</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Statut</th>
                <th className="pb-2 font-medium text-right">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {devisList.slice(0, 5).map((d) => {
                const status = DEVIS_STATUSES.find((s) => s.key === d.status)!;
                const ttc = d.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 + i.vatRate / 100), 0);
                return (
                  <tr key={d.id} className="border-t border-border hover:bg-surface-2/50">
                    <td className="py-2.5">
                      <Link to={`/devis/${d.id}`} className="text-accent font-medium hover:underline">{d.number}</Link>
                    </td>
                    <td className="py-2.5">{d.title}</td>
                    <td className="py-2.5 text-text-muted">{companyName(d.companyId)}</td>
                    <td className="py-2.5 text-text-muted">{formatDate(d.issueDate)}</td>
                    <td className="py-2.5">
                      <Badge color={status.color.includes("info") ? "info" : status.color.includes("success") ? "success" : status.color.includes("danger") ? "danger" : status.color.includes("warning") ? "warning" : "slate"}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right font-medium">{formatCurrency(ttc, d.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
