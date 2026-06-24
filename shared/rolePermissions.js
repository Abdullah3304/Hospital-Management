/**
 * Central role-permission map. Edit this file to change what each role can do.
 *
 * Resources: patient | checklist | management
 * Actions:   view | create | edit | update | delete | search
 */

const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  OWNER: 'owner',
};

const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  UPDATE: 'update',
  DELETE: 'delete',
  SEARCH: 'search',
};

const RESOURCES = {
  PATIENT: 'patient',
  CHECKLIST: 'checklist',
  MANAGEMENT: 'management',
};

const ADMIN_PERMISSIONS = {
  patient: ['view', 'create', 'edit', 'update', 'delete', 'search'],
  checklist: ['view', 'edit'],
  management: [],
};

const DOCTOR_PERMISSIONS = {
  patient: ['view', 'search'],
  checklist: ['view'],
  management: ['view', 'edit'],
};

const OWNER_PERMISSIONS = {
  patient: ['view', 'create', 'edit', 'update', 'delete', 'search'],
  checklist: ['view', 'edit'],
  management: ['view', 'edit'],
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.DOCTOR]: DOCTOR_PERMISSIONS,
  [ROLES.OWNER]: OWNER_PERMISSIONS,
};

function hasPermission(role, resource, action) {
  const permissions = ROLE_PERMISSIONS[role]?.[resource];
  if (!permissions) return false;
  return permissions.includes(action);
}

function canAccessResource(role, resource) {
  const permissions = ROLE_PERMISSIONS[role]?.[resource];
  return Array.isArray(permissions) && permissions.length > 0;
}

function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || null;
}

module.exports = {
  ROLES,
  ACTIONS,
  RESOURCES,
  ADMIN_PERMISSIONS,
  DOCTOR_PERMISSIONS,
  OWNER_PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessResource,
  getRolePermissions,
};
