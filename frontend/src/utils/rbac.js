// Role Constants
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Check if a user has admin privileges
 * @param {Object} user - The user object from AuthContext
 * @returns {Boolean}
 */
export const isAdmin = (user) => {
  return user?.role?.toLowerCase() === ROLES.ADMIN;
};

/**
 * Check if a user can perform a specific action
 * (Extensible for more complex permissions later)
 */
export const can = (user, action) => {
  if (isAdmin(user)) return true; // Admin can do everything
  
  const permissions = {
    'book_room': true,
    'raise_ticket': true,
    'view_own_data': true,
  };
  
  return !!permissions[action];
};
