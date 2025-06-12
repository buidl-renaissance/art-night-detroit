import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error);
        router.push('/login?error=Authentication failed');
      } else {
        // Get the redirect path from the URL
        const redirectTo = router.query.redirect_to as string;
        // If there's a redirect path, go there, otherwise go to dashboard
        router.push(redirectTo || '/dashboard');
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