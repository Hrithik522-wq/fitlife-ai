import React, { useState } from 'react';
import { 
  Moon, HeartPulse, Sparkles, Activity, Check, Play, Clock, 
  AlertCircle, ShieldCheck, Dumbbell, Flame 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function SleepRecoveryView() {
  const { user } = useAuth();
  const { success } = useNotification();

  const [activeRoutine, setActiveRoutine] = useState(null);
  const [routineTimer, setRoutineTimer] = useState(0);
  const [routineRunning, setRoutineRunning] = useState(false);

  // Muscle recovery status simulated based on recent workouts
  const muscleRecovery = [
    { muscle: 'Chest & Pectorals', status: 'Recovering', percentage: 70, hoursLeft: 18, color: 'text-amber-400' },
    { muscle: 'Lats & Upper Back', status: 'Fully Recovered', percentage: 100, hoursLeft: 0, color: 'text-emerald-400' },
    { muscle: 'Deltoids & Shoulders', status: 'Recovering', percentage: 65, hoursLeft: 22, color: 'text-amber-400' },
    { muscle: 'Quadriceps & Glutes', status: 'Fully Recovered', percentage: 100, hoursLeft: 0, color: 'text-emerald-400' },
    { muscle: 'Hamstrings & Calves', status: 'Ready for Heavy Load', percentage: 95, hoursLeft: 2, color: 'text-emerald-400' },
    { muscle: 'Core & Abdominals', status: 'Fully Recovered', percentage: 100, hoursLeft: 0, color: 'text-emerald-400' }
  ];

  const routines = [
    {
      id: 'stretching_full',
      name: 'Full Body Mobility & Tension Release',
      durationMinutes: 12,
      exercises: [
        'Doorway Chest Stretch (60s)',
        'Deep Hip Flexor Lunge Stretch (60s each side)',
        'Standing Hamstring & Calves Fold (60s)',
        'Thoracic Spine Rotations (10 reps each side)'
      ]
    },
    {
      id: 'relaxation_evening',
      name: 'Evening Wind-Down & Parasympathetic Breathing',
      durationMinutes: 10,
      exercises: [
        'Child’s Pose with Deep Diaphragmatic Breath (2 mins)',
        'Legs-Up-The-Wall (Viparita Karani) (4 mins)',
        '4-7-8 Relaxing Breath Cycles (4 mins)'
      ]
    }
  ];

  const handleStartStretching = (routine) => {
    setActiveRoutine(routine);
    setRoutineTimer(routine.durationMinutes * 60);
    setRoutineRunning(true);
    success(`Started ${routine.name}`, 'Recovery Routine');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Moon className="w-7 h-7 text-indigo-400" />
            Sleep & Recovery Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Optimize restorative deep sleep, monitor muscle recovery heatmaps, and practice guided mobility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            🌙 Target: 8.0 hrs restorative sleep
          </span>
        </div>
      </div>

      {/* Top Banner: AI Recovery Recommendation */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-850 via-indigo-950/30 to-navy-850 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AI Recovery Status</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Upper Body Ready for Next Hypertrophy Session
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Your resting heart rate trends and 7.5 hours of sleep indicate sufficient neuromuscular recovery. 
            Chest and deltoids will reach peak readiness in ~18 hours.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-700/80 text-center shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Readiness</span>
          <span className="text-3xl font-black text-brand-neon">92%</span>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">High Performance</span>
        </div>
      </div>

      {/* Muscle Group Recovery Breakdown (Heatmap simulation) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand-neon" />
            <h3 className="text-base font-extrabold text-white">Muscle Group Recovery Heatmap</h3>
          </div>
          <span className="text-xs text-slate-400">Post-Workout Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {muscleRecovery.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white">{item.muscle}</span>
                <span className={item.color}>{item.percentage}%</span>
              </div>

              <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.percentage === 100 ? 'bg-brand-neon' : 'bg-amber-400'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.status}</span>
                <span>{item.hoursLeft > 0 ? `~${item.hoursLeft}h to 100%` : 'Ready'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guided Stretching & Relaxation Routines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {routines.map(routine => (
          <div key={routine.id} className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  Guided Routine
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {routine.durationMinutes} mins
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white mt-3">{routine.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Enhance blood flow and relieve tight connective fascia.</p>

              <div className="mt-4 space-y-2">
                {routine.exercises.map((ex, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleStartStretching(routine)}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Guided Routine
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-400">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          FitLife AI sleep and recovery metrics are intended for athletic tracking and lifestyle optimization. They do not claim to diagnose sleep apnea, insomnia, or other medical sleep disorders. Consult a certified medical specialist for sleep pathology concerns.
        </p>
      </div>

    </div>
  );
}
