import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 22;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Get user progress logs
router.get('/', authenticate, (req, res) => {
  const logs = db.progressLogs().filter(p => p.userId === req.user.id);
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(logs);
});

// Log progress metrics
router.post('/', authenticate, (req, res) => {
  try {
    const { weight, height, bodyFat, waist, chest, arm, thigh, hips, notes, date } = req.body;
    const user = db.users().find(u => u.id === req.user.id);

    const weightVal = Number(weight) || user.weight || 70;
    const heightVal = Number(height) || user.height || 170;
    const bmiVal = calculateBmi(weightVal, heightVal);

    const newLog = {
      id: `plog_${Date.now()}`,
      userId: req.user.id,
      date: date || new Date().toISOString().split('T')[0],
      weight: weightVal,
      height: heightVal,
      bmi: bmiVal,
      bmiCategory: getBmiCategory(bmiVal),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      waist: waist ? Number(waist) : undefined,
      chest: chest ? Number(chest) : undefined,
      arm: arm ? Number(arm) : undefined,
      thigh: thigh ? Number(thigh) : undefined,
      hips: hips ? Number(hips) : undefined,
      notes: notes || '',
      loggedAt: new Date().toISOString()
    };

    // Update user's current weight
    user.weight = weightVal;
    user.xp = (user.xp || 0) + 50;

    db.progressLogs().push(newLog);
    db.save();

    res.status(201).json(newLog);
  } catch (err) {
    console.error('Error recording progress:', err);
    res.status(500).json({ error: 'Failed to record progress metrics' });
  }
});

// Upload progress photo
router.post('/photo', authenticate, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const { date, tag, notes } = req.body;
    const photoUrl = `/uploads/${req.file.filename}`;
    const logDate = date || new Date().toISOString().split('T')[0];

    let progressLog = db.progressLogs().find(p => p.userId === req.user.id && p.date === logDate);
    if (!progressLog) {
      const user = req.user;
      progressLog = {
        id: `plog_${Date.now()}`,
        userId: user.id,
        date: logDate,
        weight: user.weight || 70,
        height: user.height || 170,
        bmi: calculateBmi(user.weight || 70, user.height || 170),
        photoUrl,
        photoTag: tag || 'Front view',
        notes: notes || '',
        loggedAt: new Date().toISOString()
      };
      db.progressLogs().push(progressLog);
    } else {
      progressLog.photoUrl = photoUrl;
      progressLog.photoTag = tag || 'Front view';
    }

    db.save();
    res.status(201).json({ photoUrl, progressLog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload progress photo' });
  }
});

// Delete progress log
router.delete('/:id', authenticate, (req, res) => {
  const index = db.progressLogs().findIndex(p => p.id === req.params.id && p.userId === req.user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Progress log not found.' });
  }
  db.progressLogs().splice(index, 1);
  db.save();
  res.json({ message: 'Progress log removed.' });
});

// Get comparison and goal analysis
router.get('/comparison', authenticate, (req, res) => {
  const logs = db.progressLogs().filter(p => p.userId === req.user.id);
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (logs.length === 0) {
    return res.json({ hasData: false });
  }

  const initial = logs[0];
  const current = logs[logs.length - 1];
  const user = req.user;
  const targetWeight = user.targetWeight || user.weight || 70;

  // Weight goal completion
  const totalWeightDiffGoal = Math.abs(initial.weight - targetWeight);
  const currentWeightDiff = Math.abs(current.weight - targetWeight);
  let completionPct = 0;
  if (totalWeightDiffGoal > 0) {
    completionPct = Math.min(100, Math.round(((totalWeightDiffGoal - currentWeightDiff) / totalWeightDiffGoal) * 100));
  } else {
    completionPct = 100;
  }
  if (completionPct < 0) completionPct = 0;

  res.json({
    hasData: true,
    initial,
    current,
    weightChange: Math.round((current.weight - initial.weight) * 10) / 10,
    waistChange: (current.waist && initial.waist) ? Math.round((current.waist - initial.waist) * 10) / 10 : null,
    bodyFatChange: (current.bodyFat && initial.bodyFat) ? Math.round((current.bodyFat - initial.bodyFat) * 10) / 10 : null,
    targetWeight,
    completionPercentage: completionPct
  });
});

export default router;
