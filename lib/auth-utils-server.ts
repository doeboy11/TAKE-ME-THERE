import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getUserSession() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth() {
  const session = await getUserSession();
  if (!session) {
    redirect('/login?redirected=true');
  }
  return session;
}

export async function getUserProfile(userId: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}

export async function getCurrentUser() {
  const session = await getUserSession();
  if (!session?.user) return null;

  const profile = await getUserProfile(session.user.id);
  
  return {
    ...session.user,
    profile,
  };
}
