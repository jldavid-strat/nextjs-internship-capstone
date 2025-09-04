'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/calendar/calendar';
import React, { useState } from 'react';
import { View } from 'react-big-calendar';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useUserData } from '@/hooks/use-user-data';
import { useCalendar } from '@/hooks/use-calendar-events';

export default function CalendarPage() {
  const now = new Date();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(now);
  const { user, isLoading: isUserDataLoading } = useUserData();
  const { events, isLoading: isCalendarLoading } = useCalendar(user?.id);
  const isLoading = isUserDataLoading || isCalendarLoading;

  if (isLoading) {
    return <div>Loading Calendar...</div>;
  }
  function onViewChange(next: View) {
    setView(next);
  }

  function goPrev() {
    setDate((d) => {
      if (view === 'day') return addDays(d, -1);
      if (view === 'week') return addWeeks(d, -1);
      return addMonths(d, -1);
    });
  }

  function goNext() {
    setDate((d) => {
      if (view === 'day') return addDays(d, 1);
      if (view === 'week') return addWeeks(d, 1);
      return addMonths(d, 1);
    });
  }

  function formatCalendarDate(d: Date) {
    switch (view) {
      case 'day': // Sunday, August 31
        return format(d, 'EEEE, MMMM d');
      case 'week': {
        const start = startOfWeek(d, { weekStartsOn: 0 }); // Sunday-start
        const end = endOfWeek(d, { weekStartsOn: 0 });
        return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d')}`;
      }
      case 'month': // August 2025
        return format(d, 'MMMM yyyy');
      default:
        return 'Invalid view';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-3xl font-bold">Calendar</h1>
          <p className="text-md text-muted-foreground mt-2">
            View project deadlines and team schedules
          </p>
        </div>
        {/* <Button className="inline-flex items-center rounded-lg px-2 py-2 text-white transition-colors">
          <Plus size={20} />
          Add Event
        </Button> */}
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Previous" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <CardTitle className="text-xl">{formatCalendarDate(date)}</CardTitle>

            <Button variant="ghost" size="icon" aria-label="Next" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Tabs value={view} onValueChange={(v) => onViewChange(v as View)} className="w-fit">
              <TabsList>
                <TabsTrigger value="month" className="hover:cursor-pointer">
                  Month
                </TabsTrigger>
                <TabsTrigger value="week" className="hover:cursor-pointer">
                  Week
                </TabsTrigger>
                <TabsTrigger value="day" className="hover:cursor-pointer">
                  Day
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-muted/40 border-input h-[600px] w-full rounded-xs border-1">
            <Calendar view={view} setView={setView} date={date} setDate={setDate} events={events} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
