import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, Check, Plus, Minus, ArrowRight, ArrowLeft, 
  Flame, Clock, Dumbbell, Shuffle, Sparkles, AlertCircle 
} from 'lucide-react';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export function ActiveWorkoutModal() {
  const {
    activeRoutine,
    isModalOpen,
    workoutExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    elapsedSeconds,
    isPaused,
    togglePause,
    finishWorkout,
    cancelWorkout,
    updateSet,
    toggleSetCompleted,
    substituteExercise,
    restSecondsRemaining,
    isRestTimerActive,
    addRestTime,
    skipRest
  } = useActiveWorkout();

  const { unit, formatWeight } = useTheme();
  const [substitutes, setSubstitutes] = useState([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [notes, setNotes] = useState('');

  const currentExercise = workoutExercises[currentExerciseIndex];

  // Fetch substitutions when exercise changes
  useEffect(() => {
    if (currentExercise) {
      api.workouts.getSubstitutions(currentExercise.id)
        .then(data => setSubstitutes(data || []))
        .catch(() => {});
    }
  }, [currentExercise?.id]);

  if (!isModalOpen || !currentExercise) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const caloriesBurned = Math.round((elapsedSeconds / 60) * 7.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Top Workout Bar */}
        <div className="p-4 sm:p-5 bg-navy-850 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-neon animate-pulse" />
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {activeRoutine.name}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Exercise {currentExerciseIndex + 1} of {workoutExercises.length}
            </span>
          </div>

          {/* Stopwatch & Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800 border border-slate-700">
              <Clock className="w-4 h-4 text-brand-neon" />
              <span className="text-xs sm:text-sm font-mono font-bold text-white">
                {formatTimer(elapsedSeconds)}
              </span>
              <button
                onClick={togglePause}
                className="ml-1 text-slate-400 hover:text-white"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-brand-neon" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>~{caloriesBurned} kcal</span>
            </div>

            <button
              onClick={cancelWorkout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cancel workout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rest Timer Floating Banner */}
        {isRestTimerActive && (
          <div className="bg-gradient-to-r from-brand-neon/20 via-emerald-500/20 to-brand-neon/20 border-b border-brand-neon/40 px-4 py-2.5 flex items-center justify-between gap-4 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-neon text-navy-950 font-black text-xs flex items-center justify-center animate-pulse">
                ⏳
              </div>
              <div>
                <span className="text-xs font-bold text-white">Rest Interval Active:</span>{' '}
                <span className="text-sm font-mono font-black text-brand-neon">
                  {formatTimer(restSecondsRemaining)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addRestTime(30)}
                className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-[11px] font-semibold text-slate-200"
              >
                +30s
              </button>
              <button
                onClick={skipRest}
                className="px-2.5 py-1 rounded-lg bg-brand-neon text-navy-950 font-bold text-[11px]"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Current Exercise Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-navy-850 border border-slate-700/80 flex flex-col md:flex-row gap-5 items-center">
            <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-navy-900 border border-slate-700 shrink-0 relative group">
              <img
                src={currentExercise.demonstrationUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'}
                alt={currentExercise.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-brand-neon uppercase">
                {currentExercise.muscleGroup}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {currentExercise.name}
                </h3>
                <button
                  onClick={() => setShowSubModal(!showSubModal)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-brand-neon transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Swap Exercise
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Target: {currentExercise.targetReps} reps
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Rest: {currentExercise.restSeconds}s
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Level: {currentExercise.difficulty || 'Intermediate'}
                </span>
              </div>

              {currentExercise.tips && (
                <p className="text-xs text-slate-400 mt-2.5 italic">
                  💡 Cue: {currentExercise.tips}
                </p>
              )}
            </div>
          </div>

          {/* Exercise Substitution Modal */}
          {showSubModal && substitutes.length > 0 && (
            <div className="p-3.5 rounded-xl bg-navy-800 border border-slate-700 animate-in fade-in">
              <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-brand-neon" />
                Select Alternative Exercise:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {substitutes.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      substituteExercise(currentExerciseIndex, sub);
                      setShowSubModal(false);
                    }}
                    className="p-2.5 rounded-lg bg-navy-850 hover:bg-navy-750 border border-slate-700 text-left text-xs font-semibold text-slate-200 hover:text-brand-neon transition-colors"
                  >
                    {sub.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{sub.equipment} • {sub.muscleGroup}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sets Tracking Table */}
          <div className="rounded-2xl bg-navy-850 border border-slate-700/80 overflow-hidden">
            <div className="px-4 py-3 bg-navy-800/80 border-b border-slate-700 grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              <span className="col-span-2 text-left">Set</span>
              <span className="col-span-4">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</span>
              <span className="col-span-4">Reps</span>
              <span className="col-span-2">Done</span>
            </div>

            <div className="divide-y divide-slate-800 p-2 space-y-1">
              {currentExercise.sets.map((set, sIdx) => (
                <div
                  key={sIdx}
                  className={`grid grid-cols-12 items-center p-2 rounded-xl transition-colors ${
                    set.completed ? 'bg-brand-neon/10 border border-brand-neon/30' : 'hover:bg-navy-800'
                  }`}
                >
                  <span className="col-span-2 text-xs font-bold text-white pl-2">
                    Set {set.setNumber}
                  </span>

                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <input
                      type="number"
                      step="2.5"
                      min="0"
                      value={set.weight}
                      onChange={(e) => updateSet(currentExerciseIndex, sIdx, 'weight', Number(e.target.value))}
                      className="w-16 sm:w-20 py-1 px-2 rounded-lg bg-navy-900 border border-slate-700 text-center text-xs font-bold text-white focus:border-brand-neon"
                    />
                  </div>

                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={set.reps}
                      onChange={(e) => updateSet(currentExerciseIndex, sIdx, 'reps', Number(e.target.value))}
                      className="w-16 sm:w-20 py-1 px-2 rounded-lg bg-navy-900 border border-slate-700 text-center text-xs font-bold text-white focus:border-brand-neon"
                    />
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSetCompleted(currentExerciseIndex, sIdx)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-brand-neon text-navy-950 font-black shadow-neon-sm scale-110'
                          : 'border-2 border-slate-600 hover:border-brand-neon text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Workout Notes & Personal Observations
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Increased bench weight by 2.5kg, shoulders felt stable..."
              className="w-full p-3 rounded-xl bg-navy-850 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
            />
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-navy-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={currentExerciseIndex === 0}
              onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Exercise</span>
            </button>

            <button
              disabled={currentExerciseIndex === workoutExercises.length - 1}
              onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Next Exercise</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => finishWorkout(notes)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-neon to-emerald-400 text-navy-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-neon transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Finish & Log Workout
          </button>
        </div>

      </div>
    </div>
  );
}
