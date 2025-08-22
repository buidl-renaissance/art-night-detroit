import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Login from '@/components/auth/Login';
import PageContainer from '@/components/PageContainer';
import { getRedirectUrl, getAuthRedirectUrl } from '@/lib/redirects';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { redirect_to } = router.query;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get redirect URL and check admin status
        const redirectTo = getRedirectUrl(router);
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const finalRedirectUrl = getAuthRedirectUrl(redirectTo, profile?.is_admin || false);
        router.push(finalRedirectUrl);
      }
    };

    checkSession();
  }, [router, supabase.auth, redirect_to]);

  return (
    <PageContainer theme="dark" width="narrow">
      <Login />
    </PageContainer>
  );
}