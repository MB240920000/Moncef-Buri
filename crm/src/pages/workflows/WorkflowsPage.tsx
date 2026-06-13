import { useState } from "react";
import { Plus, Workflow as WorkflowIcon, Mail, Clock, CheckSquare, Tag, ArrowRightLeft, Trash2 } from "lucide-react";
import { PageHeader, Card, EmptyState } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { useWorkflows, formatDate } from "../../lib/data";
import { uid } from "../../lib/storage";
import type { Workflow, WorkflowStep } from "../../lib/types";

const STEP_ICON: Record<WorkflowStep["type"], typeof Mail> = {
  email: Mail,
  wait: Clock,
  task: CheckSquare,
  tag: Tag,
  stage_change: ArrowRightLeft,
};

const STEP_LABEL: Record<WorkflowStep["type"], string> = {
  email: "Envoyer un email",
  wait: "Attendre",
  task: "Créer une tâche",
  tag: "Ajouter un tag",
  stage_change: "Changer le statut",
};

function describeStep(step: WorkflowStep): string {
  switch (step.type) {
    case "wait":
      return `Attendre ${step.config.days ?? "?"} jour(s)`;
    case "email":
      return `Envoyer "${step.config.template ?? "email"}"`;
    case "task":
      return `Créer la tâche "${step.config.title ?? ""}"`;
    case "tag":
      return `Ajouter le tag "${step.config.tag ?? ""}"`;
    case "stage_change":
      return `Passer au statut "${step.config.status ?? ""}"`;
  }
}

export default function WorkflowsPage() {
  const { items: workflows, add, update, remove } = useWorkflows();
  const [modalOpen, setModalOpen] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([{ id: uid(), type: "wait", config: { days: "1" } }]);

  const addStep = () => setSteps((s) => [...s, { id: uid(), type: "task", config: { title: "" } }]);
  const removeStep = (id: string) => setSteps((s) => s.filter((step) => step.id !== id));
  const updateStep = (id: string, patch: Partial<WorkflowStep>) =>
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, ...patch } : step)));

  const handleCreate = (form: FormData) => {
    const workflow: Workflow = {
      id: uid(),
      name: String(form.get("name") || ""),
      trigger: String(form.get("trigger") || ""),
      active: true,
      steps,
      createdAt: new Date().toISOString(),
    };
    add(workflow);
    setSteps([{ id: uid(), type: "wait", config: { days: "1" } }]);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Workflows d'automatisation"
        subtitle="Automatisez vos relances, tâches et changements de statut sur vos contacts et deals."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nouveau workflow
          </Button>
        }
      />

      {workflows.length === 0 ? (
        <Card><EmptyState title="Aucun workflow" subtitle="Créez votre premier workflow d'automatisation." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workflows.map((wf) => (
            <Card key={wf.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
                    <WorkflowIcon size={16} />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold">{wf.name}</h4>
                    <p className="text-[11px] text-text-dim">Déclencheur : {wf.trigger}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={wf.active ? "success" : "slate"}>{wf.active ? "Actif" : "Inactif"}</Badge>
                  <button onClick={() => remove(wf.id)} className="text-text-dim hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>

              <ol className="space-y-2 mb-3">
                {wf.steps.map((step, i) => {
                  const Icon = STEP_ICON[step.type];
                  return (
                    <li key={step.id} className="flex items-center gap-2 text-[13px]">
                      <span className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] text-text-dim shrink-0">{i + 1}</span>
                      <Icon size={13} className="text-accent shrink-0" />
                      <span className="text-text-muted">{describeStep(step)}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[11px] text-text-dim">Créé le {formatDate(wf.createdAt)}</span>
                <button
                  onClick={() => update(wf.id, { active: !wf.active })}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium border ${wf.active ? "border-warning/30 text-amber-400 hover:bg-warning/10" : "border-success/30 text-green-400 hover:bg-success/10"}`}
                >
                  {wf.active ? "Désactiver" : "Activer"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau workflow" width="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(new FormData(e.currentTarget));
          }}
          className="space-y-3"
        >
          <Field label="Nom du workflow"><Input name="name" required placeholder="ex: Relance automatique des devis" /></Field>
          <Field label="Déclencheur"><Input name="trigger" required placeholder="ex: Devis envoyé depuis plus de 3 jours" /></Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-text-muted">Étapes</span>
              <Button size="sm" type="button" onClick={addStep}><Plus size={12} /> Ajouter une étape</Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg p-2">
                  <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] text-text-dim shrink-0">{i + 1}</span>
                  <Select
                    value={step.type}
                    onChange={(e) => updateStep(step.id, { type: e.target.value as WorkflowStep["type"], config: {} })}
                    className="!w-40"
                  >
                    {Object.entries(STEP_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </Select>
                  {step.type === "wait" && (
                    <Input type="number" min={1} placeholder="Jours" value={step.config.days ?? ""} onChange={(e) => updateStep(step.id, { config: { days: e.target.value } })} />
                  )}
                  {step.type === "email" && (
                    <Input placeholder="Nom du template email" value={step.config.template ?? ""} onChange={(e) => updateStep(step.id, { config: { template: e.target.value } })} />
                  )}
                  {step.type === "task" && (
                    <Input placeholder="Titre de la tâche" value={step.config.title ?? ""} onChange={(e) => updateStep(step.id, { config: { title: e.target.value } })} />
                  )}
                  {step.type === "tag" && (
                    <Input placeholder="Nom du tag" value={step.config.tag ?? ""} onChange={(e) => updateStep(step.id, { config: { tag: e.target.value } })} />
                  )}
                  {step.type === "stage_change" && (
                    <Input placeholder="Nouveau statut" value={step.config.status ?? ""} onChange={(e) => updateStep(step.id, { config: { status: e.target.value } })} />
                  )}
                  <button type="button" onClick={() => removeStep(step.id)} className="text-text-dim hover:text-danger ml-auto">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit">Créer le workflow</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
