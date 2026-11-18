import React, { useState, useEffect } from 'react';
import { 
  Utensils, Plus, Droplets, Sparkles, Flame, Apple, Search, 
  Trash2, ChevronRight, Check, Heart, Info, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export function NutritionView({ onOpenQuickLog }) {
  const { user } = useAuth();
  const { formatWater } = useTheme();
  const { success, error } = useNotification();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealsData, setMealsData] = useState({ meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } });
  const [waterData, setWaterData] = useState({ waterMl: 0, goalMl: 3000 });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutrition();
  }, [date, user]);

  const loadNutrition = async () => {
    try {
      setLoading(true);
      const [mRes, wRes, rRes] = await Promise.all([
        api.nutrition.getMeals(date),
        api.nutrition.getWater(date),
        api.nutrition.getRecommendations()
      ]);
      setMealsData(mRes || { meals: [], totals: { calories: 0, protein: 0 } });
      setWaterData(wRes || { waterMl: 0, goalMl: 3000 });
      setRecommendations(rRes || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWater = async (amount) => {
    try {
      const res = await api.nutrition.updateWater(amount, date);
      setWaterData(res);
      success(`Added ${amount}ml of water!`, 'Hydrated');
    } catch (err) {
      error(err.message, 'Failed to update water');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.nutrition.deleteMeal(id);
      success('Meal item deleted', 'Removed');
      loadNutrition();
    } catch (err) {
      error(err.message, 'Failed to delete');
    }
  };

  // Goals
  const calorieGoal = user?.dailyCalorieGoal || 2000;
  const proteinGoal = user?.dailyProteinGoal || 120;
  const carbsGoal = user?.dailyCarbsGoal || 220;
  const fatGoal = user?.dailyFatGoal || 55;

  const currentCalories = mealsData.totals.calories;
  const currentProtein = mealsData.totals.protein;
  const currentCarbs = mealsData.totals.carbs;
  const currentFat = mealsData.totals.fat;
  const currentFiber = mealsData.totals.fiber || 0;

  const calPct = Math.min(100, Math.round((currentCalories / calorieGoal) * 100));
  const protPct = Math.min(100, Math.round((currentProtein / proteinGoal) * 100));
  const carbsPct = Math.min(100, Math.round((currentCarbs / carbsGoal) * 100));
  const fatPct = Math.min(100, Math.round((currentFat / fatGoal) * 100));

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-brand-neon" />
            AI Nutrition & Diet Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Indian & international food database, automated macro partitioning, and personalized meal recommendations.
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
            onClick={() => onOpenQuickLog('food')}
            className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-neon-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Meal Item
          </button>
        </div>
      </div>

      {/* Daily Nutritional Goals & Progress Cards */}
      <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-6">
        
        {/* Calorie Progress Gauge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Daily Calorie Target
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white">{currentCalories}</span>
              <span className="text-sm font-semibold text-slate-400">/ {calorieGoal} kcal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Remaining: <strong className="text-brand-neon">{Math.max(0, calorieGoal - currentCalories)} kcal</strong> for today
            </p>
          </div>

          <div className="w-full md:w-96">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>Progress</span>
              <span className="text-brand-neon font-bold">{calPct}%</span>
            </div>
            <div className="h-3 w-full bg-navy-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-brand-neon transition-all duration-500 rounded-full shadow-neon-sm"
                style={{ width: `${calPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Macronutrient Partitioning Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Protein */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">Protein (g)</span>
              <span className="text-slate-400">{protPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white">{currentProtein}</span>
              <span className="text-xs text-slate-400">/ {proteinGoal}g</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${protPct}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-sky-400">Carbohydrates (g)</span>
              <span className="text-slate-400">{carbsPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white">{currentCarbs}</span>
              <span className="text-xs text-slate-400">/ {carbsGoal}g</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          {/* Fats */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-orange-400">Healthy Fats (g)</span>
              <span className="text-slate-400">{fatPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white">{currentFat}</span>
              <span className="text-xs text-slate-400">/ {fatGoal}g</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${fatPct}%` }} />
            </div>
          </div>

          {/* Dietary Fiber */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-teal-400">Dietary Fiber (g)</span>
              <span className="text-slate-400">Digestive Health</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white">{currentFiber}</span>
              <span className="text-xs text-slate-400">/ 30g Target</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (currentFiber / 30) * 100)}%` }} />
            </div>
          </div>

        </div>

      </div>

      {/* Water Intake Tracker Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-navy-850 to-blue-950/40 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">Daily Hydration Tracker</h3>
          </div>
          <p className="text-xs text-slate-400">
            Water intake fuels muscle glycolysis, reduces joint friction, and prevents sluggish cognitive fatigue.
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-cyan-400">{formatWater(waterData.waterMl)}</span>
            <span className="text-xs text-slate-400">/ Goal: {formatWater(waterData.goalMl)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickWater(250)}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-cyan-500/30 text-xs font-bold text-cyan-400 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            +250ml Glass
          </button>
          <button
            onClick={() => handleQuickWater(500)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            +500ml Bottle
          </button>
        </div>
      </div>

      {/* Meals Sections (Breakfast, Lunch, Dinner, Snacks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mealTypes.map(mType => {
          const typeMeals = mealsData.meals.filter(m => m.mealType === mType);
          const typeCalories = typeMeals.reduce((s, m) => s + (m.calories || 0), 0);
          const typeProtein = typeMeals.reduce((s, m) => s + (m.protein || 0), 0);

          return (
            <div key={mType} className="rounded-3xl bg-navy-850 border border-slate-700/80 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-neon" />
                    <h3 className="text-sm font-bold text-white capitalize">{mType}</h3>
                  </div>

                  <span className="text-xs font-bold text-brand-neon">
                    {typeCalories} kcal <span className="text-slate-400 font-normal">({Math.round(typeProtein * 10) / 10}g P)</span>
                  </span>
                </div>

                <div className="mt-3 divide-y divide-slate-800 min-h-24">
                  {typeMeals.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">No items logged for {mType}.</p>
                  ) : (
                    typeMeals.map(item => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs group">
                        <div>
                          <span className="font-bold text-white block">{item.foodName}</span>
                          <span className="text-[11px] text-slate-400">
                            {item.servings} × {item.servingUnit} • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">{item.calories} kcal</span>
                          <button
                            onClick={() => handleDeleteMeal(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete food entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onOpenQuickLog(mType)}
                  className="text-xs font-bold text-brand-neon hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Add to {mType.toUpperCase()}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Personalized Meal Recommendations Section */}
      {recommendations && (
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-neon" />
              <h3 className="text-base font-extrabold text-white">AI-Recommended Daily Meal Blueprint</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-neon/15 text-brand-neon border border-brand-neon/30">
              {recommendations.dietaryPreference} • {recommendations.goal}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.meals.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-neon uppercase tracking-wider block">
                    {rec.mealType}
                  </span>
                  <h4 className="text-xs font-extrabold text-white mt-1">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">{rec.calories} kcal</span>
                  <span className="font-bold text-emerald-400">{rec.protein}g Protein</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
