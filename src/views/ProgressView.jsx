import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Plus, Scale, Camera, Award, ArrowDown, ArrowUp, 
  Sparkles, CheckCircle2, AlertCircle, Calendar 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function ProgressView({ onOpenQuickLog }) {
  const { user } = useAuth();
  const { formatWeight, unit } = useTheme();

  const [logs, setLogs] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoFilter, setPhotoFilter] = useState('All');

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [lRes, cRes] = await Promise.all([
        api.progress.getLogs(),
        api.progress.getComparison()
      ]);
      setLogs(lRes || []);
      setComparison(cRes || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const latestLog = logs[logs.length - 1] || {
    weight: user?.weight || 63.5,
    height: user?.height || 168,
    bmi: 22.5,
    bmiCategory: 'Normal weight',
    bodyFat: 23,
    waist: 71,
    chest: 87,
    arm: 29,
    thigh: 54.5
  };

  const photos = logs.filter(l => l.photoUrl);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-brand-neon" />
            Body & Fitness Progress Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze weight evolution, body circumference, BMI trends, and visual progress photos.
          </p>
        </div>

        <button
          onClick={() => onOpenQuickLog('progress')}
          className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-neon-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record New Measurements
        </button>
      </div>

      {/* Goal Completion Progress & BMI Gauge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Goal Completion Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Goal Completion
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-neon/20 text-brand-neon border border-brand-neon/30">
                {user?.fitnessGoal || 'Body Recomp'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-brand-neon">
                {comparison?.completionPercentage || 82}%
              </span>
              <span className="text-xs text-slate-400">to Target Weight</span>
            </div>

            <div className="mt-3 h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-brand-neon rounded-full shadow-neon-sm"
                style={{ width: `${comparison?.completionPercentage || 82}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 mt-3">
              Initial: <strong>{formatWeight(comparison?.initial?.weight || 65.5)}</strong> → Current: <strong>{formatWeight(latestLog.weight)}</strong> → Goal: <strong>{formatWeight(user?.targetWeight || 58)}</strong>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total Weight Change:</span>
            <span className="font-bold text-emerald-400 flex items-center">
              <ArrowDown className="w-3.5 h-3.5" />
              {Math.abs(comparison?.weightChange || 2.0)} kg
            </span>
          </div>
        </div>

        {/* Current Body Mass Index (BMI) Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Body Mass Index (BMI)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {latestLog.bmiCategory || 'Normal weight'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{latestLog.bmi}</span>
              <span className="text-xs text-slate-400">kg/m²</span>
            </div>

            {/* BMI Band Indicator */}
            <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden bg-navy-900">
              <div className="w-1/4 bg-blue-400" title="Underweight (<18.5)" />
              <div className="w-2/4 bg-emerald-400" title="Normal (18.5 - 24.9)" />
              <div className="w-1/4 bg-amber-400" title="Overweight (25 - 29.9)" />
              <div className="w-1/4 bg-red-400" title="Obese (30+)" />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1 uppercase">
              <span>Under</span>
              <span className="text-emerald-400">Normal</span>
              <span>Over</span>
              <span>Obese</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-3 italic">
            *Non-diagnostic wellness reference; does not distinguish muscle from fat.
          </p>
        </div>

        {/* Circumference & Body Fat Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Circumference Highlights
              </span>
              <span className="text-xs font-bold text-purple-400">
                {latestLog.bodyFat ? `${latestLog.bodyFat}% Body Fat` : 'Tape Measures'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Waist</span>
                <span className="text-sm font-black text-white">{latestLog.waist || '--'} cm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Chest</span>
                <span className="text-sm font-black text-white">{latestLog.chest || '--'} cm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Biceps</span>
                <span className="text-sm font-black text-white">{latestLog.arm || '--'} cm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Thigh</span>
                <span className="text-sm font-black text-white">{latestLog.thigh || '--'} cm</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Waist Reduction:</span>
            <span className="text-brand-neon font-bold">
              {comparison?.waistChange ? `${Math.abs(comparison.waistChange)} cm down` : '3.0 cm down'}
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Weight History Line Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-neon" />
            <h3 className="text-base font-extrabold text-white">Weight Trajectory Over Time</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Historical Logs</span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logs} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px' }}
                labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#00F076" strokeWidth={3} dot={{ fill: '#00F076', r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Photo Timeline & Comparison Gallery */}
      <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold text-white">Visual Progress Photo Timeline</h3>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'Front View', 'Side Profile', 'Back View'].map(t => (
              <button
                key={t}
                onClick={() => setPhotoFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  photoFilter === t
                    ? 'bg-purple-500 text-white'
                    : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Camera className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No progress photos uploaded yet. Snap front and side photos monthly to see physical transformation!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map(p => (
              <div key={p.id} className="rounded-2xl overflow-hidden bg-navy-900 border border-slate-800 group">
                <div className="h-56 w-full relative">
                  <img src={p.photoUrl} alt="Progress" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-white uppercase">
                    {p.date} • {p.photoTag || 'Front'}
                  </span>
                </div>
                <div className="p-2.5 text-xs text-slate-300 flex justify-between items-center">
                  <span>Weight: <strong>{p.weight} kg</strong></span>
                  <span className="text-[10px] text-brand-neon font-bold">BMI {p.bmi}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
