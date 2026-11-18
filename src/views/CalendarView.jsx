import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Utensils, 
  CheckCircle2, Plus, Moon, Sparkles, Clock, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useNotification } from '../context/NotificationContext';

export function CalendarView() {
  const { user } = useAuth();
  const { startWorkout } = useActiveWorkout();
  const { success } = useNotification();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fitlife_calendar_events') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.workouts.getLogs().then(data => setWorkouts(data || [])).catch(() => {});
    api.workouts.getRoutines().then(data => setRoutines(data || [])).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleScheduleWorkout = (routine) => {
    const newEvent = {
      id: `evt_${Date.now()}`,
      date: selectedDate,
      type: 'workout',
      title: routine.name,
      routineId: routine.id,
      completed: false
    };
    const updated = [...scheduledEvents, newEvent];
    setScheduledEvents(updated);
    localStorage.setItem('fitlife_calendar_events', JSON.stringify(updated));
    success(`Scheduled ${routine.name} for ${selectedDate}!`, 'Calendar Updated');
  };

  const handleSetRestDay = () => {
    const newEvent = {
      id: `evt_${Date.now()}`,
      date: selectedDate,
      type: 'rest',
      title: 'Active Recovery & Rest Day',
      completed: true
    };
    const updated = [...scheduledEvents, newEvent];
    setScheduledEvents(updated);
    localStorage.setItem('fitlife_calendar_events', JSON.stringify(updated));
    success(`Set ${selectedDate} as Rest Day.`, 'Rest Scheduled');
  };

  // Find events for selected day
  const dayEvents = scheduledEvents.filter(e => e.date === selectedDate);
  const dayLogs = workouts.filter(w => w.date === selectedDate);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-brand-neon" />
            Smart Fitness Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize training splits, scheduled recovery days, meal preparations, and fitness milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetRestDay()}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Mark Rest Day
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar + Day Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
          
          {/* Month Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-white">
              {monthNames[month]} {year}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-navy-900/40 opacity-40 border border-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === cellDate;
              const hasCompletedLog = workouts.some(w => w.date === cellDate);
              const daySchedule = scheduledEvents.filter(e => e.date === cellDate);

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-neon/15 border-brand-neon shadow-neon-sm'
                      : 'bg-navy-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-brand-neon' : 'text-slate-300'}`}>
                    {dayNum}
                  </span>

                  <div className="space-y-1">
                    {hasCompletedLog && (
                      <span className="block truncate text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ Completed
                      </span>
                    )}

                    {daySchedule.slice(0, 1).map((evt, idx) => (
                      <span
                        key={idx}
                        className={`block truncate text-[9px] font-bold px-1 rounded ${
                          evt.type === 'rest'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-brand-neon/20 text-brand-neon'
                        }`}
                      >
                        {evt.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold text-brand-neon uppercase tracking-wider block">
                Selected Fitness Schedule
              </span>
              <h3 className="text-base font-extrabold text-white mt-0.5">{selectedDate}</h3>
            </div>

            {/* Scheduled events on this day */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Planned & Logged Activities:
              </h4>

              {dayLogs.length === 0 && dayEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No activities scheduled for this date.</p>
              ) : (
                <div className="space-y-2">
                  {dayLogs.map(l => (
                    <div key={l.id} className="p-3 rounded-2xl bg-navy-900 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{l.routineName}</span>
                        <span className="text-[10px] text-emerald-400">✓ Completed ({l.durationMinutes}m)</span>
                      </div>
                    </div>
                  ))}

                  {dayEvents.map(evt => (
                    <div key={evt.id} className="p-3 rounded-2xl bg-navy-900 border border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{evt.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick schedule routine dropdown */}
            <div className="mt-5 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                + Schedule Routine for this day:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {routines.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleScheduleWorkout(r)}
                    className="w-full p-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 hover:text-brand-neon flex items-center justify-between transition-colors"
                  >
                    <span>{r.name}</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              ⚡ Consistency streak maintained through smart planning.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
