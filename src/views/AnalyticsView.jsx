import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Download, FileText, Calendar, Sparkles, TrendingUp, 
  Flame, Dumbbell, Utensils, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export function AnalyticsView() {
  const { user } = useAuth();
  const { formatWeight } = useTheme();
  const { success, error } = useNotification();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0F17'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FitLife_AI_Progress_Report_${user?.name?.replace(/\s+/g, '_')}.pdf`);
      success('PDF progress report downloaded successfully!', 'Report Exported');
    } catch (err) {
      error('Failed to export PDF report', 'Error');
    } finally {
      setExportingPdf(false);
    }
  };

  const weeklyTrend = analytics?.weeklyTrend || [];
  const weightHistory = analytics?.weightHistory || [];
  const macroDistribution = analytics?.macroDistribution || [
    { name: 'Protein', grams: 120, color: '#00F076' },
    { name: 'Carbs', grams: 210, color: '#38BDF8' },
    { name: 'Fats', grams: 55, color: '#FB923C' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-neon" />
            Analytics & Progress Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Weekly & monthly training trends, caloric precision, macronutrient distribution, and downloadable PDF reports.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={exportingPdf}
          className="px-4 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-2 shadow-neon-sm disabled:opacity-50 transition-all"
        >
          <Download className="w-4 h-4" />
          {exportingPdf ? 'Generating PDF...' : 'Download PDF Progress Report'}
        </button>
      </div>

      {/* Printable Report Container */}
      <div ref={reportRef} className="space-y-6 bg-navy-900 p-2 sm:p-4 rounded-3xl">
        
        {/* Report Overview Header Card */}
        <div className="p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-neon uppercase tracking-wider block">
              Official Progress Intelligence Summary
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">
              Goal: <strong>{user?.fitnessGoal}</strong> • Level: <strong>{user?.level}</strong> • Current Weight: <strong>{formatWeight(user?.weight)}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Streak</span>
              <span className="text-lg font-black text-orange-400">🔥 {user?.streak || 0}d</span>
            </div>

            <div className="p-3 rounded-2xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Workouts</span>
              <span className="text-lg font-black text-brand-neon">{analytics?.workoutFrequency || 0}</span>
            </div>

            <div className="p-3 rounded-2xl bg-navy-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Goal Progress</span>
              <span className="text-lg font-black text-emerald-400">{analytics?.goalCompletionRate || 85}%</span>
            </div>
          </div>
        </div>

        {/* Charts Row 1: Weekly Calories & Macro Partitioning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Calorie Intake vs Burn Bar Chart (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Calories Consumed vs Daily Target
              </h3>
              <span className="text-xs text-slate-400 font-medium">Daily kcal</span>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="caloriesConsumed" name="Consumed" fill="#00F076" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="targetCalories" name="Target" fill="#334155" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macronutrient Distribution Pie Chart (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-sky-400" />
                Macronutrient Balance
              </h3>
              <span className="text-xs text-slate-400">Average %</span>
            </div>

            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    dataKey="grams"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                  >
                    {macroDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 pt-2 border-t border-slate-800">
              {macroDistribution.map(m => (
                <div key={m.name} className="p-2 rounded-xl bg-navy-900">
                  <span className="text-[10px] text-slate-400 block">{m.name}</span>
                  <span className="font-bold text-white" style={{ color: m.color }}>{m.grams}g</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Charts Row 2: Weight Progression Over Time */}
        <div className="p-5 sm:p-6 rounded-3xl bg-navy-850 border border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-neon" />
              Weight Progression Curve
            </h3>
            <span className="text-xs text-brand-neon font-bold">Optimal Downward Trend</span>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#00F076" strokeWidth={3} dot={{ fill: '#00F076', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
