import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Phone, Mail, Users as UsersIcon, CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { PageHeader, Card } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { useTasks, useCompanies, useContacts, useDeals, formatDate } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Task, TaskPriority, TaskType } from "../../lib/types";

const TYPE_ICON: Record<TaskType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: UsersIcon,
  todo: CheckSquare,
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendarPage() {
  const { items: tasks, add, update, remove } = useTasks();
  const { items: companies } = useCompanies();
  const { items: contacts } = useContacts();
  const { items: deals } = useDeals();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name;

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(cursor);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];

    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, 1 - (startOffset - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return cells;
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = new Date(t.dueDate).toDateString();
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const todayStr = new Date().toDateString();
  const upcoming = useMemo(
    () =>
      [...tasks]
        .filter((t) => !t.done)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 8),
    [tasks]
  );

  const handleCreate = (form: FormData) => {
    const task: Task = {
      id: uid(),
      title: String(form.get("title") || ""),
      description: String(form.get("description") || "") || undefined,
      type: (form.get("type") as TaskType) || "todo",
      priority: (form.get("priority") as TaskPriority) || "medium",
      dueDate: String(form.get("dueDate") || new Date().toISOString().slice(0, 10)),
      done: false,
      companyId: String(form.get("companyId") || "") || undefined,
      contactId: String(form.get("contactId") || "") || undefined,
      dealId: String(form.get("dealId") || "") || undefined,
      createdAt: new Date().toISOString(),
    };
    add(task);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Calendrier & Tâches"
        subtitle="Organisez vos relances, appels, rendez-vous et tâches de prospection."
        actions={
          <Button variant="primary" onClick={() => { setSelectedDate(null); setModalOpen(true); }}>
            <Plus size={14} /> Nouvelle tâche
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-display font-semibold capitalize">{monthLabel}</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCursor(new Date())} className="px-2.5 py-1 rounded-lg hover:bg-surface-2 text-text-muted text-[12px]">
                Aujourd'hui
              </button>
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-dim font-medium mb-1">
            {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, inMonth }, i) => {
              const key = date.toDateString();
              const dayTasks = tasksByDate.get(key) ?? [];
              const isToday = key === todayStr;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(date.toISOString().slice(0, 10));
                    setModalOpen(true);
                  }}
                  className={`min-h-[84px] p-1.5 rounded-lg border text-left transition-colors ${
                    inMonth ? "border-border bg-surface-2/40" : "border-transparent bg-transparent opacity-40"
                  } ${isToday ? "border-accent/50 bg-accent/10" : ""} hover:border-accent/40`}
                >
                  <span className={`text-[11px] font-medium ${isToday ? "text-accent" : "text-text-muted"}`}>{date.getDate()}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className={`text-[10px] truncate px-1 py-0.5 rounded ${t.done ? "bg-surface line-through text-text-dim" : "bg-accent/15 text-indigo-200"}`}>
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && <div className="text-[10px] text-text-dim px-1">+{dayTasks.length - 3} autres</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Prochaines tâches</h3>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-text-dim">Aucune tâche à venir.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => {
                const Icon = TYPE_ICON[t.type];
                const overdue = new Date(t.dueDate) < new Date(todayStr) && !t.done;
                return (
                  <li key={t.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-2 border border-border">
                    <button onClick={() => update(t.id, { done: !t.done })} className="mt-0.5 text-text-dim hover:text-success">
                      {t.done ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${t.done ? "line-through text-text-dim" : ""}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-text-dim"><Icon size={11} /> {t.type}</span>
                        {companyName(t.companyId) && <span className="text-[11px] text-text-dim">· {companyName(t.companyId)}</span>}
                      </div>
                    </div>
                    <span className={`text-[11px] shrink-0 ${overdue ? "text-danger" : "text-text-dim"}`}>{formatDate(t.dueDate)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h3 className="font-display font-semibold mb-3">Toutes les tâches</h3>
        <div className="space-y-1.5">
          {[...tasks]
            .sort((a, b) => Number(a.done) - Number(b.done) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((t) => {
              const Icon = TYPE_ICON[t.type];
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-2 group">
                  <button onClick={() => update(t.id, { done: !t.done })} className="text-text-dim hover:text-success">
                    {t.done ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} />}
                  </button>
                  <Icon size={14} className="text-text-dim shrink-0" />
                  <span className={`text-[13px] flex-1 ${t.done ? "line-through text-text-dim" : ""}`}>{t.title}</span>
                  {companyName(t.companyId) && <span className="text-[11px] text-text-dim hidden sm:inline">{companyName(t.companyId)}</span>}
                  <Badge color={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "slate"}>{t.priority}</Badge>
                  <span className="text-[11px] text-text-dim w-20 text-right">{formatDate(t.dueDate)}</span>
                  <button onClick={() => remove(t.id)} className="text-text-dim hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              );
            })}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle tâche">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Titre"><Input name="title" required /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type">
              <Select name="type" defaultValue="todo">
                <option value="todo">Tâche</option>
                <option value="call">Appel</option>
                <option value="email">Email</option>
                <option value="meeting">Rendez-vous</option>
              </Select>
            </Field>
            <Field label="Priorité">
              <Select name="priority" defaultValue="medium">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" name="dueDate" defaultValue={selectedDate ?? new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>
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
          <Field label="Deal lié">
            <Select name="dealId" defaultValue="">
              <option value="">Aucun</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
          <Field label="Description"><Textarea name="description" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Créer la tâche</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
