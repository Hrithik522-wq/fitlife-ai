import express from 'express';
import { db } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get community feed
router.get('/posts', authenticate, (req, res) => {
  const userId = req.user.id;
  const posts = db.socialPosts().map(p => ({
    ...p,
    hasLiked: (p.likes || []).includes(userId),
    likesCount: (p.likes || []).length,
    commentsCount: (p.comments || []).length
  }));
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(posts);
});

// Create post
router.post('/posts', authenticate, upload.single('image'), (req, res) => {
  try {
    const { content, tag } = req.body;
    if (!content && !req.file) {
      return res.status(400).json({ error: 'Post content or image is required.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newPost = {
      id: `post_${Date.now()}`,
      userId: req.user.id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      content: content || '',
      tag: tag || 'General Fitness',
      imageUrl,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString()
    };

    db.socialPosts().push(newPost);

    // XP bonus
    const user = db.users().find(u => u.id === req.user.id);
    user.xp = (user.xp || 0) + 30;

    db.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like or unlike post
router.post('/posts/:id/like', authenticate, (req, res) => {
  const post = db.socialPosts().find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (!post.likes) post.likes = [];
  const idx = post.likes.indexOf(req.user.id);
  let hasLiked = false;

  if (idx === -1) {
    post.likes.push(req.user.id);
    hasLiked = true;
  } else {
    post.likes.splice(idx, 1);
    hasLiked = false;
  }

  db.save();
  res.json({ hasLiked, likesCount: post.likes.length });
});

// Comment on post
router.post('/posts/:id/comment', authenticate, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text is required.' });

  const post = db.socialPosts().find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const newComment = {
    id: `c_${Date.now()}`,
    userId: req.user.id,
    authorName: req.user.name,
    text,
    timestamp: new Date().toISOString()
  };

  if (!post.comments) post.comments = [];
  post.comments.push(newComment);

  db.save();
  res.status(201).json(newComment);
});

// Report post
router.post('/posts/:id/report', authenticate, (req, res) => {
  const { reason } = req.body;
  const post = db.socialPosts().find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const reportedItem = {
    id: `report_${Date.now()}`,
    postId: post.id,
    postContent: post.content,
    reportedByUserId: req.user.id,
    authorId: post.userId,
    authorName: post.authorName,
    reason: reason || 'Inappropriate content',
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  db.reportedPosts().push(reportedItem);
  db.save();

  res.json({ message: 'Post reported to moderation team. Thank you for keeping our community safe.' });
});

// User public profile
router.get('/users/:id', authenticate, (req, res) => {
  const targetUser = db.users().find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  const workoutsCount = db.workoutLogs().filter(w => w.userId === targetUser.id).length;
  const badgesEarned = db.badges().filter(b => (b.unlockedUsers || []).includes(targetUser.id)).length;

  res.json({
    id: targetUser.id,
    name: targetUser.name,
    avatar: targetUser.avatar,
    fitnessGoal: targetUser.fitnessGoal,
    fitnessLevel: targetUser.fitnessLevel,
    streak: targetUser.streak || 0,
    level: targetUser.level || 'Bronze I',
    xp: targetUser.xp || 0,
    workoutsCount,
    badgesEarned,
    isFollowing: false // simulated social graph
  });
});

export default router;
