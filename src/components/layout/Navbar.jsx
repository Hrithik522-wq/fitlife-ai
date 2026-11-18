import React, { useState, useEffect } from 'react';
import { 
  Flame, Zap, Bell, Moon, Sun, Plus, Dumbbell, Utensils, 
  Scale, Droplets, LogOut, Settings, Shield, User as UserIcon, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export function Navbar({ onNavigate, onOpenQuickLog }) {
  const { user, logout, setShowAuthModal } = useAuth();
  const { theme, toggleTheme, unit, toggleUnit } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.reports.getNotifications()
        .then(data => setNotifications(data || []))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.reports.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.reports.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-dark via-brand-neon to-emerald-300 p-0.5 shadow-neon-sm transition-transform duration-200 group-hover:scale-105">
            <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-neon fill-brand-neon" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              FitLife <span className="text-brand-neon font-black drop-shadow-sm">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Smart Wellness OS
            </span>
          </div>
        </div>

        {/* Center / Right: Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {user ? (
            <>
              {/* Streak Badge */}
              <div 
                title={`${user.streak || 0} Day Active Streak`}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold cursor-default"
              >
                <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
                <span>{user.streak || 0}d Streak</span>
              </div>

              {/* XP & Level Badge */}
              <div 
                title={`${user.xp || 0} XP Accumulated`}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-neon/10 border border-brand-neon/30 text-brand-neon text-xs font-semibold cursor-default"
              >
                <Zap className="w-3.5 h-3.5 fill-brand-neon" />
                <span>{user.level || 'Bronze I'}</span>
                <span className="text-slate-400 text-[10px]">({user.xp || 0} XP)</span>
              </div>

              {/* Quick Action Button */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickMenu(!showQuickMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-neon hover:bg-brand-hover text-navy-950 font-semibold text-xs transition-all shadow-neon-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">Log Activity</span>
                </button>

                {showQuickMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-navy-800 border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => { setShowQuickMenu(false); onOpenQuickLog('food'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <Utensils className="w-4 h-4 text-emerald-400" />
                      Log Food & Meal
                    </button>
                    <button
                      onClick={() => { setShowQuickMenu(false); onNavigate('workouts'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <Dumbbell className="w-4 h-4 text-blue-400" />
                      Start Workout
                    </button>
                    <button
                      onClick={() => { setShowQuickMenu(false); onOpenQuickLog('progress'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <Scale className="w-4 h-4 text-purple-400" />
                      Log Body Weight
                    </button>
                    <button
                      onClick={() => { setShowQuickMenu(false); onOpenQuickLog('water'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      Quick +250ml Water
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-1.5 rounded-lg bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs transition-all shadow-neon-sm"
            >
              Sign In / Register
            </button>
          )}

          {/* Unit Toggle Button (kg vs lb) */}
          <button
            onClick={toggleUnit}
            title={`Switch to ${unit === 'metric' ? 'Imperial (lbs)' : 'Metric (kg)'}`}
            className="px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-xs font-medium text-slate-300 transition-colors uppercase"
          >
            {unit === 'metric' ? 'KG/CM' : 'LB/FT'}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg bg-navy-800 hover:bg-navy-750 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-neon text-navy-950 font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-navy-850 border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-neon" />
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-brand-neon hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 mt-2">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">No notifications yet. You're all caught up!</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`py-3 flex items-start justify-between gap-3 ${n.read ? 'opacity-65' : ''}`}
                        >
                          <div>
                            <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-brand-neon"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-700 hover:border-brand-neon transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-850 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-700/80">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-neon/20 text-brand-neon border border-brand-neon/30">
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <button
                      onClick={() => { setShowProfileDropdown(false); onNavigate('settings'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileDropdown(false); onNavigate('settings'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-brand-neon hover:bg-navy-750 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setShowProfileDropdown(false); onNavigate('admin'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-navy-750 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        Admin Panel
                      </button>
                    )}

                    <div className="border-t border-slate-700/60 my-1"></div>

                    <button
                      onClick={() => { setShowProfileDropdown(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
