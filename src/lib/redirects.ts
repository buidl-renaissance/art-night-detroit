/**
 * Utility functions for handling redirects in authentication flow
 */

/**
 * Generates a login URL with the current page as the redirect destination
 * @param currentPath - The current page path to redirect back to after login
 * @returns Login URL with redirect_to parameter
 */
export function getLoginUrlWithRedirect(currentPath?: string): string {
  // Use current path or window location if available
  const redirectTo = currentPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  
  if (redirectTo) {
    return `/login?redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  
  return '/login';
}

/**
 * Generates a signup URL with the current page as the redirect destination
 * @param currentPath - The current page path to redirect back to after signup
 * @returns Signup URL with redirect_to parameter
 */
export function getSignupUrlWithRedirect(currentPath?: string): string {
  // Use current path or window location if available
  const redirectTo = currentPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  
  if (redirectTo) {
    return `/signup?redirect_to=${encodeURIComponent(redirectTo)}`;
  }
  
  return '/signup';
}

/**
 * Extracts redirect_to parameter from URL or router query
 * @param router - Next.js router object
 * @returns Decoded redirect URL or null
 */
export function getRedirectUrl(router: { query: { redirect_to?: string } }): string | null {
  const redirectTo = router.query.redirect_to as string;
  return redirectTo ? decodeURIComponent(redirectTo) : null;
}

/**
 * Determines the best redirect URL based on priority:
 * 1. Explicit redirect_to parameter
 * 2. Admin dashboard for admin users
 * 3. Default dashboard for regular users
 */
export function getAuthRedirectUrl(redirectTo: string | null, isAdmin: boolean): string {
  if (redirectTo) {
    return redirectTo;
  }
  
  return isAdmin ? '/admin' : '/dashboard';
}

