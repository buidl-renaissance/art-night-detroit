import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      console.log('profile', profile);
      if (profile) {
        setProfile(profile as Profile);
      }

      setLoading(false);
    };

    checkAdmin();
  }, [supabase.auth]);

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.is_admin || false,
  };
}; 