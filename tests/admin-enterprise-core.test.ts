/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    length: 0,
    key: () => null,
  };
}

import { AdminAuditService } from '../src/features/administration/services/AdminAuditService';
import { AdminUserStore } from '../src/features/administration/services/AdminUserStore';
import { AdminOrgStore } from '../src/features/administration/services/AdminOrgStore';
import { SupportTicketStore } from '../src/features/administration/services/SupportTicketStore';

test('AdminAuditService records audit events with timestamp and actor', () => {
  const log = AdminAuditService.logAction({
    actorName: 'CTO Test',
    role: 'super_admin',
    action: 'Test Audit Log',
    category: 'system',
    target: 'Unit Testing',
    details: 'Testing Enterprise Audit Engine',
    status: 'success',
  });

  assert.equal(log.actorName, 'CTO Test');
  assert.equal(log.category, 'system');
  assert.ok(log.id.startsWith('AUD-'));

  const allLogs = AdminAuditService.getAll();
  assert.ok(allLogs.some(l => l.id === log.id));
});

test('AdminUserStore manages user creation, status toggle, and deletion', () => {
  const initialCount = AdminUserStore.getAll().length;

  const newUser = AdminUserStore.addUser({
    email: 'new.support@hospital.com',
    name: 'Agent Support Test',
    role: 'support',
    permissions: ['manage_species', 'manage_support'],
    status: 'active',
  });

  assert.equal(newUser.email, 'new.support@hospital.com');
  assert.equal(AdminUserStore.getAll().length, initialCount + 1);

  // Toggle status to suspended
  const toggled = AdminUserStore.toggleStatus(newUser.id);
  assert.equal(toggled?.status, 'suspended');

  // Delete user
  const deleted = AdminUserStore.deleteUser(newUser.id);
  assert.equal(deleted, true);
  assert.equal(AdminUserStore.getAll().length, initialCount);
});

test('AdminOrgStore manages organization registration and updates', () => {
  const newOrg = AdminOrgStore.addOrg({
    name: 'Club Canari Test',
    type: 'club',
    registrationNumber: 'TEST-9900',
    country: 'France',
    city: 'Nice',
    memberCount: 50,
    contactEmail: 'contact@club-test.fr',
    contactPhone: '+33 4 93 00 00 00',
    status: 'active',
  });

  assert.equal(newOrg.name, 'Club Canari Test');
  
  const updated = AdminOrgStore.updateOrg(newOrg.id, { memberCount: 55 });
  assert.equal(updated?.memberCount, 55);

  const deleted = AdminOrgStore.deleteOrg(newOrg.id);
  assert.equal(deleted, true);
});

test('SupportTicketStore manages customer tickets and replies', () => {
  const ticket = SupportTicketStore.addTicket({
    userEmail: 'user@test.com',
    userName: 'User Test',
    subject: 'Question Test',
    category: 'Général',
    priority: 'high',
    status: 'open',
  }, 'Need help with feature');

  assert.ok(ticket.ticketNumber.startsWith('TK-'));
  assert.equal(ticket.messages.length, 1);

  const replied = SupportTicketStore.replyToTicket(
    ticket.id,
    'Support Agent',
    'support',
    'Here is the solution.'
  );

  assert.equal(replied?.messages.length, 2);
  assert.equal(replied?.status, 'in_progress');
});
