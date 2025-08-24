'use client';

import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuthState } from '@/hooks/useAuthState';

export function UserInfo() {
  const { user, loading, signInWithGoogle, signOut } = useAuthState();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        className="flex items-center gap-2"
        disabled={loading}
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        <span className="text-sm font-medium">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
