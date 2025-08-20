import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Signup from '@/components/auth/Signup';
import PageContainer from '@/components/PageContainer';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { redirect_to } = router.query;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (redirect_to && typeof redirect_to === 'string') {
          router.push(redirect_to);
        } else {
          router.push('/dashboard');
        }
      }
    };

    checkSession();
  }, [router, supabase.auth, redirect_to]);

  return (
    <PageContainer theme="dark" width="narrow">
      <Signup />
    </PageContainer>
  );
}
