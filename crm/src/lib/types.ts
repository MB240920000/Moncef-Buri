export type ID = string;

export type ContactStatus = "lead" | "prospect" | "qualified" | "customer" | "lost";
export type LeadSource = "LGM" | "Instantly" | "Referral" | "Website" | "LinkedIn" | "Cold Call" | "Other";

export interface Company {
  id: ID;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  website?: string;
  linkedin?: string;
  phone?: string;
  city?: string;
  country?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface Contact {
  id: ID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyId?: ID;
  linkedin?: string;
  source: LeadSource;
  status: ContactStatus;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastContactedAt?: string;
}

export type DealStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: ID;
  name: string;
  companyId?: ID;
  contactId?: ID;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  source: LeadSource;
  notes?: string;
  createdAt: string;
  closedAt?: string;
  lostReason?: string;
  cost?: number;
}

export type DevisStatus = "draft" | "sent" | "accepted" | "refused" | "expired";

export interface DevisItem {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface Devis {
  id: ID;
  number: string;
  dealId?: ID;
  companyId?: ID;
  contactId?: ID;
  title: string;
  status: DevisStatus;
  issueDate: string;
  validUntil?: string;
  items: DevisItem[];
  notes?: string;
  currency: string;
  createdAt: string;
}

export type TaskType = "call" | "email" | "meeting" | "todo";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: ID;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  done: boolean;
  contactId?: ID;
  companyId?: ID;
  dealId?: ID;
  createdAt: string;
}

export type CampaignPlatform = "LGM" | "Instantly";
export type CampaignStatus = "active" | "paused" | "completed" | "draft";

export interface Campaign {
  id: ID;
  name: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  contactsTargeted: number;
  messagesSent: number;
  opened: number;
  replied: number;
  positiveReplies: number;
  meetingsBooked: number;
  notes?: string;
}

export interface WebsiteProject {
  id: ID;
  name: string;
  url: string;
  companyId?: ID;
  monthlyVisitors: number;
  conversionRate: number;
  avgLoadTime: number;
  uptime: number;
  lastChecked: string;
  status: "live" | "maintenance" | "issue";
}

export interface WorkflowStep {
  id: ID;
  type: "wait" | "email" | "task" | "stage_change" | "tag";
  config: Record<string, string | number>;
}

export interface Workflow {
  id: ID;
  name: string;
  trigger: string;
  active: boolean;
  steps: WorkflowStep[];
  createdAt: string;
}
