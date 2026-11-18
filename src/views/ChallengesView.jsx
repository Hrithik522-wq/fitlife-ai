import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Zap, Flame, Shield, Users, Lock, CheckCircle2, 
  Sparkles, ArrowRight, Eye, EyeOff 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function ChallengesView() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges', 'badges', 'leaderboard'
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes, lRes] = await Promise.all([
        api.challenges.getAll(),
        api.challenges.getBadges(),
        api.challenges.getLeaderboard()
      ]);
      setChallenges(cRes || []);
      setBadges(bRes || []);
      setLeaderboard(lRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (id) => {
    try {
      await api.challenges.join(id);
      success('Challenge joined! Keep crushing those workouts.', 'Joined');
      refreshUser();
      loadGamificationData();
    } catch (err) {
      error(err.message, 'Failed to join');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Fitness Challenges & Gamification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conquer monthly community challenges, unlock rare achievement badges, and climb the leaderboard.
          </p>
        </div>

        {/* User XP & Level Overview Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-navy-850 border border-brand-neon/30">
          <div className="w-9 h-9 rounded-xl bg-brand-neon text-navy-950 font-black flex items-center justify-center">
            <Zap className="w-5 h-5 fill-navy-950" />
          </div>
          <div>
            <span className="text-xs font-black text-white">{user?.level || 'Bronze I'}</span>
            <span className="text-[11px] text-brand-neon font-bold block">{user?.xp || 0} XP Earned</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'challenges'
              ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
              : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
          }`}
        >
          Active Challenges
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'badges'
              ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
              : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
          }`}
        >
          Achievement Badges ({badges.filter(b => b.isUnlocked).length} / {badges.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-brand-neon text-navy-950 shadow-neon-sm'
              : 'bg-navy-850 text-slate-400 hover:text-white border border-slate-700/80'
          }`}
        >
          Global Leaderboard
        </button>
      </div>

      {/* TAB 1: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map(chal => (
            <div
              key={chal.id}
              className="rounded-3xl bg-navy-850 border border-slate-700/80 overflow-hidden flex flex-col justify-between group hover:border-brand-neon/50 transition-all"
            >
              <div className="h-44 w-full relative overflow-hidden bg-navy-900">
                <img
                  src={chal.bannerUrl}
                  alt={chal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-brand-neon uppercase">
                    {chal.category} • {chal.durationDays} Days
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-navy-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-navy-950" />
                  +{chal.xpReward} XP
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">{chal.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {chal.description}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-3 block">
                    👥 <strong>{chal.participantsCount.toLocaleString()}</strong> active athletes participating
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  {chal.isJoined ? (
                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-400">Challenge Active</span>
                        <span className="text-brand-neon">{chal.userProgress}% Done</span>
                      </div>
                      <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-brand-neon rounded-full"
                          style={{ width: `${chal.userProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinChallenge(chal.id)}
                      className="w-full py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-neon-sm active:scale-95 transition-transform"
                    >
                      Join Challenge Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-navy-850 border border-slate-700/80">
            <h3 className="text-base font-extrabold text-white mb-1">FitLife Achievements & Milestones</h3>
            <p className="text-xs text-slate-400 mb-6">Earn XP and unlock badges by staying consistent with your workouts, habits, and nutrition.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map(b => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    b.isUnlocked
                      ? 'bg-navy-900 border-brand-neon/40 shadow-neon-sm'
                      : 'bg-navy-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        b.isUnlocked ? 'bg-brand-neon text-navy-950 font-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {b.isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>

                      <span className="text-[10px] font-bold text-amber-400">
                        +{b.xp} XP
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{b.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{b.description}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-semibold">{b.category}</span>
                    <span className={`font-bold ${b.isUnlocked ? 'text-brand-neon' : 'text-slate-500'}`}>
                      {b.isUnlocked ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white">Community Hall of Fame</h3>
              <p className="text-xs text-slate-400">Ranked by overall accumulated XP and workout streak.</p>
            </div>

            <span className="text-xs text-slate-400">
              *You can hide yourself from public rankings in Settings.
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {leaderboard.map(item => (
              <div
                key={item.id}
                className={`py-3.5 px-3 flex items-center justify-between rounded-xl transition-colors ${
                  item.id === user?.id ? 'bg-brand-neon/10 border border-brand-neon/30' : 'hover:bg-navy-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-7 text-center font-black text-sm ${
                    item.rank === 1 ? 'text-amber-400 text-lg' : item.rank === 2 ? 'text-slate-300 text-base' : item.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{item.rank}
                  </span>

                  <img
                    src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />

                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {item.name}
                      {item.id === user?.id && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-brand-neon text-navy-950">
                          You
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Level: <strong className="text-slate-300">{item.level}</strong> • {item.fitnessGoal}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-brand-neon block">{item.xp} XP</span>
                  <span className="text-[10px] text-orange-400 font-semibold">🔥 {item.streak}d Streak</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
