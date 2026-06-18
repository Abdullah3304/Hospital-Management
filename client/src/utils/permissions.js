import rolePermissions from '../../../shared/rolePermissions.js';

const {
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
} = rolePermissions;

export {
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

export function canManagePatients(role) {
  return (
    hasPermission(role, RESOURCES.PATIENT, ACTIONS.CREATE)
    || hasPermission(role, RESOURCES.PATIENT, ACTIONS.EDIT)
    || hasPermission(role, RESOURCES.PATIENT, ACTIONS.UPDATE)
    || hasPermission(role, RESOURCES.PATIENT, ACTIONS.DELETE)
  );
}

export function canViewChecklist(role) {
  return hasPermission(role, RESOURCES.CHECKLIST, ACTIONS.VIEW);
}

export function canEditChecklist(role) {
  return hasPermission(role, RESOURCES.CHECKLIST, ACTIONS.EDIT);
}

export function canViewManagement(role) {
  return hasPermission(role, RESOURCES.MANAGEMENT, ACTIONS.VIEW);
}

export function canEditManagement(role) {
  return hasPermission(role, RESOURCES.MANAGEMENT, ACTIONS.EDIT);
}
