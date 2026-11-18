import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all challenges
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;
  const list = db.challenges().map(c => ({
    ...c,
    isJoined: (c.joinedUsers || []).includes(userId),
    userProgress: (c.joinedUsers || []).includes(userId) ? 65 : 0 // sample progress percentage
  }));
  res.json(list);
});

// Join a challenge
router.post('/:id/join', authenticate, (req, res) => {
  const challenge = db.challenges().find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

  if (!challenge.joinedUsers) challenge.joinedUsers = [];
  if (!challenge.joinedUsers.includes(req.user.id)) {
    challenge.joinedUsers.push(req.user.id);
    challenge.participantsCount = (challenge.participantsCount || 0) + 1;
    
    // User XP bonus for joining
    const user = db.users().find(u => u.id === req.user.id);
    user.xp = (user.xp || 0) + 50;

    db.save();
  }

  res.json({ message: 'Successfully joined challenge!', challenge });
});

// Get badges
router.get('/badges', authenticate, (req, res) => {
  const userId = req.user.id;
  const list = db.badges().map(b => ({
    ...b,
    isUnlocked: (b.unlockedUsers || []).includes(userId)
  }));
  res.json(list);
});

// Get leaderboard
router.get('/leaderboard', authenticate, (req, res) => {
  const users = db.users()
    .filter(u => u.allowLeaderboard !== false)
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      xp: u.xp || 0,
      level: u.level || 'Bronze I',
      streak: u.streak || 0,
      fitnessGoal: u.fitnessGoal
    }))
    .sort((a, b) => b.xp - a.xp);

  // Assign ranks
  const ranked = users.map((u, index) => ({
    ...u,
    rank: index + 1
  }));

  res.json(ranked);
});

export default router;
