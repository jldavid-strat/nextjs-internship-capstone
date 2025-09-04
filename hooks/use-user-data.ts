'use client';

import { getCurrentUserData } from '@/actions/user.actions';
import { User } from '@/types/db.types';
import { useQuery } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

type useUserDataResult = {
  // handle undefined in component
  user: User | undefined;
  isLoading: boolean;
  error: unknown;
  isSuccess: boolean;
};

export function useUserData(): useUserDataResult {
  // query for getting user data of current user
  const { data, isLoading, error, isSuccess } = useQuery<User>({
    queryKey: ['user-data'],
    queryFn: async () => {
      const res = await getCurrentUserData();
      if (!res.success || !res.data) redirect('/sign-in');

      return res.data;
    },
  });

  return {
    user: data,
    isLoading,
    isSuccess,
    error: error,
  };
}
