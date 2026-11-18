import React, { useState, useEffect } from 'react';
import { 
  Flame, Droplets, Footprints, Clock, Scale, Dumbbell, Utensils, 
  Sparkles, Trophy, ArrowUpRight, Plus, CheckCircle2, ChevronRight,
  TrendingUp, Award, HeartPulse, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { api } from '../services/api';

export function DashboardView({ onNavigate, onOpenQuickLog }) {
  const { user } = useAuth();
  const { formatWeight, formatWater, unit } = useTheme();
  const { startWorkout } = useActiveWorkout();

  const [todayMeals, setTodayMeals] = useState({ meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
  const [waterData, setWaterData] = useState({ waterMl: 0, goalMl: 3000 });
  const [habitData, setHabitData] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [mRes, wRes, hRes, lRes, rRes, aRes] = await Promise.all([
          api.nutrition.getMeals(todayStr),
          api.nutrition.getWater(todayStr),
          api.habits.getHabits(todayStr),
          api.workouts.getLogs(),
          api.workouts.getRoutines(),
          api.reports.getAnalytics()
        ]);

        setTodayMeals(mRes || { meals: [], totals: { calories: 0, protein: 0 } });
        setWaterData(wRes || { waterMl: 0, goalMl: 3000 });
        setHabitData(hRes || null);
        setWorkoutLogs(lRes || []);
        setRoutines(rRes || []);
        setAnalytics(aRes || null);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  // Calculations
  const dailyCalorieGoal = user?.dailyCalorieGoal || 2000;
  const caloriesConsumed = todayMeals.totals?.calories || 0;
  const todayWorkout = workoutLogs.find(w => w.date === todayStr);
  const caloriesBurned = todayWorkout ? todayWorkout.caloriesBurned : (workoutLogs[0]?.caloriesBurned || 320);
  const activeWorkoutDuration = todayWorkout ? todayWorkout.durationMinutes : 48;
  const steps = habitData?.steps || 8420;
  const stepGoal = user?.dailyStepGoal || 10000;
  const waterMl = waterData.waterMl || 2250;
  const waterGoal = waterData.goalMl || 3000;
  const wellnessScore = habitData?.wellnessScore || 88;

  // Next workout
  const todaysRoutine = routines[0] || {
    id: 'routine_push',
    name: 'Push Day – Chest, Shoulders & Triceps',
    category: 'Hypertrophy',
    estimatedMinutes: 50,
    caloriesBurnEstimate: 340,
    exercises: [
      { exerciseId: 'ex_bench_press', sets: 4, targetReps: '8-10' },
      { exerciseId: 'ex_incline_db_press', sets: 3, targetReps: '10-12' },
      { exerciseId: 'ex_overhead_press', sets: 3, targetReps: '8-10' }
    ]
  };

  const handleQuickWaterAdd = async (amount) => {
    try {
      const res = await api.nutrition.updateWater(amount, todayStr);
      setWaterData(res);
    } catch (err) {}
  };

  const caloriePercentage = Math.min(100, Math.round((caloriesConsumed / dailyCalorieGoal) * 100));
  const waterPercentage = Math.min(100, Math.round((waterMl / waterGoal) * 100));
  const stepPercentage = Math.min(100, Math.round((steps / stepGoal) * 100));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-850 via-navy-800 to-navy-850 border border-slate-700/80 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/15 border border-brand-neon/30 text-brand-neon text-xs font-bold uppercase tracking-wider shadow-neon-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Health Intelligence Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Good day, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon via-emerald-300 to-teal-200">{user?.name || 'Athlete'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your recovery score is optimal today. Consistency builds greatness—let's hit your <strong>{user?.fitnessGoal || 'Body Recomposition'}</strong> milestone!
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => startWorkout(todaysRoutine)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-neon to-emerald-400 hover:from-brand-hover hover:to-emerald-500 text-navy-950 font-black text-xs flex items-center gap-2 shadow-neon transition-transform active:scale-95"
            >
              <Dumbbell className="w-4 h-4" />
              Start Today's Workout
            </button>
            <button
              onClick={() => onOpenQuickLog('food')}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-emerald-400" />
              Log Meal
            </button>
            <button
              onClick={() => onNavigate('ai-coach')}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-brand-neon/40 text-xs font-bold text-brand-neon transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Coach
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-neon/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Visual Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700/80 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Calories Consumed
            </span>
            <span className="text-orange-400 font-bold">{caloriePercentage}%</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{caloriesConsumed}</span>
            <span className="text-xs text-slate-400 font-medium">/ {dailyCalorieGoal} kcal</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full bg-navy-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Burned: ~{caloriesBurned} kcal</span>
            <span className="text-emerald-400 font-medium">
              Net: {Math.max(0, caloriesConsumed - caloriesBurned)} kcal
            </span>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700/80 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Hydration Intake
            </span>
            <span className="text-cyan-400 font-bold">{waterPercentage}%</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{formatWater(waterMl)}</span>
            <span className="text-xs text-slate-400 font-medium">/ {formatWater(waterGoal)}</span>
          </div>

          <div className="mt-3 h-2 w-full bg-navy-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${waterPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <button
              onClick={() => handleQuickWaterAdd(250)}
              className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => handleQuickWaterAdd(500)}
              className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              +500ml Bottle
            </button>
          </div>
        </div>

        {/* Daily Steps Card */}
        <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700/80 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" />
              Daily Steps
            </span>
            <span className="text-emerald-400 font-bold">{stepPercentage}%</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{steps.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">/ {stepGoal.toLocaleString()}</span>
          </div>

          <div className="mt-3 h-2 w-full bg-navy-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-brand-neon transition-all duration-500 rounded-full"
              style={{ width: `${stepPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Distance: ~{(steps * 0.00078).toFixed(1)} km</span>
            <span className="text-brand-neon font-medium">
              {Math.max(0, stepGoal - steps)} left
            </span>
          </div>
        </div>

        {/* Daily Wellness Score Ring Card */}
        <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700/80 hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-brand-neon" />
              Daily Wellness Index
            </span>
            <span className="text-brand-neon font-bold">Optimal</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-neon">{wellnessScore}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 Score</span>
          </div>

          <div className="mt-3 h-2 w-full bg-navy-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-brand-neon transition-all duration-500 rounded-full shadow-neon-sm"
              style={{ width: `${wellnessScore}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Weight: <strong>{formatWeight(user?.weight || 63.5)}</strong></span>
            <span className="text-slate-300">Target: {formatWeight(user?.targetWeight || 58)}</span>
          </div>
        </div>

      </div>

      {/* Middle Row: Today's Workout & Weekly Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Workout Plan Card (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-brand-neon" />
                <h3 className="text-sm sm:text-base font-extrabold text-white">Today's Workout Plan</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-neon/15 text-brand-neon border border-brand-neon/30">
                {todaysRoutine.category}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-bold text-white">{todaysRoutine.name}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Estimated Duration: <strong>{todaysRoutine.estimatedMinutes} mins</strong> • Burn: ~<strong>{todaysRoutine.caloriesBurnEstimate} kcal</strong>
              </p>

              {/* Exercises preview list */}
              <div className="mt-3.5 space-y-2">
                {todaysRoutine.exercises.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-200">
                      {ex.exerciseId.replace('ex_', '').replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {ex.sets} sets × {ex.targetReps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('workouts')}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              View Exercise Library →
            </button>
            <button
              onClick={() => startWorkout(todaysRoutine)}
              className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-2 shadow-neon-sm"
            >
              Start Session Now
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Fitness Activity Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">Weekly Calorie Balance & Activity</h3>
            </div>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F076" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F076" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="caloriesConsumed" name="Consumed" stroke="#00F076" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCalories)" />
                <Area type="monotone" dataKey="caloriesBurned" name="Burned" stroke="#FB923C" strokeWidth={2} fillOpacity={1} fill="url(#colorBurned)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-neon" />
              <span>Calories Consumed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span>Calories Burned</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Today's Meals & Habit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Meals Card (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">Today's Meals & Macro Breakdown</h3>
            </div>
            <button
              onClick={() => onOpenQuickLog('food')}
              className="text-xs font-bold text-brand-neon hover:underline flex items-center gap-1"
            >
              + Log Food
            </button>
          </div>

          {/* Macro pills */}
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Protein</span>
              <span className="block text-base font-black text-emerald-400">{todayMeals.totals.protein}g</span>
              <span className="text-[10px] text-slate-500">Goal: {user?.dailyProteinGoal || 120}g</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</span>
              <span className="block text-base font-black text-sky-400">{todayMeals.totals.carbs}g</span>
              <span className="text-[10px] text-slate-500">Goal: {user?.dailyCarbsGoal || 220}g</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Fats</span>
              <span className="block text-base font-black text-orange-400">{todayMeals.totals.fat}g</span>
              <span className="text-[10px] text-slate-500">Goal: {user?.dailyFatGoal || 55}g</span>
            </div>
          </div>

          {/* Meals list */}
          <div className="mt-4 divide-y divide-slate-800 max-h-48 overflow-y-auto pr-1">
            {todayMeals.meals.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No meals logged yet today. Click "+ Log Food" above.</p>
            ) : (
              todayMeals.meals.map(meal => (
                <div key={meal.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{meal.foodName}</span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {meal.mealType} • {meal.servings} × {meal.servingUnit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-neon">{meal.calories} kcal</span>
                    <span className="block text-[10px] text-slate-400">P: {meal.protein}g</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Habits Checklist (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-neon" />
                <h3 className="text-sm sm:text-base font-extrabold text-white">Daily Habit Checklist</h3>
              </div>
              <span className="text-xs text-brand-neon font-bold">
                {habitData?.habits?.filter(h => h.completed).length || 3} of {habitData?.habits?.length || 5} Done
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {(habitData?.habits || [
                { id: 'h1', name: 'Drink 500ml water upon waking', completed: true },
                { id: 'h2', name: '10-minute morning meditation', completed: true },
                { id: 'h3', name: 'Hit daily protein target (120g)', completed: false },
                { id: 'h4', name: 'No phone 30 min before bed', completed: true },
                { id: 'h5', name: '10,000 steps daily walk', completed: false }
              ]).map(h => (
                <div
                  key={h.id}
                  onClick={() => api.habits.toggleHabit(h.id, todayStr).then(res => setHabitData(res))}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    h.completed
                      ? 'bg-brand-neon/10 border-brand-neon/30 text-white'
                      : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`text-xs font-semibold ${h.completed ? 'line-through text-slate-300' : ''}`}>
                    {h.name}
                  </span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    h.completed ? 'bg-brand-neon border-brand-neon text-navy-950 font-black' : 'border-slate-600'
                  }`}>
                    {h.completed && <CheckCircle2 className="w-4 h-4 fill-brand-neon text-navy-950" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => onNavigate('habits')}
              className="text-xs font-semibold text-brand-neon hover:underline"
            >
              Manage All Habits & Wellness Tracker →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
