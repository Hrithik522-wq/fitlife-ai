import React, { useState } from 'react';
import { X, Scale, Camera, AlertCircle, Sparkles, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

export function LogProgressModal({ isOpen, onClose, onProgressLogged }) {
  const { user, refreshUser } = useAuth();
  const { unit } = useTheme();
  const { success, error } = useNotification();

  const [weight, setWeight] = useState(user?.weight || 64);
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');
  const [thigh, setThigh] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoTag, setPhotoTag] = useState('Front View');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        weight: Number(weight),
        height: user?.height || 170,
        bodyFat: bodyFat ? Number(bodyFat) : undefined,
        waist: waist ? Number(waist) : undefined,
        chest: chest ? Number(chest) : undefined,
        arm: arm ? Number(arm) : undefined,
        thigh: thigh ? Number(thigh) : undefined,
        notes,
        date: new Date().toISOString().split('T')[0]
      };

      await api.progress.logProgress(payload);

      // If photo attached, upload it
      if (photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('tag', photoTag);
        formData.append('notes', notes);
        await api.progress.uploadPhoto(formData);
      }

      success('Body metrics & progress recorded successfully!', 'Metrics Updated');
      refreshUser();
      if (onProgressLogged) onProgressLogged();
      onClose();
    } catch (err) {
      error(err.message, 'Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-navy-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Log Body Measurements</h2>
              <span className="text-[11px] text-slate-400">Track weight, circumference, body composition & photos</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Weight & Body Fat */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Body Weight ({unit === 'metric' ? 'kg' : 'lbs'}) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs font-bold text-white focus:border-brand-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="60"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="e.g. 21.5"
                className="w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:border-brand-neon"
              />
            </div>
          </div>

          {/* Circumference Measurements */}
          <div className="p-3.5 rounded-2xl bg-navy-850 border border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Circumference Metrics ({unit === 'metric' ? 'cm' : 'inches'})
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Waist</label>
                <input
                  type="number"
                  step="0.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="72"
                  className="w-full px-2 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs text-center text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Chest</label>
                <input
                  type="number"
                  step="0.5"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  placeholder="88"
                  className="w-full px-2 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs text-center text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Arm / Bicep</label>
                <input
                  type="number"
                  step="0.5"
                  value={arm}
                  onChange={(e) => setArm(e.target.value)}
                  placeholder="29"
                  className="w-full px-2 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs text-center text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Thigh</label>
                <input
                  type="number"
                  step="0.5"
                  value={thigh}
                  onChange={(e) => setThigh(e.target.value)}
                  placeholder="55"
                  className="w-full px-2 py-1.5 rounded-lg bg-navy-900 border border-slate-700 text-xs text-center text-white"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Optional Progress Photo
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-800 border border-dashed border-slate-700 hover:border-brand-neon cursor-pointer text-xs text-slate-400 hover:text-white transition-colors">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>{photo ? photo.name : 'Upload front/side view photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              <select
                value={photoTag}
                onChange={(e) => setPhotoTag(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-300"
              >
                <option value="Front View">Front View</option>
                <option value="Side Profile">Side Profile</option>
                <option value="Back View">Back View</option>
              </select>
            </div>

            {photoPreview && (
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 mt-2">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Feeling</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clothes feeling looser around waist; stamina feeling high..."
              className="w-full p-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-brand-neon"
            />
          </div>

          {/* Medical Disclaimer Alert */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5 text-[11px] text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Disclaimer: BMI and body-fat estimates are calculated for general wellness tracking and educational purposes, not clinical medical diagnosis.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover text-navy-950 font-black text-xs flex items-center justify-center gap-2 shadow-neon-sm disabled:opacity-50"
          >
            {loading ? 'Saving Metrics...' : 'Save Progress Entry'}
            <Sparkles className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
