import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Dumbbell, Utensils, Flag, Activity, 
  Trash2, Plus, Edit, Check, X, ShieldAlert, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function AdminView() {
  const { user } = useAuth();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'exercises', 'foods', 'reports'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // New exercise modal
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState('Chest');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExDifficulty, setNewExDifficulty] = useState('Beginner');
  const [newExEquipment, setNewExEquipment] = useState('Bodyweight');

  // New food modal
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCals, setNewFoodCals] = useState('');
  const [newFoodProt, setNewFoodProt] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [newFoodDiet, setNewFoodDiet] = useState('Vegetarian');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, uRes, eRes, fRes, rRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.workouts.getExercises(),
        api.nutrition.getFoods(),
        api.admin.getReports()
      ]);
      setStats(sRes || null);
      setUsers(uRes || []);
      setExercises(eRes || []);
      setFoods(fRes || []);
      setReports(rRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await api.admin.updateUser(targetUser.id, { role: newRole });
      success(`Updated ${targetUser.name}'s role to ${newRole}`, 'User Updated');
      loadAdminData();
    } catch (err) {
      error(err.message, 'Failed to update');
    }
  };

  const handleToggleBan = async (targetUser) => {
    const isBanned = !targetUser.isBanned;
    try {
      await api.admin.updateUser(targetUser.id, { isBanned });
      success(`${targetUser.name} is now ${isBanned ? 'banned' : 'active'}`, 'Status Changed');
      loadAdminData();
    } catch (err) {
      error(err.message, 'Failed');
    }
  };

  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.admin.addExercise({
        name: newExName,
        category: newExCategory,
        muscleGroup: newExMuscle,
        difficulty: newExDifficulty,
        equipment: newExEquipment,
        instructions: ['Perform standard movement reps with controlled cadence and braced core.']
      });
      success(`Added ${newExName} to library!`, 'Exercise Added');
      setShowAddExModal(false);
      setNewExName('');
      loadAdminData();
    } catch (err) {
      error(err.message, 'Failed');
    }
  };

  const handleDeleteExercise = async (id) => {
    if (window.confirm('Delete this exercise from the system database?')) {
      try {
        await api.admin.deleteExercise(id);
        success('Exercise deleted', 'Removed');
        loadAdminData();
      } catch (err) {
        error(err.message, 'Failed');
      }
    }
  };

  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.admin.addFood({
        name: newFoodName,
        calories: Number(newFoodCals),
        protein: Number(newFoodProt) || 0,
        carbs: Number(newFoodCarbs) || 0,
        fat: Number(newFoodFat) || 0,
        dietType: newFoodDiet
      });
      success(`Added ${newFoodName} to food database!`, 'Food Item Added');
      setShowAddFoodModal(false);
      setNewFoodName('');
      setNewFoodCals('');
      loadAdminData();
    } catch (err) {
      error(err.message, 'Failed');
    }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm('Delete this food item?')) {
      try {
        await api.admin.deleteFood(id);
        success('Food item deleted', 'Removed');
        loadAdminData();
      } catch (err) {
        error(err.message, 'Failed');
      }
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.admin.resolveReport(reportId, action);
      success(`Report resolved with action: ${action}`, 'Moderated');
      loadAdminData();
    } catch (err) {
      error(err.message, 'Failed');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">Your account does not possess administrator credentials to view this panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7" />
            FitLife Admin & Moderation Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global system statistics, user privilege management, library curation, and content moderation queue.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
          Admin Privilege Active
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'exercises', label: `Exercises (${exercises.length})` },
          { id: 'foods', label: `Foods (${foods.length})` },
          { id: 'reports', label: `Moderation Queue (${reports.filter(r => r.status === 'pending').length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === t.id
                ? 'bg-amber-400 text-navy-950 font-black shadow-md'
                : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Users</span>
              <span className="text-3xl font-black text-white mt-1 block">{stats?.totalUsers || 0}</span>
              <span className="text-[11px] text-emerald-400 mt-1 block">Active Today: {stats?.activeUsersToday || 0}</span>
            </div>

            <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Workouts Logged</span>
              <span className="text-3xl font-black text-brand-neon mt-1 block">{stats?.totalWorkoutsLogged || 0}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Healthy volume</span>
            </div>

            <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Meals Tracked</span>
              <span className="text-3xl font-black text-sky-400 mt-1 block">{stats?.totalMealsLogged || 0}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Indian & Global items</span>
            </div>

            <div className="p-5 rounded-2xl bg-navy-850 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">System Status</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats?.systemHealth || 'Optimal'}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Uptime: {stats?.serverUptime || '99.9%'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-navy-850 border border-slate-700/80 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white">Registered Users Directory</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Goal</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-navy-800/50">
                    <td className="p-3.5 flex items-center gap-2.5 font-bold text-white">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      {u.name}
                    </td>
                    <td className="p-3.5 text-slate-300">{u.email}</td>
                    <td className="p-3.5 text-slate-400">{u.fitnessGoal}</td>
                    <td className="p-3.5 text-brand-neon font-semibold">{u.level}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-[11px] font-semibold text-slate-300"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          u.isBanned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXERCISES */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white">Curated Exercise Library</h3>
            <button
              onClick={() => setShowAddExModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exercises.map(ex => (
              <div key={ex.id} className="p-4 rounded-2xl bg-navy-850 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                  <span className="text-[10px] text-slate-400">{ex.category} • {ex.equipment}</span>
                </div>
                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-navy-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FOODS */}
      {activeTab === 'foods' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white">Food & Nutrition Database</h3>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Food Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {foods.map(f => (
              <div key={f.id} className="p-4 rounded-2xl bg-navy-850 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{f.name}</h4>
                  <span className="text-[10px] text-brand-neon font-semibold">{f.calories} kcal • {f.dietType}</span>
                </div>
                <button
                  onClick={() => handleDeleteFood(f.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-navy-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MODERATION QUEUE */}
      {activeTab === 'reports' && (
        <div className="rounded-3xl bg-navy-850 border border-slate-700/80 p-5 space-y-4">
          <h3 className="text-base font-extrabold text-white">Reported Content Moderation Queue</h3>

          {reports.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">The moderation queue is clear. No reported posts.</p>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-red-400 font-bold uppercase block">
                      Status: {r.status} • Reason: {r.reason}
                    </span>
                    <p className="text-xs text-white mt-1 italic">"{r.postContent}"</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Author: {r.authorName}</span>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(r.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-300"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'delete_post')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-400"
                      >
                        Remove Post
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-700 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add New Exercise</h3>
              <button onClick={() => setShowAddExModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExerciseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                  >
                    {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs', 'Full body', 'Cardio', 'HIIT', 'Yoga', 'Stretching'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Equipment</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbells">Dumbbells</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Cable">Cable</option>
                    <option value="Yoga Mat">Yoga Mat</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-navy-950 font-bold text-xs"
              >
                Add Exercise
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-700 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add Food Item to Database</h3>
              <button onClick={() => setShowAddFoodModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFoodSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="e.g. Masala Oats with Peas"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={newFoodCals}
                    onChange={(e) => setNewFoodCals(e.target.value)}
                    placeholder="180"
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newFoodProt}
                    onChange={(e) => setNewFoodProt(e.target.value)}
                    placeholder="12"
                    className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-navy-950 font-bold text-xs"
              >
                Add Food
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
