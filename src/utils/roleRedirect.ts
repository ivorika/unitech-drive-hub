export const getRoleBasedRedirect = (role: string | null): string => {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'instructor':
      return '/instructor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/';
  }
};

export const getDefaultRouteForRole = (role: string | null): string => {
  return getRoleBasedRedirect(role);
};