'use client';

import { getCalenderEvents } from '@/actions/calendar.actions';
import { User } from '@/types/db.types';
import { CalendarEvent } from '@/types/types';
import { useQuery } from '@tanstack/react-query';

type useCalendarResult = {
  // handle undefined in component
  events: CalendarEvent[];
  isLoading: boolean;
  error: unknown;
  isSuccess: boolean;
};

export function useCalendar(userId?: User['id']): useCalendarResult {
  // query for getting calendar events
  const { data, isLoading, error, isSuccess } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', userId],
    queryFn: async () => {
      const res = await getCalenderEvents(userId!);
      if (!res.success) throw new Error(JSON.stringify(res.error));
      return res.data;
    },

    // only run when userId is available
    enabled: !!userId,
  });

  return {
    events: data ?? [],
    isLoading: isLoading,
    isSuccess: isSuccess,
    error: error,
  };
}
