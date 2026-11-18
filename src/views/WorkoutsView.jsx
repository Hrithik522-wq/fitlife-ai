import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Play, Search, Filter, Plus, Flame, Clock, Trophy, 
  Calendar, RotateCcw, Shuffle, Sparkles, Check, ChevronRight, X, Heart
} from 'lucide-react';
import { api } from '../services/api';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export function WorkoutsView({ onNavigate }) {
  const { startWorkout } = useActiveWorkout();
  const { formatWeight } = useTheme();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('routines'); // 'routines', 'library', 'history', 'prs'
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Selected exercise for detailed modal view
  const [detailExercise, setDetailExercise] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fitlife_fav_exercises') || '[]');
    } catch {
      return [];
    }
  });

  // Custom Workout Creation Modal State
  const [showCreateRoutineModal, setShowCreateRoutineModal] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Hypertrophy');
  const [newRoutineMinutes, setNewRoutineMinutes] = useState(45);
  const [newRoutineExercises, setNewRoutineExercises] = useState([]);

  const categories = [
    'All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 
    'Abs', 'Full body', 'Cardio', 'HIIT', 'Yoga', 'Stretching'
  ];

  useEffect(() => {
    loadAllWorkoutData();
  }, [selectedCategory, difficultyFilter, equipmentFilter]);

  const loadAllWorkoutData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (difficultyFilter !== 'All') params.difficulty = difficultyFilter;
      if (equipmentFilter !== 'All') params.equipment = equipmentFilter;
      if (search) params.search = search;

      const [rRes, eRes, lRes, pRes] = await Promise.all([
        api.workouts.getRoutines(),
        api.workouts.getExercises(params),
        api.workouts.getLogs(),
        api.workouts.getRecords()
      ]);

      setRoutines(rRes || []);
      setExercises(eRes || []);
      setLogs(lRes || []);
      setPrs(pRes || []);
    } catch (err) {
      console.error('Error fetching workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (exerciseId, e) => {
    e.stopPropagation();
    const updated = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];
    setFavorites(updated);
    localStorage.setItem('fitlife_fav_exercises', JSON.stringify(updated));
  };

  const handleAddExerciseToNewRoutine = (ex) => {
    if (!newRoutineExercises.some(item => item.exerciseId === ex.id)) {
      setNewRoutineExercises(prev => [
        ...prev,
        { exerciseId: ex.id, exerciseName: ex.name, sets: 3, targetReps: '10-12', restSeconds: 60 }
      ]);
    }
  };

  const handleCreateRoutineSubmit = async (e) => {
    e.preventDefault();
    if (!newRoutineName || newRoutineExercises.length === 0) {
      error('Please specify a routine name and add at least one exercise', 'Validation');
      return;
    }
    try {
      await api.workouts.createRoutine({
        name: newRoutineName,
        category: newRoutineCategory,
        estimatedMinutes: newRoutineMinutes,
        exercises: newRoutineExercises
      });
      success('Custom workout routine saved!', 'Routine Created');
      setShowCreateRoutineModal(false);
      setNewRoutineName('');
      setNewRoutineExercises([]);
      loadAllWorkoutData();
    } catch (err) {
      error(err.message, 'Failed to create routine');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Dumbbell className="w-7 h-7 text-brand-neon" />
            Workout Management System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized routines, interactive exercise library with form cues, and real-time workout tracker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateRoutineModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-neon-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Custom Routine
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'routines', label: 'Workout Routines & Splits' },
          { id: 'library', label: 'Exercise Library' },
          { id: 'history', label: 'Workout History' },
          { id: 'prs', label: 'Personal Records (PRs)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
                : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ROUTINES */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routines.map(routine => (
              <div 
                key={routine.id}
                className="rounded-3xl bg-navy-850 border border-slate-700/80 p-5 flex flex-col justify-between hover:border-brand-neon/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-neon/15 text-brand-neon border border-brand-neon/30 uppercase">
                      {routine.category}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {routine.estimatedMinutes}m
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white mt-3 group-hover:text-brand-neon transition-colors">
                    {routine.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Burn estimate: <strong className="text-orange-400">~{routine.caloriesBurnEstimate} kcal</strong> • Level: {routine.difficulty}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {routine.exercises.slice(0, 4).map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-navy-900 border border-slate-800">
                        <span className="text-slate-300 font-medium truncate">
                          {ex.exerciseId.replace('ex_', '').replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {ex.sets} sets × {ex.targetReps}
                        </span>
                      </div>
                    ))}
                    {routine.exercises.length > 4 && (
                      <span className="text-[10px] text-slate-500 block text-center">
                        +{routine.exercises.length - 4} more exercises
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {routine.exercises.length} Exercises Total
                  </span>

                  <button
                    onClick={() => startWorkout(routine)}
                    className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs flex items-center gap-1.5 shadow-neon-sm active:scale-95 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-navy-950" />
                    Start Routine
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
                    : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Difficulty Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAllWorkoutData()}
                placeholder="Search exercises by name, muscle group, or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-850 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-navy-850 border border-slate-700 text-xs text-slate-300 focus:border-brand-neon"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-navy-850 border border-slate-700 text-xs text-slate-300 focus:border-brand-neon"
              >
                <option value="All">All Equipment</option>
                <option value="Barbell">Barbell</option>
                <option value="Dumbbells">Dumbbells</option>
                <option value="Cable">Cable</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Yoga Mat">Yoga Mat</option>
              </select>
            </div>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map(ex => {
              const isFav = favorites.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => setDetailExercise(ex)}
                  className="rounded-2xl bg-navy-850 border border-slate-700/80 overflow-hidden cursor-pointer hover:border-brand-neon/50 transition-all flex flex-col justify-between group"
                >
                  <div className="h-44 w-full bg-navy-900 relative overflow-hidden">
                    <img
                      src={ex.demonstrationUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-brand-neon uppercase">
                        {ex.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(ex.id, e)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                        isFav ? 'bg-red-500/80 text-white' : 'bg-black/50 text-slate-300 hover:text-red-400'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-brand-neon transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Primary: <strong className="text-slate-200">{ex.muscleGroup}</strong> • Equipment: {ex.equipment}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-semibold">{ex.difficulty}</span>
                      <span className="text-brand-neon font-semibold flex items-center gap-1">
                        Instructions →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-navy-850 border border-slate-700/80 p-5">
            <h3 className="text-base font-extrabold text-white mb-4">Completed Workout Sessions</h3>
            
            <div className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No workout logs recorded yet. Start a routine to begin!</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-brand-neon uppercase tracking-wider block">
                        {log.date}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{log.routineName}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Duration: <strong>{log.durationMinutes} mins</strong> • Calories Burned: ~<strong>{log.caloriesBurned} kcal</strong>
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-slate-300 italic mt-1">"{log.notes}"</p>
                      )}
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ✓ Completed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERSONAL RECORDS */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-navy-850 border border-slate-700/80 p-5">
            <h3 className="text-base font-extrabold text-white mb-1">Personal Fitness Records</h3>
            <p className="text-xs text-slate-400 mb-4">All-time maximum lifts and personal bests logged in FitLife AI.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prs.map(pr => (
                <div key={pr.exerciseId} className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">{pr.exerciseName}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-brand-neon">
                      {formatWeight(pr.maxWeight)}
                    </span>
                    <span className="text-xs text-slate-400">for {pr.maxReps} reps</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Achieved on {pr.bestDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {detailExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl overflow-hidden">
            <div className="relative h-60 w-full bg-navy-950 shrink-0">
              <img
                src={detailExercise.demonstrationUrl}
                alt={detailExercise.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailExercise(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-0.5 rounded bg-brand-neon text-navy-950 text-xs font-black uppercase">
                  {detailExercise.category}
                </span>
                <h3 className="text-2xl font-black text-white mt-1 drop-shadow-md">
                  {detailExercise.name}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-navy-850 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Primary Muscle</span>
                  <span className="text-xs font-bold text-white">{detailExercise.muscleGroup}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-850 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Difficulty</span>
                  <span className="text-xs font-bold text-emerald-400">{detailExercise.difficulty}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-850 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Equipment</span>
                  <span className="text-xs font-bold text-white">{detailExercise.equipment}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Step-by-Step Instructions
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300 leading-relaxed">
                  {detailExercise.instructions.map((step, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-navy-850 border border-slate-800">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {detailExercise.tips && (
                <div className="p-3.5 rounded-xl bg-brand-neon/10 border border-brand-neon/30 text-xs text-slate-200">
                  <strong>💡 Pro Form Tip:</strong> {detailExercise.tips}
                </div>
              )}
            </div>

            <div className="p-4 bg-navy-850 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDetailExercise(null)}
                className="px-5 py-2 rounded-xl bg-brand-neon text-navy-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Routine Modal */}
      {showCreateRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl overflow-hidden">
            <div className="p-5 bg-navy-850 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Create Custom Workout Routine</h3>
              <button onClick={() => setShowCreateRoutineModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoutineSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Routine Name</label>
                <input
                  type="text"
                  required
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="e.g. Arms & Core Blast"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(e) => setNewRoutineCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                  >
                    <option value="Hypertrophy">Hypertrophy (Muscle)</option>
                    <option value="Strength">Strength</option>
                    <option value="HIIT">HIIT Shred</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Mobility">Mobility & Yoga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={newRoutineMinutes}
                    onChange={(e) => setNewRoutineMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Added Exercises ({newRoutineExercises.length})
                </label>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-navy-800 border border-slate-700 p-2">
                  {newRoutineExercises.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-4">Click exercises below to add them to this routine.</p>
                  ) : (
                    newRoutineExercises.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{item.exerciseName}</span>
                        <button
                          type="button"
                          onClick={() => setNewRoutineExercises(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:underline text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Exercises to Add:</label>
                <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                  {exercises.slice(0, 16).map(ex => (
                    <button
                      type="button"
                      key={ex.id}
                      onClick={() => handleAddExerciseToNewRoutine(ex)}
                      className="p-2 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-left text-xs font-semibold text-slate-200 hover:text-brand-neon"
                    >
                      + {ex.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-neon text-navy-950 font-black text-xs"
              >
                Save & Add Routine
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
