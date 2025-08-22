import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getRedirectUrl, getAuthRedirectUrl } from '@/lib/redirects';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error);
        router.push('/login?error=Authentication failed');
      } else if (session) {
        // Get the redirect path from URL hash or query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashRedirect = hashParams.get('redirect_to');
        const queryRedirect = getRedirectUrl(router);
        const redirectTo = hashRedirect ? decodeURIComponent(hashRedirect) : queryRedirect;
        
        // Check if user is admin and determine final redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const finalRedirectUrl = getAuthRedirectUrl(redirectTo, profile?.is_admin || false);
        router.push(finalRedirectUrl);
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      color: '#e0e0e0'
    }}>
      Completing sign in...
    </div>
  );
} 