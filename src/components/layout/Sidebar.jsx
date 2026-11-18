import React from 'react';
import { 
  LayoutDashboard, Dumbbell, Utensils, Bot, TrendingUp, CheckSquare, 
  CalendarDays, Trophy, Moon, Users, BarChart3, Settings, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentView, onNavigate }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts & Exercises', icon: Dumbbell },
    { id: 'nutrition', label: 'AI Nutrition & Meals', icon: Utensils },
    { id: 'ai-coach', label: 'AI Fitness Trainer', icon: Bot, badge: 'AI' },
    { id: 'progress', label: 'Body & Progress', icon: TrendingUp },
    { id: 'habits', label: 'Habits & Wellness', icon: CheckSquare },
    { id: 'calendar', label: 'Smart Calendar', icon: CalendarDays },
    { id: 'challenges', label: 'Challenges & Gamification', icon: Trophy },
    { id: 'sleep', label: 'Sleep & Recovery', icon: Moon },
    { id: 'community', label: 'Community Feed', icon: Users },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-navy-900 border-r border-slate-800/80 p-4 space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-neon/15 text-brand-neon border border-brand-neon/30 shadow-neon-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-neon' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    item.badge === 'Admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-brand-neon/20 text-brand-neon'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Motivational Card */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-br from-navy-800 to-navy-850 border border-slate-700/60 text-slate-300">
            <p className="text-[11px] font-semibold text-brand-neon flex items-center gap-1.5">
              <span>💡 Daily Fitness Insight</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time."
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 py-2 shadow-2xl">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'dashboard' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onNavigate('workouts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'workouts' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Workouts</span>
        </button>

        <button
          onClick={() => onNavigate('nutrition')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'nutrition' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-medium">Diet</span>
        </button>

        <button
          onClick={() => onNavigate('ai-coach')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'ai-coach' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] font-medium">AI Coach</span>
        </button>

        <button
          onClick={() => onNavigate('progress')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'progress' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium">Progress</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
            currentView === 'settings' ? 'text-brand-neon' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
}
