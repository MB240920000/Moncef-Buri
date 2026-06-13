import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader, Card, StatCard } from "../../components/ui/Layout";
import Badge from "../../components/ui/Badge";
import { useDeals, useCompanies, formatCurrency, formatDate } from "../../lib/data";
import { TrendingUp, Wallet, PiggyBank, Percent } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

export default function ReportsPage() {
  const { items: deals } = useDeals();
  const { items: companies } = useCompanies();

  const wonDeals = deals.filter((d) => d.stage === "won");
  const lostDeals = deals.filter((d) => d.stage === "lost");
  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");

  const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const totalCost = wonDeals.reduce((s, d) => s + (d.cost ?? 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const marginPct = totalRevenue ? ((totalMargin / totalRevenue) * 100).toFixed(1) : "0";

  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? ((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100).toFixed(0)
      : "0";

  const monthly = useMemo(() => {
    const map = new Map<string, { revenue: number; cost: number }>();
    for (const d of wonDeals) {
      const date = new Date(d.closedAt ?? d.createdAt);
      const key = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date);
      const cur = map.get(key) ?? { revenue: 0, cost: 0 };
      cur.revenue += d.value;
      cur.cost += d.cost ?? 0;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, Revenu: v.revenue, Coûts: v.cost, Marge: v.revenue - v.cost }));
  }, [wonDeals]);

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of wonDeals) {
      map.set(d.source, (map.get(d.source) ?? 0) + d.value);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [wonDeals]);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Rapports & Rentabilité"
        subtitle="Suivez votre chiffre d'affaires, vos coûts, votre marge et vos taux de conversion."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenu total (gagné)" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={18} />} />
        <StatCard label="Coûts totaux" value={formatCurrency(totalCost)} icon={<Wallet size={18} />} />
        <StatCard label="Marge nette" value={formatCurrency(totalMargin)} sub={`${marginPct}% de marge`} icon={<PiggyBank size={18} />} />
        <StatCard label="Taux de conversion" value={`${winRate}%`} sub={`${wonDeals.length} gagnés / ${lostDeals.length} perdus`} icon={<Percent size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Revenu, coûts et marge par mois</h3>
          {monthly.length === 0 ? (
            <p className="text-[13px] text-text-dim py-12 text-center">Pas encore de deals gagnés.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a3d" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={{ stroke: "#232a3d" }} tickLine={false} />
                <YAxis tick={{ fill: "#8b93ab", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenu" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Coûts" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Marge" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Revenu par source</h3>
          {bySource.length === 0 ? (
            <p className="text-[13px] text-text-dim py-12 text-center">Pas encore de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} label={({ name }) => name}>
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#161b2c", border: "1px solid #2d3650", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-5 mb-4">
        <h3 className="font-display font-semibold mb-3">Rentabilité par deal gagné</h3>
        {wonDeals.length === 0 ? (
          <p className="text-[13px] text-text-dim py-6 text-center">Aucun deal gagné pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-text-dim text-[11px] uppercase tracking-wider">
                  <th className="py-2 font-medium">Deal</th>
                  <th className="py-2 font-medium">Entreprise</th>
                  <th className="py-2 font-medium">Clôturé le</th>
                  <th className="py-2 font-medium text-right">Revenu</th>
                  <th className="py-2 font-medium text-right">Coût</th>
                  <th className="py-2 font-medium text-right">Marge</th>
                  <th className="py-2 font-medium text-right">Marge %</th>
                </tr>
              </thead>
              <tbody>
                {wonDeals.map((d) => {
                  const margin = d.value - (d.cost ?? 0);
                  const pct = d.value ? ((margin / d.value) * 100).toFixed(0) : "0";
                  return (
                    <tr key={d.id} className="border-t border-border">
                      <td className="py-2.5 font-medium">{d.name}</td>
                      <td className="py-2.5 text-text-muted">{companyName(d.companyId)}</td>
                      <td className="py-2.5 text-text-muted">{formatDate(d.closedAt)}</td>
                      <td className="py-2.5 text-right">{formatCurrency(d.value)}</td>
                      <td className="py-2.5 text-right text-text-muted">{formatCurrency(d.cost ?? 0)}</td>
                      <td className="py-2.5 text-right font-semibold text-success">{formatCurrency(margin)}</td>
                      <td className="py-2.5 text-right">
                        <Badge color={Number(pct) >= 60 ? "success" : Number(pct) >= 30 ? "warning" : "danger"}>{pct}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-display font-semibold mb-3">Pipeline ouvert — valeur projetée</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-text-dim text-[11px] uppercase tracking-wider">
                <th className="py-2 font-medium">Deal</th>
                <th className="py-2 font-medium">Entreprise</th>
                <th className="py-2 font-medium text-right">Valeur</th>
                <th className="py-2 font-medium text-right">Probabilité</th>
                <th className="py-2 font-medium text-right">Valeur pondérée</th>
              </tr>
            </thead>
            <tbody>
              {openDeals.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="py-2.5 font-medium">{d.name}</td>
                  <td className="py-2.5 text-text-muted">{companyName(d.companyId)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(d.value)}</td>
                  <td className="py-2.5 text-right text-text-muted">{d.probability}%</td>
                  <td className="py-2.5 text-right font-semibold">{formatCurrency(d.value * (d.probability / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
