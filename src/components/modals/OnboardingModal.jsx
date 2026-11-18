import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, Target, Compass, Dumbbell, Apple } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function OnboardingModal() {
  const { user, showOnboardingModal, setShowOnboardingModal, updateProfile } = useAuth();
  const { success } = useNotification();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    age: user?.age || 26,
    gender: user?.gender || 'Female',
    height: user?.height || 168,
    weight: user?.weight || 64,
    targetWeight: user?.targetWeight || 60,
    fitnessGoal: user?.fitnessGoal || 'Weight loss',
    fitnessLevel: user?.fitnessLevel || 'Intermediate',
    location: user?.location || 'Home',
    equipment: user?.equipment || ['Dumbbells', 'Yoga Mat'],
    weeklyAvailability: user?.weeklyAvailability || 4,
    dietaryPreference: user?.dietaryPreference || 'Vegetarian'
  });

  if (!showOnboardingModal) return null;

  const goals = [
    { id: 'Weight loss', label: 'Weight Loss', desc: 'Shed body fat sustainably while maintaining lean muscle' },
    { id: 'Muscle gain', label: 'Muscle Gain', desc: 'Build lean mass, size, and athletic symmetry' },
    { id: 'Body recomposition', label: 'Body Recomposition', desc: 'Burn fat and build muscle simultaneously' },
    { id: 'General fitness', label: 'General Fitness', desc: 'Elevate daily energy, stamina, and overall vitality' },
    { id: 'Strength building', label: 'Strength Building', desc: 'Maximize raw neural force and 1-rep maximums' },
    { id: 'Endurance improvement', label: 'Endurance Improvement', desc: 'Enhance aerobic capacity and stamina' }
  ];

  const equipmentOptions = [
    'Bodyweight only',
    'Dumbbells',
    'Barbells',
    'Resistance bands',
    'Kettlebell',
    'Pull-Up Bar',
    'Full Gym (Machines & Cables)',
    'Yoga Mat'
  ];

  const handleEquipmentToggle = (item) => {
    setFormData(prev => {
      const exists = prev.equipment.includes(item);
      const updated = exists ? prev.equipment.filter(e => e !== item) : [...prev.equipment, item];
      return { ...prev, equipment: updated };
    });
  };

  const handleFinish = async () => {
    try {
      await updateProfile(formData);
      success('Your personalized fitness profile is ready! Welcome aboard.', 'Setup Complete');
      setShowOnboardingModal(false);
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-navy-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-brand-neon">FitLife AI Assessment</span>
          </div>
          <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-neon transition-all duration-300 shadow-neon-sm" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Body Metrics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-neon" />
                Physical Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We use these baseline measurements to calculate your basal metabolic rate (BMR) and daily caloric targets.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Biological Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Primary Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-neon" />
                Select Your Primary Fitness Goal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your AI coach tailors exercise volume, rest intervals, and macronutrient targets to this objective.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {goals.map(g => (
                <div
                  key={g.id}
                  onClick={() => setFormData({ ...formData, fitnessGoal: g.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.fitnessGoal === g.id
                      ? 'bg-brand-neon/15 border-brand-neon text-white shadow-neon-sm'
                      : 'bg-navy-800 border-slate-700/80 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{g.label}</span>
                    {formData.fitnessGoal === g.id && <Check className="w-4 h-4 text-brand-neon" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Experience & Equipment */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-brand-neon" />
                Experience & Equipment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tell us where you train and what tools you have so workouts fit your lifestyle.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Workout Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setFormData({ ...formData, fitnessLevel: lvl })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        formData.fitnessLevel === lvl
                          ? 'bg-brand-neon text-navy-950 border-brand-neon shadow-neon-sm'
                          : 'bg-navy-800 text-slate-300 border-slate-700 hover:bg-navy-750'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Location</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Gym', 'Outdoor'].map(loc => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setFormData({ ...formData, location: loc })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        formData.location === loc
                          ? 'bg-brand-neon text-navy-950 border-brand-neon shadow-neon-sm'
                          : 'bg-navy-800 text-slate-300 border-slate-700 hover:bg-navy-750'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Available Equipment</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {equipmentOptions.map(eq => {
                    const isSelected = formData.equipment.includes(eq);
                    return (
                      <button
                        type="button"
                        key={eq}
                        onClick={() => handleEquipmentToggle(eq)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-brand-neon/20 border-brand-neon text-brand-neon'
                            : 'bg-navy-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {eq} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule & Nutrition */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Apple className="w-5 h-5 text-brand-neon" />
                Schedule & Nutrition Preferences
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                We'll design your meal blueprints and training recovery frequency around these habits.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Weekly Workout Availability: <span className="text-brand-neon font-bold">{formData.weeklyAvailability} Days / week</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={formData.weeklyAvailability}
                  onChange={(e) => setFormData({ ...formData, weeklyAvailability: Number(e.target.value) })}
                  className="w-full accent-brand-neon cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>2 Days (Express)</span>
                  <span>4 Days (Balanced)</span>
                  <span>6 Days (Intense)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dietary Preference</label>
                <select
                  value={formData.dietaryPreference}
                  onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Vegetarian">Vegetarian (Indian / Global Veg)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian (Poultry, Fish, Meat)</option>
                  <option value="Vegan">Vegan (100% Plant-Based)</option>
                  <option value="Eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                  <option value="Keto">Ketogenic (High-Fat / Very Low-Carb)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-navy-850 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-neon shrink-0 mt-0.5" />
                <span>
                  FitLife AI will calculate your personalized macro targets: <strong>~{user?.dailyCalorieGoal || 2000} kcal</strong>, 
                  with ~<strong>{Math.round((formData.weight || 70) * 1.8)}g protein</strong> daily to ensure muscle recovery!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 font-semibold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs transition-all shadow-neon-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs transition-all shadow-neon-sm"
            >
              Finish & Launch Dashboard
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
