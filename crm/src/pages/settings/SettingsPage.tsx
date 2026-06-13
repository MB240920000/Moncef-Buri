import { useRef } from "react";
import { Download, Upload, RotateCcw, Database, Plug, Globe } from "lucide-react";
import { PageHeader, Card } from "../../components/ui/Layout";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";

const COLLECTIONS = ["companies", "contacts", "deals", "devis", "tasks", "campaigns", "websites", "workflows"];
const PREFIX = "nexus_crm_";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data: Record<string, unknown> = {};
    for (const key of COLLECTIONS) {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw) data[key] = JSON.parse(raw);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-crm-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        for (const key of COLLECTIONS) {
          if (data[key]) localStorage.setItem(PREFIX + key, JSON.stringify(data[key]));
        }
        window.location.reload();
      } catch {
        alert("Fichier invalide.");
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (confirm("Réinitialiser toutes les données du CRM avec les données de démo ? Cette action est irréversible.")) {
      for (const key of COLLECTIONS) localStorage.removeItem(PREFIX + key);
      window.location.reload();
    }
  };

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Profil, intégrations et gestion des données." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Profil</h3>
          <div className="space-y-3">
            <Field label="Nom"><Input defaultValue="Moncef Buri" /></Field>
            <Field label="Email"><Input defaultValue="burimoncef@gmail.com" /></Field>
            <Field label="Activité"><Input defaultValue="Freelance — Développement web & Marketing automation" /></Field>
            <Field label="Devise par défaut"><Input defaultValue="EUR" /></Field>
          </div>
          <p className="text-[11px] text-text-dim mt-3">
            Ces informations apparaissent sur vos devis. (Sauvegarde des champs profil à venir avec le backend Supabase.)
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Database size={16} className="text-accent" /> Données & sauvegarde</h3>
          <p className="text-[13px] text-text-muted mb-4">
            Vos données sont actuellement stockées localement dans votre navigateur. Exportez-les régulièrement pour ne rien perdre,
            ou connectez Supabase pour une synchronisation multi-appareils.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportData}><Download size={14} /> Exporter (JSON)</Button>
            <Button onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Importer</Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
            <Button variant="danger" onClick={resetData}><RotateCcw size={14} /> Réinitialiser</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Plug size={16} className="text-accent" /> Intégrations prospection</h3>
          <div className="space-y-3">
            <Field label="Clé API La Growth Machine">
              <Input placeholder="lgm_xxx... (à venir : synchronisation automatique des campagnes)" disabled />
            </Field>
            <Field label="Clé API Instantly">
              <Input placeholder="instantly_xxx... (à venir : synchronisation automatique des campagnes)" disabled />
            </Field>
          </div>
          <p className="text-[11px] text-text-dim mt-3">
            Pour l'instant, les campagnes LGM et Instantly sont saisies manuellement dans l'onglet "Prospection".
            La synchronisation automatique via API sera ajoutée avec le backend Supabase.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Globe size={16} className="text-accent" /> Connexion avec votre site (Bolt)</h3>
          <p className="text-[13px] text-text-muted mb-3">
            Pour faire remonter automatiquement les demandes de contact de votre site Bolt vers ce CRM, configurez un webhook
            qui enverra les nouveaux leads vers votre future API Supabase (table <code className="text-accent">contacts</code>).
          </p>
          <Field label="URL de webhook (à venir)">
            <Input placeholder="https://votre-projet.supabase.co/functions/v1/new-lead" disabled />
          </Field>
        </Card>
      </div>
    </div>
  );
}
