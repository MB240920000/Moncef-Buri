import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import ContactsPage from "./pages/contacts/ContactsPage";
import ContactDetail from "./pages/contacts/ContactDetail";
import CompaniesPage from "./pages/companies/CompaniesPage";
import CompanyDetail from "./pages/companies/CompanyDetail";
import DealsPage from "./pages/deals/DealsPage";
import DevisPage from "./pages/devis/DevisPage";
import DevisEditor from "./pages/devis/DevisEditor";
import CalendarPage from "./pages/calendar/CalendarPage";
import CampaignsPage from "./pages/campaigns/CampaignsPage";
import WorkflowsPage from "./pages/workflows/WorkflowsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import WebsitesPage from "./pages/websites/WebsitesPage";
import SettingsPage from "./pages/settings/SettingsPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/devis" element={<DevisPage />} />
        <Route path="/devis/new" element={<DevisEditor />} />
        <Route path="/devis/:id" element={<DevisEditor />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/websites" element={<WebsitesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
