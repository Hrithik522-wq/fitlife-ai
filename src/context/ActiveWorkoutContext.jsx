import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const ActiveWorkoutContext = createContext();

// Web Audio API Sound Generator for Rest Timer & Milestones
function playBeep(freq = 880, duration = 0.15, type = 'sine') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may require user interaction first
  }
}

export function ActiveWorkoutProvider({ children }) {
  const [activeRoutine, setActiveRoutine] = useState(null); // active routine object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState([]); // array of exercises with sets
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const { success, error } = useNotification();
  const { refreshUser } = useAuth();

  // Stopwatch effect
  useEffect(() => {
    if (activeRoutine && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeRoutine, isPaused]);

  // Rest timer effect
  useEffect(() => {
    if (isRestTimerActive && restSecondsRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 4 && prev > 1) {
            playBeep(660, 0.1, 'sine'); // countdown beep
          } else if (prev === 1) {
            playBeep(1200, 0.4, 'triangle'); // rest complete chime
          }
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [isRestTimerActive, restSecondsRemaining]);

  // Start workout routine
  const startWorkout = async (routine) => {
    try {
      let exercises = [];
      if (routine.exercises && routine.exercises.length) {
        // Fetch full exercise details
        const allExercises = await api.workouts.getExercises();
        exercises = routine.exercises.map(item => {
          const detail = allExercises.find(e => e.id === item.exerciseId) || {
            id: item.exerciseId,
            name: item.exerciseName || 'Exercise',
            muscleGroup: 'Full Body',
            difficulty: 'Intermediate',
            demonstrationUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
          };
          const count = Number(item.sets) || 3;
          const sets = Array.from({ length: count }, (_, i) => ({
            setNumber: i + 1,
            reps: parseInt(item.targetReps) || 10,
            weight: 20,
            completed: false
          }));

          return {
            ...detail,
            targetReps: item.targetReps || '10-12',
            restSeconds: item.restSeconds || 60,
            sets
          };
        });
      } else {
        // Quick custom free workout
        exercises = [
          {
            id: 'ex_bench_press',
            name: 'Barbell Bench Press',
            muscleGroup: 'Chest',
            difficulty: 'Intermediate',
            demonstrationUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
            targetReps: '10',
            restSeconds: 90,
            sets: [
              { setNumber: 1, reps: 10, weight: 40, completed: false },
              { setNumber: 2, reps: 10, weight: 45, completed: false },
              { setNumber: 3, reps: 8, weight: 50, completed: false }
            ]
          }
        ];
      }

      setActiveRoutine(routine);
      setWorkoutExercises(exercises);
      setCurrentExerciseIndex(0);
      setElapsedSeconds(0);
      setIsPaused(false);
      setIsModalOpen(true);
      playBeep(880, 0.2, 'sine');
    } catch (err) {
      error('Failed to initialize workout session', 'Error');
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const startRestTimer = (seconds = 60) => {
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
    playBeep(440, 0.15, 'sine');
  };

  const addRestTime = (seconds = 30) => {
    setRestSecondsRemaining(prev => prev + seconds);
  };

  const skipRest = () => {
    setIsRestTimerActive(false);
    setRestSecondsRemaining(0);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setWorkoutExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      ex.sets = sets;
      copy[exerciseIndex] = ex;
      return copy;
    });
  };

  const toggleSetCompleted = (exerciseIndex, setIndex) => {
    setWorkoutExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIndex] };
      const sets = [...ex.sets];
      const current = sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: !current };
      ex.sets = sets;
      copy[exerciseIndex] = ex;

      if (!current) {
        // Set completed: trigger rest timer!
        startRestTimer(ex.restSeconds || 60);
      }
      return copy;
    });
  };

  const substituteExercise = (exerciseIndex, newExercise) => {
    setWorkoutExercises(prev => {
      const copy = [...prev];
      copy[exerciseIndex] = {
        ...newExercise,
        targetReps: copy[exerciseIndex].targetReps,
        restSeconds: copy[exerciseIndex].restSeconds,
        sets: copy[exerciseIndex].sets.map(s => ({ ...s, completed: false }))
      };
      return copy;
    });
    success(`Substituted with ${newExercise.name}`, 'Exercise Swapped');
  };

  const finishWorkout = async (notes = '') => {
    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      const caloriesBurned = Math.round(durationMinutes * 7.5);

      const payload = {
        routineId: activeRoutine.id,
        routineName: activeRoutine.name,
        date: new Date().toISOString().split('T')[0],
        durationMinutes,
        caloriesBurned,
        notes,
        exercises: workoutExercises.map(ex => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: ex.sets
        }))
      };

      const res = await api.workouts.logWorkout(payload);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00F076', '#38BDF8', '#F59E0B', '#FFFFFF']
      });

      playBeep(1046, 0.3, 'triangle');
      setTimeout(() => playBeep(1318, 0.4, 'triangle'), 150);

      success(`Workout finished! You earned +${res.earnedXp} XP and burned ~${caloriesBurned} kcal.`, 'Awesome Workout!');
      
      refreshUser();
      setActiveRoutine(null);
      setIsModalOpen(false);
      return res;
    } catch (err) {
      error(err.message, 'Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    if (window.confirm('Are you sure you want to exit? Unsaved workout progress will be lost.')) {
      setActiveRoutine(null);
      setIsModalOpen(false);
    }
  };

  return (
    <ActiveWorkoutContext.Provider value={{
      activeRoutine,
      isModalOpen,
      setIsModalOpen,
      workoutExercises,
      currentExerciseIndex,
      setCurrentExerciseIndex,
      elapsedSeconds,
      isPaused,
      togglePause,
      startWorkout,
      finishWorkout,
      cancelWorkout,
      updateSet,
      toggleSetCompleted,
      substituteExercise,
      restSecondsRemaining,
      isRestTimerActive,
      startRestTimer,
      addRestTime,
      skipRest
    }}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  return useContext(ActiveWorkoutContext);
}
