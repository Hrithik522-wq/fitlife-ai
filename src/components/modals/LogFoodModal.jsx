import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Utensils, Sparkles, Camera, Check, 
  Flame, Filter, Info, Upload
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export function LogFoodModal({ isOpen, onClose, defaultMealType = 'lunch', onMealLogged }) {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'custom', 'ai'
  const [mealType, setMealType] = useState(defaultMealType);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dietFilter, setDietFilter] = useState('All');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected food for logging
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customDiet, setCustomDiet] = useState('Vegetarian');
  const [customUnit, setCustomUnit] = useState('1 serving (100g)');

  // AI Meal recognition fields
  const [aiQuery, setAiQuery] = useState('');
  const [aiImage, setAiImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { success, error } = useNotification();
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadFoods();
      setSelectedFood(null);
      setServings(1);
      setMealType(defaultMealType);
    }
  }, [isOpen, categoryFilter, dietFilter, defaultMealType]);

  const loadFoods = async (query = '') => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (dietFilter !== 'All') params.dietType = dietFilter;

      const data = await api.nutrition.getFoods(params);
      setFoods(data || []);
      if (!selectedFood && data.length > 0) {
        setSelectedFood(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFoods(search);
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    try {
      const payload = {
        mealType,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        servings: Number(servings) || 1,
        servingUnit: selectedFood.servingUnit,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        date: new Date().toISOString().split('T')[0]
      };

      await api.nutrition.logMeal(payload);
      success(`Logged ${selectedFood.name} to ${mealType.toUpperCase()}!`, 'Meal Logged');
      refreshUser();
      if (onMealLogged) onMealLogged();
      onClose();
    } catch (err) {
      error(err.message, 'Failed to log food');
    }
  };

  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    try {
      const newFood = await api.nutrition.createFood({
        name: customName,
        calories: Number(customCalories),
        protein: Number(customProtein) || 0,
        carbs: Number(customCarbs) || 0,
        fat: Number(customFat) || 0,
        fiber: Number(customFiber) || 0,
        dietType: customDiet,
        servingUnit: customUnit
      });

      setSelectedFood(newFood);
      success('Custom food item created!', 'Success');
      setActiveTab('search');
      loadFoods();
    } catch (err) {
      error(err.message, 'Failed to create food');
    }
  };

  const handleAiAnalyze = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const formData = new FormData();
      if (aiQuery) formData.append('query', aiQuery);
      if (aiImage) formData.append('foodImage', aiImage);

      const res = await api.nutrition.analyzeFood(formData);
      setAiResult(res);
      success('Meal parsed successfully!', 'AI Breakdown Ready');
    } catch (err) {
      error(err.message, 'Analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogAiResult = async () => {
    if (!aiResult) return;
    try {
      const payload = {
        mealType,
        foodName: aiResult.query || 'AI Analyzed Meal',
        servings: 1,
        servingUnit: '1 portion',
        calories: aiResult.estimatedCalories,
        protein: aiResult.estimatedProtein,
        carbs: aiResult.estimatedCarbs,
        fat: aiResult.estimatedFat,
        fiber: aiResult.estimatedFiber,
        date: new Date().toISOString().split('T')[0]
      };

      await api.nutrition.logMeal(payload);
      success('AI analyzed meal logged!', 'Success');
      refreshUser();
      if (onMealLogged) onMealLogged();
      onClose();
    } catch (err) {
      error(err.message, 'Failed to log');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-neon/15 border border-brand-neon/30 text-brand-neon flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Log Nutrition & Foods</h2>
              <span className="text-[11px] text-slate-400">Search 150+ Indian & Global items, or analyze with AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selector & Tabs */}
        <div className="px-5 pt-3 bg-navy-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Meal Type Radio Chips */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900 border border-slate-700/60">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  mealType === type
                    ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Food Database
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1 transition-colors ${
                activeTab === 'ai'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Recognition
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-brand-neon text-brand-neon'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              + Custom Food
            </button>
          </div>
        </div>

        {/* Tab 1: Food Search Database */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Search Input & Filters */}
            <div className="space-y-2.5">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search roti, dal tadka, paneer, oats, chicken..."
                  className="w-full pl-10 pr-20 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 rounded-lg bg-navy-750 hover:bg-navy-700 text-xs font-semibold text-brand-neon"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={dietFilter}
                  onChange={(e) => setDietFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-800 border border-slate-700 text-xs text-slate-300 focus:border-brand-neon"
                >
                  <option value="All">All Diets</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>

                <div className="flex flex-wrap gap-1">
                  {['Roti', 'Paneer', 'Dal', 'Rice', 'Curd', 'Eggs', 'Chicken'].map(chip => (
                    <button
                      key={chip}
                      onClick={() => { setSearch(chip); loadFoods(chip); }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy-800 border border-slate-700 text-slate-400 hover:text-brand-neon hover:border-brand-neon"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 rounded-2xl bg-navy-850 border border-slate-700/80">
              {foods.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">No foods found. Try adjusting your search.</p>
              ) : (
                foods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      selectedFood?.id === food.id
                        ? 'bg-brand-neon/15 border-l-4 border-brand-neon'
                        : 'hover:bg-navy-800'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {food.name}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          food.dietType === 'Non-Vegetarian' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {food.dietType}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Serving: {food.servingUnit} • {food.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-neon">{food.calories} kcal</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Portion Adjuster & Log CTA */}
            {selectedFood && (
              <div className="p-4 rounded-2xl bg-navy-800 border border-brand-neon/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white">Adjust Portion / Servings:</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-center text-xs font-bold text-white"
                    />
                    <span className="text-xs text-slate-300">× {selectedFood.servingUnit}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculated: <strong className="text-brand-neon">{Math.round(selectedFood.calories * servings)} kcal</strong> | 
                    Protein: <strong>{Math.round(selectedFood.protein * servings * 10) / 10}g</strong>
                  </p>
                </div>

                <button
                  onClick={handleLogFood}
                  className="px-5 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-2 shadow-neon-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add to {mealType.toUpperCase()}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: AI Food Recognition */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-neon/10 to-blue-500/10 border border-brand-neon/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand-neon shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Smart AI Meal Recognition</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Describe what you ate in natural language (e.g. <em>"2 rotis with yellow dal tadka and 100g fresh paneer"</em>) or upload a photo of your meal. Our AI parses and breaks down macronutrients instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handleAiAnalyze} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Meal Description</label>
                <textarea
                  rows="3"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. 2 whole wheat rotis, a bowl of dal tadka, and 100g raw paneer"
                  className="w-full p-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Optional Meal Photo</label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-800 border border-dashed border-slate-700 hover:border-brand-neon cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                  <Camera className="w-4 h-4 text-brand-neon" />
                  <span>{aiImage ? aiImage.name : 'Upload meal snapshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAiImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={aiLoading || (!aiQuery && !aiImage)}
                className="w-full py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-neon-sm disabled:opacity-50"
              >
                {aiLoading ? 'Analyzing Nutritional Composition...' : 'Analyze Meal with FitLife AI'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            {/* AI Results Card */}
            {aiResult && (
              <div className="p-4 rounded-2xl bg-navy-850 border border-brand-neon/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-brand-neon" />
                    AI Caloric & Macro Breakdown
                  </h4>
                  <span className="text-xs font-black text-brand-neon">
                    ~{aiResult.estimatedCalories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-navy-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <span className="text-xs font-bold text-emerald-400">{aiResult.estimatedProtein}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-navy-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Carbs</span>
                    <span className="text-xs font-bold text-sky-400">{aiResult.estimatedCarbs}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-navy-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Fats</span>
                    <span className="text-xs font-bold text-orange-400">{aiResult.estimatedFat}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-navy-900 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Fiber</span>
                    <span className="text-xs font-bold text-teal-400">{aiResult.estimatedFiber}g</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 italic">
                  💡 {aiResult.advice}
                </p>

                <button
                  onClick={handleLogAiResult}
                  className="w-full py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs"
                >
                  Confirm & Log to {mealType.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom Food Creator */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCreateCustomFood} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Food / Dish Name</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Homemade Sattu Protein Drink"
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Serving Unit</label>
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="1 glass (250ml)"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Diet Type</label>
                <select
                  value={customDiet}
                  onChange={(e) => setCustomDiet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="220"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="16"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="25"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fats (g)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="4"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs"
            >
              Save Custom Food Item
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
