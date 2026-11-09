export const ADMIN_ROLES = Object.freeze({
  OWNER: "DUEÑA",
  DEVELOPER: "DESARROLLADOR",
});

export const isAdminRole = (role) => Object.values(ADMIN_ROLES).includes(role);

export const prismaRoleToPublicRole = (role) => {
  if (role === "OWNER") return ADMIN_ROLES.OWNER;
  if (role === "DEVELOPER") return ADMIN_ROLES.DEVELOPER;
  return null;
};
