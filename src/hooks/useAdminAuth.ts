import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';
import { getLoginUrlWithRedirect } from '@/lib/redirects';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
}

interface UseAdminAuthOptions {
  /** If true, redirects non-admin users to home page instead of login */
  redirectNonAdminToHome?: boolean;
  /** If true, allows access to non-admin users (just checks authentication) */
  allowNonAdmin?: boolean;
  /** Custom redirect path instead of current page */
  customRedirectPath?: string;
}

interface UseAdminAuthReturn {
  /** Current authenticated user */
  user: User | null;
  /** User profile data including admin status */
  profile: Profile | null;
  /** Loading state for authentication check */
  loading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is an admin */
  isAdmin: boolean;
  /** Whether user has access (based on admin requirements) */
  hasAccess: boolean;
  /** Error message if authentication failed */
  error: string | null;
  /** Manually trigger a redirect to login */
  redirectToLogin: () => void;
  /** Manually trigger a logout */
  logout: () => Promise<void>;
}

/**
 * Hook for managing admin authentication state and automatic redirects
 * 
 * @param options Configuration options for the hook
 * @returns Authentication state and helper functions
 */
export const useAdminAuth = (options: UseAdminAuthOptions = {}): UseAdminAuthReturn => {
  const {
    redirectNonAdminToHome = false,
    allowNonAdmin = false,
    customRedirectPath
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  // Derived state
  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;
  const hasAccess = allowNonAdmin ? isAuthenticated : isAdmin;

  // Manual redirect function
  const redirectToLogin = () => {
    const redirectPath = customRedirectPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
    router.push(getLoginUrlWithRedirect(redirectPath));
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setError(null);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // Not authenticated - redirect to login
          if (mounted) {
            setLoading(false);
            const redirectPath = customRedirectPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
            router.push(getLoginUrlWithRedirect(redirectPath));
          }
          return;
        }

        // User is authenticated
        if (mounted) {
          setUser(session.user);
        }

        // Fetch user profile to check admin status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Failed to fetch user profile');
        }

        if (!mounted) return;

        setProfile(profileData as Profile);

        // Check access permissions
        const userIsAdmin = profileData?.is_admin || false;
        const userHasAccess = allowNonAdmin ? true : userIsAdmin;

        if (!userHasAccess) {
          // User doesn't have required permissions
          if (redirectNonAdminToHome) {
            router.push('/');
          } else {
            setError('Access denied. Admin privileges required.');
            // Could also redirect to a "no access" page here
          }
          return;
        }

        // All checks passed
        setLoading(false);

      } catch (err) {
        console.error('Authentication error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        const redirectPath = customRedirectPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
        router.push(getLoginUrlWithRedirect(redirectPath));
      } else if (event === 'SIGNED_IN' && session) {
        // Re-run the auth check when user signs in
        checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase, allowNonAdmin, redirectNonAdminToHome, customRedirectPath]);

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    hasAccess,
    error,
    redirectToLogin,
    logout
  };
};

/**
 * Simplified hook specifically for admin-only pages
 * Automatically redirects non-authenticated users to login and non-admin users to home
 */
export const useRequireAdmin = () => {
  return useAdminAuth({
    allowNonAdmin: false,
    redirectNonAdminToHome: true
  });
};

/**
 * Hook for pages that require authentication but allow non-admin users
 */
export const useRequireAuth = () => {
  return useAdminAuth({
    allowNonAdmin: true
  });
};

