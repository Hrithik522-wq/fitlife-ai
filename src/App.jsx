import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveWorkoutProvider } from './context/ActiveWorkoutContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { DashboardView } from './views/DashboardView';
import { WorkoutsView } from './views/WorkoutsView';
import { NutritionView } from './views/NutritionView';
import { AICoachView } from './views/AICoachView';
import { ProgressView } from './views/ProgressView';
import { HabitsView } from './views/HabitsView';
import { CalendarView } from './views/CalendarView';
import { ChallengesView } from './views/ChallengesView';
import { SleepRecoveryView } from './views/SleepRecoveryView';
import { CommunityView } from './views/CommunityView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';

import { AuthModal } from './components/modals/AuthModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { ActiveWorkoutModal } from './components/modals/ActiveWorkoutModal';
import { LogFoodModal } from './components/modals/LogFoodModal';
import { LogProgressModal } from './components/modals/LogProgressModal';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Quick Action Modal states
  const [quickLogType, setQuickLogType] = useState(null); // 'food', 'progress', 'water', 'breakfast', etc.

  const handleOpenQuickLog = (type) => {
    if (type === 'water') {
      // Direct navigation to habits or quick prompt
      setCurrentView('dashboard');
    } else {
      setQuickLogType(type);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} onOpenQuickLog={handleOpenQuickLog} />;
      case 'workouts':
        return <WorkoutsView onNavigate={setCurrentView} />;
      case 'nutrition':
        return <NutritionView onOpenQuickLog={handleOpenQuickLog} />;
      case 'ai-coach':
        return <AICoachView />;
      case 'progress':
        return <ProgressView onOpenQuickLog={handleOpenQuickLog} />;
      case 'habits':
        return <HabitsView />;
      case 'calendar':
        return <CalendarView />;
      case 'challenges':
        return <ChallengesView />;
      case 'sleep':
        return <SleepRecoveryView />;
      case 'community':
        return <CommunityView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView onNavigate={setCurrentView} onOpenQuickLog={handleOpenQuickLog} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-900 text-slate-100">
      {/* Top Navbar */}
      <Navbar onNavigate={setCurrentView} onOpenQuickLog={handleOpenQuickLog} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden mb-14 md:mb-0">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <OnboardingModal />
      <ActiveWorkoutModal />
      
      <LogFoodModal
        isOpen={quickLogType === 'food' || quickLogType === 'breakfast' || quickLogType === 'lunch' || quickLogType === 'dinner' || quickLogType === 'snack'}
        defaultMealType={['breakfast', 'lunch', 'dinner', 'snack'].includes(quickLogType) ? quickLogType : 'lunch'}
        onClose={() => setQuickLogType(null)}
      />

      <LogProgressModal
        isOpen={quickLogType === 'progress'}
        onClose={() => setQuickLogType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <ActiveWorkoutProvider>
            <MainApp />
          </ActiveWorkoutProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
