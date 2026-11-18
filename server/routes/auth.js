import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

function calculateCalorieGoal(user) {
  const weight = user.weight || 70;
  const height = user.height || 175;
  const age = user.age || 25;
  const gender = (user.gender || 'male').toLowerCase();
  
  // Mifflin-St Jeor formula
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'female' ? bmr - 161 : bmr + 5;

  let multiplier = 1.375; // light activity default
  if (user.weeklyAvailability >= 5) multiplier = 1.725;
  else if (user.weeklyAvailability >= 3) multiplier = 1.55;

  let tdee = Math.round(bmr * multiplier);
  
  const goal = (user.fitnessGoal || '').toLowerCase();
  if (goal.includes('loss') || goal.includes('deficit')) {
    return Math.max(1400, tdee - 500);
  } else if (goal.includes('gain') || goal.includes('bulk') || goal.includes('strength')) {
    return tdee + 350;
  }
  return tdee;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, age, gender, height, weight, targetWeight,
      fitnessGoal, fitnessLevel, location, equipment, weeklyAvailability,
      dietaryPreference
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      age: Number(age) || 25,
      gender: gender || 'Other',
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      targetWeight: Number(targetWeight) || Number(weight) || 70,
      fitnessGoal: fitnessGoal || 'General fitness',
      fitnessLevel: fitnessLevel || 'Beginner',
      location: location || 'Home',
      equipment: Array.isArray(equipment) ? equipment : ['Bodyweight'],
      weeklyAvailability: Number(weeklyAvailability) || 3,
      dietaryPreference: dietaryPreference || 'Vegetarian',
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 120,
      dailyCarbsGoal: 220,
      dailyFatGoal: 55,
      dailyWaterGoal: 3000,
      dailyStepGoal: 10000,
      dailySleepGoal: 8,
      xp: 100,
      level: 'Bronze I',
      streak: 1,
      isPublic: true,
      allowLeaderboard: true,
      units: 'metric',
      theme: 'dark',
      notifications: {
        workoutReminder: true,
        workoutTime: '18:00',
        waterReminder: true,
        waterIntervalHours: 2,
        mealReminder: true,
        streakReminder: true
      },
      createdAt: new Date().toISOString()
    };

    newUser.dailyCalorieGoal = calculateCalorieGoal(newUser);
    // Protein: ~1.8g per kg for active
    newUser.dailyProteinGoal = Math.round((newUser.weight || 70) * 1.8);

    db.users().push(newUser);
    db.save();

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userSafe } = user;

    res.json({ user: userSafe, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to process login' });
  }
});

// Google simulated auth
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google authentication data missing.' });
    }

    let user = db.users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user_g_${Date.now()}`,
        name: name || 'Google Fitness Member',
        email: email.toLowerCase(),
        password: 'oauth_authenticated_user',
        role: 'user',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        age: 26,
        gender: 'Other',
        height: 172,
        weight: 68,
        targetWeight: 65,
        fitnessGoal: 'General fitness',
        fitnessLevel: 'Beginner',
        location: 'Home',
        equipment: ['Bodyweight', 'Dumbbells'],
        weeklyAvailability: 4,
        dietaryPreference: 'Vegetarian',
        dailyCalorieGoal: 2100,
        dailyProteinGoal: 120,
        dailyCarbsGoal: 230,
        dailyFatGoal: 60,
        dailyWaterGoal: 3000,
        dailyStepGoal: 10000,
        dailySleepGoal: 8,
        xp: 150,
        level: 'Bronze I',
        streak: 1,
        isPublic: true,
        allowLeaderboard: true,
        units: 'metric',
        theme: 'dark',
        notifications: {
          workoutReminder: true,
          workoutTime: '18:00',
          waterReminder: true,
          waterIntervalHours: 2,
          mealReminder: true,
          streakReminder: true
        },
        createdAt: new Date().toISOString()
      };
      db.users().push(user);
      db.save();
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = db.users().find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }
  // Simulate sending email reset link
  res.json({
    message: `Password reset link and temporary code (FITLIFE-7729) sent to ${email}.`,
    resetCode: 'FITLIFE-7729'
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const user = db.users().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  db.save();
  res.json({ message: 'Password has been reset successfully. You may now log in.' });
});

// Current User Me
router.get('/me', authenticate, (req, res) => {
  const { password: _, ...userSafe } = req.user;
  res.json({ user: userSafe });
});

// Update Profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const user = db.users().find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const fields = [
      'name', 'age', 'gender', 'height', 'weight', 'targetWeight',
      'fitnessGoal', 'fitnessLevel', 'location', 'equipment',
      'weeklyAvailability', 'dietaryPreference', 'dailyCalorieGoal',
      'dailyProteinGoal', 'dailyCarbsGoal', 'dailyFatGoal',
      'dailyWaterGoal', 'dailyStepGoal', 'dailySleepGoal',
      'isPublic', 'allowLeaderboard', 'units', 'theme', 'notifications'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    db.save();
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload Avatar
router.post('/avatar', authenticate, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    const user = db.users().find(u => u.id === req.user.id);
    user.avatar = `/uploads/${req.file.filename}`;
    db.save();
    res.json({ avatar: user.avatar, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Change Password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    const user = db.users().find(u => u.id === req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    db.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete Account
router.delete('/account', authenticate, (req, res) => {
  try {
    const userIndex = db.users().findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      db.users().splice(userIndex, 1);
      db.save();
    }
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
