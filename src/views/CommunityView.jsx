import React, { useState, useEffect } from 'react';
import { 
  Users, Heart, MessageSquare, Share2, Plus, Flag, 
  Send, UserPlus, UserCheck, ShieldAlert, X, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function CommunityView() {
  const { user } = useAuth();
  const { success, error } = useNotification();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Workout Shared');
  const [newImage, setNewImage] = useState(null);

  // Selected User Profile Modal
  const [viewedProfile, setViewedProfile] = useState(null);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    loadCommunityFeed();
  }, [user]);

  const loadCommunityFeed = async () => {
    try {
      setLoading(true);
      const data = await api.social.getPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (id) => {
    try {
      const res = await api.social.likePost(id);
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            hasLiked: res.hasLiked,
            likesCount: res.likesCount
          };
        }
        return p;
      }));
    } catch (err) {}
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const newComment = await api.social.commentPost(postId, commentText);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
            commentsCount: (p.commentsCount || 0) + 1
          };
        }
        return p;
      }));
      setCommentInputs({ ...commentInputs, [postId]: '' });
      success('Comment added!', 'Social');
    } catch (err) {
      error(err.message, 'Failed to comment');
    }
  };

  const handleReportPost = async (id) => {
    const reason = window.prompt('Please enter the reason for reporting this post:');
    if (!reason) return;
    try {
      await api.social.reportPost(id, reason);
      success('Post reported to moderation team.', 'Report Received');
    } catch (err) {
      error(err.message, 'Failed to report');
    }
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim() && !newImage) return;

    try {
      const formData = new FormData();
      formData.append('content', newContent);
      formData.append('tag', newTag);
      if (newImage) formData.append('image', newImage);

      await api.social.createPost(formData);
      success('Post shared with the FitLife AI community! (+30 XP)', 'Posted');
      setNewContent('');
      setNewImage(null);
      setShowCreateModal(false);
      loadCommunityFeed();
    } catch (err) {
      error(err.message, 'Failed to post');
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      const profile = await api.social.getUserProfile(userId);
      setViewedProfile(profile);
    } catch (err) {}
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-neon" />
            FitLife Community & Social
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Share training milestones, support fellow fitness enthusiasts, and celebrate progress together.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-neon-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Share New Post
        </button>
      </div>

      {/* Main Feed Column */}
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map(post => (
          <div key={post.id} className="rounded-3xl bg-navy-850 border border-slate-700/80 overflow-hidden shadow-xl">
            
            {/* Post Author Info */}
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div 
                onClick={() => handleViewProfile(post.userId)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-brand-neon transition-colors"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-neon transition-colors">
                    {post.authorName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {post.tag}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleReportPost(post.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-navy-800 transition-colors"
                title="Report post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 sm:px-5 pb-3">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="w-full max-h-96 overflow-hidden bg-navy-900 border-y border-slate-800">
                <img
                  src={post.imageUrl}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Like & Comment Bar */}
            <div className="p-4 sm:p-5 bg-navy-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    post.hasLiked ? 'text-red-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                  <span>{post.likesCount || 0} Likes</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount || 0} Comments</span>
                </div>
              </div>

              <span className="text-[10px] text-brand-neon font-bold">
                FitLife Community
              </span>
            </div>

            {/* Comments Section */}
            <div className="p-4 sm:p-5 bg-navy-900 border-t border-slate-800 space-y-3">
              {(post.comments || []).map(c => (
                <div key={c.id} className="text-xs flex items-start gap-2">
                  <strong className="text-white shrink-0">{c.authorName}:</strong>
                  <span className="text-slate-300">{c.text}</span>
                </div>
              ))}

              {/* Add Comment Input */}
              <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  placeholder="Cheer on your fitness partner..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        ))}
      </div>

      {/* Share New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-slate-700/80 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Share Workout Achievement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tag / Category</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
                >
                  <option value="Workout Shared">Workout Shared</option>
                  <option value="Personal Record (PR)">Personal Record (PR)</option>
                  <option value="Nutrition & Meal">Nutrition & Meal</option>
                  <option value="Transformation">Transformation</option>
                  <option value="Motivation">Motivation & Mindset</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">What's on your mind?</label>
                <textarea
                  rows="3"
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Smashed my pull workout! Hit 8 clean pull-ups today..."
                  className="w-full p-3 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Optional Photo</label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-800 border border-dashed border-slate-700 hover:border-brand-neon cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                  <ImageIcon className="w-4 h-4 text-brand-neon" />
                  <span>{newImage ? newImage.name : 'Upload workout snapshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs"
              >
                Post to FitLife Community
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {viewedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-navy-900 border border-slate-700 shadow-2xl p-6 text-center space-y-4">
            <button
              onClick={() => setViewedProfile(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={viewedProfile.avatar}
              alt={viewedProfile.name}
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-brand-neon shadow-neon-sm"
            />

            <div>
              <h3 className="text-base font-extrabold text-white">{viewedProfile.name}</h3>
              <p className="text-xs text-brand-neon font-semibold">{viewedProfile.level} • {viewedProfile.fitnessGoal}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-xl bg-navy-850">
                <span className="text-[10px] text-slate-400 block">Streak</span>
                <span className="font-bold text-orange-400">🔥 {viewedProfile.streak}d</span>
              </div>
              <div className="p-2 rounded-xl bg-navy-850">
                <span className="text-[10px] text-slate-400 block">Workouts</span>
                <span className="font-bold text-white">{viewedProfile.workoutsCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-navy-850">
                <span className="text-[10px] text-slate-400 block">Badges</span>
                <span className="font-bold text-amber-400">{viewedProfile.badgesEarned}</span>
              </div>
            </div>

            <button
              onClick={() => {
                success(`Followed ${viewedProfile.name}!`, 'Social');
                setViewedProfile(null);
              }}
              className="w-full py-2 rounded-xl bg-brand-neon text-navy-950 font-bold text-xs"
            >
              + Follow Athlete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
