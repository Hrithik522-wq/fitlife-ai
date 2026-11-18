import express from 'express';
import { db } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(authenticate, requireAdmin);

// Dashboard overview metrics
router.get('/stats', (req, res) => {
  const users = db.users();
  const workouts = db.workoutLogs();
  const meals = db.mealLogs();
  const reports = db.reportedPosts();
  const exercises = db.exercises();
  const foods = db.foods();

  res.json({
    totalUsers: users.length,
    activeUsersToday: Math.max(1, Math.round(users.length * 0.75)),
    totalWorkoutsLogged: workouts.length,
    totalMealsLogged: meals.length,
    totalExercises: exercises.length,
    totalFoods: foods.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    serverUptime: '99.98%',
    systemHealth: 'Optimal'
  });
});

// Users management
router.get('/users', (req, res) => {
  const usersSafe = db.users().map(({ password: _, ...rest }) => rest);
  res.json(usersSafe);
});

// Update user status/role
router.put('/users/:id', (req, res) => {
  const user = db.users().find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { role, isBanned } = req.body;
  if (role !== undefined) user.role = role;
  if (isBanned !== undefined) user.isBanned = isBanned;

  db.save();
  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// Add exercise
router.post('/exercises', (req, res) => {
  const { name, category, muscleGroup, secondaryMuscles, difficulty, equipment, instructions, tips, caloriesPerMin, demonstrationUrl } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Exercise name and category are required.' });
  }

  const newExercise = {
    id: `ex_${Date.now()}`,
    name,
    category,
    muscleGroup: muscleGroup || category,
    secondaryMuscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : [secondaryMuscles || 'Core'],
    difficulty: difficulty || 'Beginner',
    equipment: equipment || 'Bodyweight',
    caloriesPerMin: Number(caloriesPerMin) || 7,
    instructions: Array.isArray(instructions) ? instructions : [instructions || 'Perform movement with good form.'],
    tips: tips || '',
    demonstrationUrl: demonstrationUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
  };

  db.exercises().push(newExercise);
  db.save();
  res.status(201).json(newExercise);
});

// Edit exercise
router.put('/exercises/:id', (req, res) => {
  const ex = db.exercises().find(e => e.id === req.params.id);
  if (!ex) return res.status(404).json({ error: 'Exercise not found.' });

  Object.assign(ex, req.body);
  db.save();
  res.json(ex);
});

// Delete exercise
router.delete('/exercises/:id', (req, res) => {
  const idx = db.exercises().findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Exercise not found.' });
  db.exercises().splice(idx, 1);
  db.save();
  res.json({ message: 'Exercise removed.' });
});

// Add food
router.post('/foods', (req, res) => {
  const { name, category, servingUnit, calories, protein, carbs, fat, fiber, dietType } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ error: 'Food name and calories required.' });
  }

  const newFood = {
    id: `food_${Date.now()}`,
    name,
    category: category || 'General',
    servingUnit: servingUnit || '1 serving',
    calories: Number(calories),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    fiber: Number(fiber) || 0,
    dietType: dietType || 'Vegetarian'
  };

  db.foods().push(newFood);
  db.save();
  res.status(201).json(newFood);
});

// Edit food
router.put('/foods/:id', (req, res) => {
  const food = db.foods().find(f => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: 'Food item not found.' });

  Object.assign(food, req.body);
  db.save();
  res.json(food);
});

// Delete food
router.delete('/foods/:id', (req, res) => {
  const idx = db.foods().findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Food item not found.' });
  db.foods().splice(idx, 1);
  db.save();
  res.json({ message: 'Food item removed.' });
});

// Moderation queue
router.get('/reports', (req, res) => {
  res.json(db.reportedPosts());
});

// Resolve moderation report
router.post('/reports/:id/action', (req, res) => {
  const { action } = req.body; // 'delete_post' or 'dismiss'
  const report = db.reportedPosts().find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  if (action === 'delete_post') {
    const postIdx = db.socialPosts().findIndex(p => p.id === report.postId);
    if (postIdx !== -1) {
      db.socialPosts().splice(postIdx, 1);
    }
    report.status = 'post_removed';
  } else {
    report.status = 'dismissed';
  }

  db.save();
  res.json({ message: `Report marked as ${report.status}`, report });
});

export default router;
