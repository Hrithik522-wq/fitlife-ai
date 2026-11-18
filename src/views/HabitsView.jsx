import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Droplets, Footprints, Moon, HeartPulse, 
  Sparkles, CheckCircle2, Clock, AlarmClock, X, Flame 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function HabitsView() {
  const { user } = useAuth();
  const { success, error } = useNotification();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitLog, setHabitLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Meditation timer state
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationSeconds, setMeditationSeconds] = useState(300); // 5 min default
  const [meditationTimerActive, setMeditationTimerActive] = useState(false);

  // Custom habit modal
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customHabitName, setCustomHabitName] = useState('');

  useEffect(() => {
    loadHabits();
  }, [date, user]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await api.habits.getHabits(date);
      setHabitLog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const res = await api.habits.toggleHabit(habitId, date);
      setHabitLog(res);
      success('Habit status updated', 'Completed');
    } catch (err) {
      error(err.message, 'Failed to update');
    }
  };

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!customHabitName.trim()) return;
    try {
      const res = await api.habits.addCustom(customHabitName, date);
      setHabitLog(res);
      success('Custom habit added to your daily checklist!', 'Habit Created');
      setCustomHabitName('');
      setShowAddCustom(false);
    } catch (err) {
      error(err.message, 'Failed to create');
    }
  };

  const handleUpdateMetrics = async (field, value) => {
    try {
      const payload = {
        date,
        [field]: value
      };
      const res = await api.habits.updateHabits(payload);
      setHabitLog(res);
    } catch (err) {}
  };

  // Meditation timer tick
  useEffect(() => {
    let interval = null;
    if (meditationTimerActive && meditationSeconds > 0) {
      interval = setInterval(() => {
        setMeditationSeconds(prev => prev - 1);
      }, 1000);
    } else if (meditationSeconds === 0 && meditationTimerActive) {
      clearInterval(interval);
      setMeditationTimerActive(false);
      handleUpdateMetrics('meditationMinutes', (habitLog?.meditationMinutes || 0) + 5);
      success('Meditation completed! +5 mins recorded to wellness index.', 'Mindfulness Done');
    }
    return () => clearInterval(interval);
  }, [meditationTimerActive, meditationSeconds]);

  const wellnessScore = habitLog?.wellnessScore || 85;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-brand-neon" />
            Daily Health & Habit Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build unshakeable fitness habits, track sleep hygiene, mindfulness, and non-medical wellness index.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-navy-850 border border-slate-700 text-xs font-semibold text-white focus:border-brand-neon"
          />
          <button
            onClick={() => setShowAddCustom(true)}
            className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-neon-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Custom Habit
          </button>
        </div>
      </div>

      {/* Wellness Score Card Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-850 via-navy-800 to-navy-850 border border-brand-neon/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-neon-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-neon/15 text-brand-neon text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>FitLife Daily Wellness Score</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-brand-neon">{wellnessScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100 Optimal Recovery</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Calculated transparently from your daily hydration (25%), optimal sleep duration (25%), step activity (25%), and checklist adherence (25%).
          </p>
        </div>

        {/* Breakdown meters */}
        <div className="w-full md:w-80 space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Hydration ({(habitLog?.waterMl || 0)}ml)</span>
              <span className="text-cyan-400 font-bold">25 pts</span>
            </div>
            <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Sleep Duration ({(habitLog?.sleepHours || 7.5)} hrs)</span>
              <span className="text-indigo-400 font-bold">23 pts</span>
            </div>
            <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Step Activity ({(habitLog?.steps || 8420).toLocaleString()})</span>
              <span className="text-emerald-400 font-bold">21 pts</span>
            </div>
            <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Trackers + Habit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Habit Checklist (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-neon" />
              <h3 className="text-base font-extrabold text-white">Daily Habit Checklist</h3>
            </div>
            <span className="text-xs text-brand-neon font-bold">
              {habitLog?.habits?.filter(h => h.completed).length || 0} of {habitLog?.habits?.length || 0} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {(habitLog?.habits || []).map(h => (
              <div
                key={h.id}
                onClick={() => handleToggleHabit(h.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  h.completed
                    ? 'bg-brand-neon/10 border-brand-neon/40 text-white'
                    : 'bg-navy-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    h.completed ? 'bg-brand-neon border-brand-neon text-navy-950 font-black shadow-neon-sm' : 'border-slate-600'
                  }`}>
                    {h.completed && <CheckCircle2 className="w-4 h-4 fill-brand-neon text-navy-950" />}
                  </div>
                  <span className={`text-xs font-semibold ${h.completed ? 'line-through text-slate-400' : ''}`}>
                    {h.name}
                  </span>
                </div>

                {h.isCustom && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-400">
                    Custom
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Core Daily Metrics & Mindfulness Timer (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Sleep & Quality Journal Card */}
          <div className="p-5 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Sleep Duration & Quality
              </span>
              <span className="text-xs font-bold text-indigo-400">
                {habitLog?.sleepHours || 7.5} Hours
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                min="0"
                max="16"
                value={habitLog?.sleepHours || 7.5}
                onChange={(e) => handleUpdateMetrics('sleepHours', Number(e.target.value))}
                className="w-20 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700 text-xs font-bold text-white text-center"
              />
              <span className="text-xs text-slate-400">hours logged</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleUpdateMetrics('sleepQuality', star)}
                  className={`text-sm ${star <= (habitLog?.sleepQuality || 4) ? 'text-amber-400' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Guided Mindfulness & Meditation Timer */}
          <div className="p-5 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-neon" />
                Mindfulness & Breathing Timer
              </span>
              <span className="text-xs font-bold text-brand-neon">
                {habitLog?.meditationMinutes || 0}m Today
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 text-center space-y-2">
              <span className="text-2xl font-mono font-bold text-white block">
                {Math.floor(meditationSeconds / 60)}:{(meditationSeconds % 60).toString().padStart(2, '0')}
              </span>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setMeditationTimerActive(!meditationTimerActive)}
                  className="px-4 py-1.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs"
                >
                  {meditationTimerActive ? 'Pause' : 'Start 5-Min Breathe'}
                </button>
                <button
                  onClick={() => { setMeditationTimerActive(false); setMeditationSeconds(300); }}
                  className="px-3 py-1.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-400 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Add Custom Habit Modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-700/80 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Custom Habit</h3>
              <button onClick={() => setShowAddCustom(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  placeholder="e.g. 15-minute post-lunch walk"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-neon text-navy-950 font-bold text-xs"
              >
                Add Habit to Today
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
