import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all exercises with optional query filter
router.get('/exercises', (req, res) => {
  let list = db.exercises();
  const { category, search, difficulty, equipment } = req.query;

  if (category && category !== 'All') {
    list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    list = list.filter(e => e.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (equipment && equipment !== 'All') {
    list = list.filter(e => e.equipment.toLowerCase().includes(equipment.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(e => 
      e.name.toLowerCase().includes(s) ||
      e.muscleGroup.toLowerCase().includes(s) ||
      e.secondaryMuscles.some(m => m.toLowerCase().includes(s))
    );
  }
  res.json(list);
});

// Get exercise by id
router.get('/exercises/:id', (req, res) => {
  const item = db.exercises().find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Exercise not found.' });
  res.json(item);
});

// Exercise substitutions
router.get('/substitutions/:id', (req, res) => {
  const target = db.exercises().find(e => e.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Exercise not found.' });

  const alternatives = db.exercises().filter(e => 
    e.id !== target.id && 
    (e.category === target.category || e.muscleGroup === target.muscleGroup)
  );
  res.json(alternatives.slice(0, 5));
});

// Get routines (predefined + custom)
router.get('/routines', authenticate, (req, res) => {
  const allRoutines = db.routines();
  const customRoutines = allRoutines.filter(r => !r.userId || r.userId === req.user.id);
  res.json(customRoutines);
});

// Create custom routine
router.post('/routines', authenticate, (req, res) => {
  const { name, category, difficulty, estimatedMinutes, exercises } = req.body;
  if (!name || !exercises || !exercises.length) {
    return res.status(400).json({ error: 'Name and exercises are required.' });
  }

  const newRoutine = {
    id: `routine_custom_${Date.now()}`,
    userId: req.user.id,
    name,
    category: category || 'Custom',
    difficulty: difficulty || 'Intermediate',
    estimatedMinutes: Number(estimatedMinutes) || 45,
    caloriesBurnEstimate: Math.round((Number(estimatedMinutes) || 45) * 7),
    exercises: exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: Number(ex.sets) || 3,
      targetReps: ex.targetReps || '10-12',
      restSeconds: Number(ex.restSeconds) || 60
    })),
    createdAt: new Date().toISOString()
  };

  db.routines().push(newRoutine);
  db.save();
  res.status(201).json(newRoutine);
});

// Delete custom routine
router.delete('/routines/:id', authenticate, (req, res) => {
  const index = db.routines().findIndex(r => r.id === req.params.id && r.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Custom routine not found or not owned by you.' });
  }
  db.routines().splice(index, 1);
  db.save();
  res.json({ message: 'Routine deleted successfully.' });
});

// Get user workout logs
router.get('/logs', authenticate, (req, res) => {
  const logs = db.workoutLogs().filter(w => w.userId === req.user.id);
  // Sort descending by date
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(logs);
});

// Log workout session
router.post('/logs', authenticate, (req, res) => {
  try {
    const { routineId, routineName, date, durationMinutes, caloriesBurned, exercises, notes } = req.body;

    const newLog = {
      id: `wlog_${Date.now()}`,
      userId: req.user.id,
      routineId: routineId || 'custom_session',
      routineName: routineName || 'Workout Session',
      date: date || new Date().toISOString().split('T')[0],
      durationMinutes: Number(durationMinutes) || 30,
      caloriesBurned: Number(caloriesBurned) || Math.round((Number(durationMinutes) || 30) * 7.5),
      exercises: exercises || [],
      notes: notes || '',
      completed: true,
      loggedAt: new Date().toISOString()
    };

    db.workoutLogs().push(newLog);

    // Gamification: Give user XP & update streak
    const user = db.users().find(u => u.id === req.user.id);
    let earnedXp = 100 + Math.round((newLog.durationMinutes || 30) * 2);
    user.xp = (user.xp || 0) + earnedXp;

    // Check badges
    const userLogs = db.workoutLogs().filter(w => w.userId === req.user.id);
    const badgesUnlocked = [];

    // First Step badge
    const firstStepBadge = db.badges().find(b => b.id === 'badge_first_step');
    if (firstStepBadge && !firstStepBadge.unlockedUsers.includes(user.id)) {
      firstStepBadge.unlockedUsers.push(user.id);
      user.xp += firstStepBadge.xp;
      badgesUnlocked.push(firstStepBadge);
    }

    // 7-day streak
    if (user.streak >= 7) {
      const streakBadge = db.badges().find(b => b.id === 'badge_streak_7');
      if (streakBadge && !streakBadge.unlockedUsers.includes(user.id)) {
        streakBadge.unlockedUsers.push(user.id);
        user.xp += streakBadge.xp;
        badgesUnlocked.push(streakBadge);
      }
    }

    // Update level based on XP
    if (user.xp >= 4000) user.level = 'FitLife Master';
    else if (user.xp >= 3000) user.level = 'Platinum I';
    else if (user.xp >= 2000) user.level = 'Gold I';
    else if (user.xp >= 1000) user.level = 'Silver II';
    else if (user.xp >= 500) user.level = 'Silver I';
    else user.level = 'Bronze II';

    db.save();

    res.status(201).json({
      log: newLog,
      earnedXp,
      newTotalXp: user.xp,
      level: user.level,
      badgesUnlocked
    });
  } catch (err) {
    console.error('Error logging workout:', err);
    res.status(500).json({ error: 'Failed to record workout session' });
  }
});

// Delete workout log
router.delete('/logs/:id', authenticate, (req, res) => {
  const index = db.workoutLogs().findIndex(w => w.id === req.params.id && w.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Workout log not found.' });
  }
  db.workoutLogs().splice(index, 1);
  db.save();
  res.json({ message: 'Workout log removed.' });
});

// Get personal records
router.get('/records', authenticate, (req, res) => {
  const userLogs = db.workoutLogs().filter(w => w.userId === req.user.id);
  const records = {};

  userLogs.forEach(log => {
    (log.exercises || []).forEach(ex => {
      const exId = ex.exerciseId;
      const exName = ex.exerciseName;
      if (!records[exId]) {
        records[exId] = { exerciseId: exId, exerciseName: exName, maxWeight: 0, maxReps: 0, bestDate: log.date };
      }
      (ex.sets || []).forEach(set => {
        if (set.weight > records[exId].maxWeight) {
          records[exId].maxWeight = set.weight;
          records[exId].maxReps = set.reps;
          records[exId].bestDate = log.date;
        }
      });
    });
  });

  res.json(Object.values(records));
});

export default router;
