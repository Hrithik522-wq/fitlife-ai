import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

function calculateWellnessScore(habitLog, user) {
  let score = 0;

  // 1. Hydration (25 pts max)
  const waterGoal = user.dailyWaterGoal || 3000;
  const waterScore = Math.min(25, Math.round(((habitLog.waterMl || 0) / waterGoal) * 25));
  score += waterScore;

  // 2. Sleep (25 pts max)
  const sleepHours = habitLog.sleepHours || 0;
  let sleepScore = 0;
  if (sleepHours >= 7 && sleepHours <= 9) sleepScore = 20;
  else if (sleepHours >= 6 || sleepHours === 10) sleepScore = 15;
  else if (sleepHours > 0) sleepScore = 10;
  // Sleep quality bonus
  const quality = habitLog.sleepQuality || 3;
  sleepScore += Math.round(quality); // 1-5 pts
  score += Math.min(25, sleepScore);

  // 3. Activity / Steps (25 pts max)
  const stepGoal = user.dailyStepGoal || 10000;
  const stepScore = Math.min(25, Math.round(((habitLog.steps || 0) / stepGoal) * 25));
  score += stepScore;

  // 4. Mindfulness & Habit Checklist (25 pts max)
  let habitScore = 0;
  const habits = habitLog.habits || [];
  if (habits.length > 0) {
    const completed = habits.filter(h => h.completed).length;
    habitScore += Math.round((completed / habits.length) * 15);
  } else {
    habitScore += 10;
  }
  if ((habitLog.meditationMinutes || 0) >= 10) {
    habitScore += 10;
  } else if ((habitLog.meditationMinutes || 0) > 0) {
    habitScore += 5;
  }
  score += Math.min(25, habitScore);

  return Math.min(100, Math.max(0, score));
}

// Get habits for date
router.get('/', authenticate, (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  let log = db.habitLogs().find(h => h.userId === req.user.id && h.date === date);

  if (!log) {
    log = {
      id: `hlog_${Date.now()}`,
      userId: req.user.id,
      date,
      waterMl: 0,
      steps: 0,
      sleepHours: 0,
      sleepQuality: 3,
      sleepNotes: '',
      meditationMinutes: 0,
      wellnessScore: 0,
      habits: [
        { id: 'h1', name: 'Drink 500ml water upon waking', completed: false },
        { id: 'h2', name: '10-minute morning stretch or meditation', completed: false },
        { id: 'h3', name: 'Hit daily step target', completed: false },
        { id: 'h4', name: 'Log all meals and stay hydrated', completed: false },
        { id: 'h5', name: 'Wind down screen-free 30 min before bed', completed: false }
      ]
    };
    db.habitLogs().push(log);
    db.save();
  }

  log.wellnessScore = calculateWellnessScore(log, req.user);
  res.json(log);
});

// Update daily habits
router.post('/', authenticate, (req, res) => {
  try {
    const { date, waterMl, steps, sleepHours, sleepQuality, sleepNotes, meditationMinutes, habits } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let log = db.habitLogs().find(h => h.userId === req.user.id && h.date === targetDate);
    if (!log) {
      log = {
        id: `hlog_${Date.now()}`,
        userId: req.user.id,
        date: targetDate,
        waterMl: 0,
        steps: 0,
        sleepHours: 0,
        sleepQuality: 3,
        sleepNotes: '',
        meditationMinutes: 0,
        wellnessScore: 0,
        habits: []
      };
      db.habitLogs().push(log);
    }

    if (waterMl !== undefined) log.waterMl = Number(waterMl);
    if (steps !== undefined) log.steps = Number(steps);
    if (sleepHours !== undefined) log.sleepHours = Number(sleepHours);
    if (sleepQuality !== undefined) log.sleepQuality = Number(sleepQuality);
    if (sleepNotes !== undefined) log.sleepNotes = sleepNotes;
    if (meditationMinutes !== undefined) log.meditationMinutes = Number(meditationMinutes);
    if (habits !== undefined) log.habits = habits;

    log.wellnessScore = calculateWellnessScore(log, req.user);

    // Gamification
    const user = db.users().find(u => u.id === req.user.id);
    user.xp = (user.xp || 0) + 15;

    db.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update daily habits' });
  }
});

// Add custom habit
router.post('/custom', authenticate, (req, res) => {
  const { name, date } = req.body;
  if (!name) return res.status(400).json({ error: 'Habit name is required.' });

  const targetDate = date || new Date().toISOString().split('T')[0];
  let log = db.habitLogs().find(h => h.userId === req.user.id && h.date === targetDate);

  const customHabit = {
    id: `ch_${Date.now()}`,
    name,
    completed: false,
    isCustom: true
  };

  if (!log) {
    log = {
      id: `hlog_${Date.now()}`,
      userId: req.user.id,
      date: targetDate,
      waterMl: 0,
      steps: 0,
      sleepHours: 7,
      sleepQuality: 4,
      meditationMinutes: 0,
      wellnessScore: 50,
      habits: [customHabit]
    };
    db.habitLogs().push(log);
  } else {
    log.habits.push(customHabit);
  }

  db.save();
  res.status(201).json(log);
});

// Toggle habit status
router.post('/toggle', authenticate, (req, res) => {
  const { habitId, date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  let log = db.habitLogs().find(h => h.userId === req.user.id && h.date === targetDate);

  if (!log) return res.status(404).json({ error: 'Habit log not found.' });

  const targetHabit = log.habits.find(h => h.id === habitId);
  if (!targetHabit) return res.status(404).json({ error: 'Habit not found.' });

  targetHabit.completed = !targetHabit.completed;
  log.wellnessScore = calculateWellnessScore(log, req.user);

  db.save();
  res.json(log);
});

export default router;
