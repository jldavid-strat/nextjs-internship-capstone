'use client';

import { View, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

import './shadcn-big-calendar.css';

import { useCallback } from 'react';
import { CalendarEvent } from '@/types/types';
import { redirect } from 'next/navigation';
import ShadcnBigCalendar from './shadcn-big-calendar';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarProps = {
  view: View;
  setView: (val: View) => void;
  date: Date;
  setDate: (val: Date) => void;
  events: CalendarEvent[];
};

export function Calendar({ view, setView, date, setDate, events }: CalendarProps) {
  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);

  return (
    <div className="rbc-tailwind! h-full w-full rounded-md">
      <ShadcnBigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={date}
        onNavigate={onNavigate}
        view={view}
        onView={onView}
        views={['month', 'week', 'day']}
        toolbar={false}
        style={{ height: '100%' }}
        onSelectEvent={(event) => redirect(`/projects/${event.project_id}`)}
      />
    </div>
  );
}
