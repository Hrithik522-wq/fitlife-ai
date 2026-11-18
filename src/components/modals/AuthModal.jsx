import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, loginWithGoogle, setShowOnboardingModal } = useAuth();
  const { success, error } = useNotification();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        if (!codeSent) {
          const res = await api.auth.forgotPassword(email);
          setCodeSent(true);
          success(res.message, 'Reset Code Sent');
        } else {
          await api.auth.resetPassword({ email, resetCode, newPassword });
          success('Password has been updated. Please sign in.', 'Password Reset');
          setIsForgot(false);
          setCodeSent(false);
        }
      } else if (isRegister) {
        await register({ name, email, password });
        setShowAuthModal(false);
        setShowOnboardingModal(true); // Open onboarding wizard for new user!
      } else {
        await login(email, password);
        setShowAuthModal(false);
      }
    } catch (err) {
      // Handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = async (userType) => {
    setLoading(true);
    try {
      if (userType === 'admin') {
        await login('admin@fitlife.ai', 'admin123');
      } else {
        await login('alex@fitlife.ai', 'password123');
      }
      setShowAuthModal(false);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-neon/15 border border-brand-neon/30 text-brand-neon mb-3 shadow-neon-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isForgot ? 'Reset Password' : isRegister ? 'Create Your FitLife Account' : 'Welcome to FitLife AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isForgot 
              ? 'Enter your registered email to receive your secure reset code.' 
              : isRegister 
              ? 'Join thousands reaching peak health and fitness through smart AI.' 
              : 'Sign in to access your workouts, nutrition, and wellness dashboard.'}
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        {!isForgot && (
          <div className="mb-5 p-3 rounded-xl bg-navy-850 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              ⚡ Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('user')}
                className="px-2.5 py-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 border border-slate-600 text-xs font-semibold text-slate-200 hover:text-brand-neon transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-brand-neon" />
                Demo User
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 border border-amber-500/40 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Admin Demo
              </button>
            </div>
          </div>
        )}

        {/* Google Authentication Button */}
        {!isForgot && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="px-3 text-[11px] text-slate-500 uppercase font-medium">or with email</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && !isForgot && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fitlife.ai"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
              />
            </div>
          </div>

          {!isForgot ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-[11px] text-brand-neon hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
                />
              </div>
            </div>
          ) : codeSent ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reset Code</label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="FITLIFE-7729"
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
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
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
                />
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-neon-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : isForgot ? (codeSent ? 'Set New Password' : 'Send Reset Code') : isRegister ? 'Create Account & Begin' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isForgot ? (
            <button
              onClick={() => { setIsForgot(false); setCodeSent(false); }}
              className="text-brand-neon font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          ) : isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-brand-neon font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-brand-neon font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
