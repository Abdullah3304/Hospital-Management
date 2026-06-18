const {
  ROLES,
  ACTIONS,
  RESOURCES,
  hasPermission,
  canAccessResource,
  getRolePermissions,
  ROLE_PERMISSIONS,
  ADMIN_PERMISSIONS,
  DOCTOR_PERMISSIONS,
  OWNER_PERMISSIONS,
} = require('../shared/rolePermissions');

function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!hasPermission(req.user?.role, resource, action)) {
      return res.status(403).json({ error: 'You do not have permission for this action' });
    }
    next();
  };
}

module.exports = {
  ROLES,
  ACTIONS,
  RESOURCES,
  ROLE_PERMISSIONS,
  ADMIN_PERMISSIONS,
  DOCTOR_PERMISSIONS,
  OWNER_PERMISSIONS,
  hasPermission,
  canAccessResource,
  getRolePermissions,
  requirePermission,
};
