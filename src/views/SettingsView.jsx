import React, { useState } from 'react';
import { 
  Settings, User, Lock, Bell, Moon, Sun, Scale, Shield, 
  Download, Trash2, LogOut, Check, Sparkles, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export function SettingsView() {
  const { user, updateProfile, logout, setShowOnboardingModal } = useAuth();
  const { theme, toggleTheme, unit, toggleUnit } = useTheme();
  const { success, error } = useNotification();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 27);
  const [gender, setGender] = useState(user?.gender || 'Female');
  const [height, setHeight] = useState(user?.height || 168);
  const [weight, setWeight] = useState(user?.weight || 63.5);
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || 58);
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'Body recomposition');
  const [fitnessLevel, setFitnessLevel] = useState(user?.fitnessLevel || 'Intermediate');
  const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'Vegetarian');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(user?.dailyCalorieGoal || 2000);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(user?.dailyWaterGoal || 3000);
  const [dailyStepGoal, setDailyStepGoal] = useState(user?.dailyStepGoal || 10000);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification toggles
  const [workoutReminder, setWorkoutReminder] = useState(user?.notifications?.workoutReminder ?? true);
  const [waterReminder, setWaterReminder] = useState(user?.notifications?.waterReminder ?? true);
  const [mealReminder, setMealReminder] = useState(user?.notifications?.mealReminder ?? true);
  const [streakReminder, setStreakReminder] = useState(user?.notifications?.streakReminder ?? true);

  // Privacy toggles
  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);
  const [allowLeaderboard, setAllowLeaderboard] = useState(user?.allowLeaderboard ?? true);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        targetWeight: Number(targetWeight),
        fitnessGoal,
        fitnessLevel,
        dietaryPreference,
        dailyCalorieGoal: Number(dailyCalorieGoal),
        dailyWaterGoal: Number(dailyWaterGoal),
        dailyStepGoal: Number(dailyStepGoal),
        isPublic,
        allowLeaderboard,
        notifications: {
          workoutReminder,
          waterReminder,
          mealReminder,
          streakReminder
        }
      });
      success('Profile & settings saved successfully!', 'Saved');
    } catch (err) {
      error(err.message, 'Failed to save');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      success('Password updated successfully!', 'Security');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      error(err.message, 'Password Update Failed');
    }
  };

  const handleExportData = () => {
    window.open('/api/reports/export', '_blank');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you ABSOLUTELY sure you want to delete your FitLife AI account? All workouts and meal history will be permanently erased.')) {
      try {
        await api.auth.deleteAccount();
        logout();
      } catch (err) {
        error(err.message, 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-neon" />
          Settings & Account Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your fitness parameters, display preferences, notifications, privacy, and account data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile & Fitness Goals Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-neon" />
                Personal Profile & Goals
              </h3>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="text-xs font-semibold text-brand-neon hover:underline"
              >
                Re-run Assessment Wizard
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Weight loss">Weight Loss</option>
                  <option value="Muscle gain">Muscle Gain</option>
                  <option value="Body recomposition">Body Recomposition</option>
                  <option value="General fitness">General Fitness</option>
                  <option value="Strength building">Strength Building</option>
                  <option value="Endurance improvement">Endurance Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dietary Preference</label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Eggetarian">Eggetarian</option>
                  <option value="Keto">Ketogenic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={dailyCalorieGoal}
                  onChange={(e) => setDailyCalorieGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs shadow-neon-sm"
            >
              Save Profile Updates
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Lock className="w-4 h-4 text-brand-neon" />
              Security & Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-bold text-white"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Right Column: Preferences, Privacy, Data Export (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Display & Units Preferences */}
          <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Scale className="w-4 h-4 text-brand-neon" />
              Display & Units
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-navy-900 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Theme Mode</span>
                  <span className="text-[11px] text-slate-400">Current: {theme === 'dark' ? 'Dark Navy' : 'Clean Light'}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                  Toggle
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-navy-900 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Measurement Units</span>
                  <span className="text-[11px] text-slate-400">Current: {unit === 'metric' ? 'Metric (kg, cm, ml)' : 'Imperial (lb, ft, oz)'}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleUnit}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-bold text-brand-neon"
                >
                  {unit === 'metric' ? 'Switch to LB' : 'Switch to KG'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Bell className="w-4 h-4 text-brand-neon" />
              Notification Reminders
            </h3>

            <div className="space-y-2.5">
              {[
                { label: 'Workout Reminder (Daily)', state: workoutReminder, setter: setWorkoutReminder },
                { label: 'Hydration 2-Hour Alerts', state: waterReminder, setter: setWaterReminder },
                { label: 'Meal Logging Prompts', state: mealReminder, setter: setMealReminder },
                { label: 'Streak Milestone Warnings', state: streakReminder, setter: setStreakReminder }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${item.state ? 'bg-brand-neon' : 'bg-slate-700'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-navy-950 absolute top-0.5 transition-transform ${item.state ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Export & Danger Zone */}
          <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4 h-4 text-brand-neon" />
              Data Privacy & Account
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-brand-neon" />
                Export Full Account Data (JSON)
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-xs font-bold text-red-400 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete FitLife Account Permanently
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
