/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'auditor';

export type AdminPermission = 
  | 'manage_users'
  | 'manage_licenses'
  | 'manage_orgs'
  | 'manage_species'
  | 'view_security'
  | 'view_qa'
  | 'manage_support'
  | 'manage_settings'
  | 'export_reporting';

export interface AdminUserProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  status: 'active' | 'suspended' | 'pending';
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  lastLoginAt: string;
  deviceCount: number;
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: AdminRole;
  action: string;
  category: 'user' | 'license' | 'org' | 'security' | 'species' | 'system' | 'support';
  target: string;
  details: string;
  status: 'success' | 'warning' | 'error';
  ipAddress?: string;
}

export type OrganizationType = 'club' | 'association' | 'breeding_farm' | 'vet_clinic' | 'partner';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  country: string;
  city: string;
  memberCount: number;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: {
    id: string;
    senderName: string;
    senderRole: 'user' | 'support' | 'admin';
    content: string;
    timestamp: string;
  }[];
}

export interface FaqItem {
  id: string;
  category: string;
  question: Record<string, string>; // localized by lang
  answer: Record<string, string>;   // localized by lang
  published: boolean;
  order: number;
}
