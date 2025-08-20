import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
        // Get the redirect path from the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const redirectTo = hashParams.get('redirect_to') || router.query.redirect_to as string;
        
        // If there's a specific redirect path, use it
        if (redirectTo) {
          router.push(decodeURIComponent(redirectTo));
          return;
        }

        // Check if user is admin and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
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