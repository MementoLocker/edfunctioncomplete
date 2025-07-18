import React, { useState } from 'react';
import { Star, Upload, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const LeaveReview: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [service, setService] = useState<'timecapsule' | 'customsong'>('timecapsule');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rating || !comment.trim()) return;

    setLoading(true);
    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // Insert review
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
          rating,
          comment: comment.trim(),
          service,
          photo_url: photoUrl,
          verified: false, // Will be manually verified by admin
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-dusty-800 mb-4">
            Sign In Required
          </h1>
          <p className="text-dusty-600 mb-8">
            Please sign in to leave a review.
          </p>
          <button className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-success-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-dusty-800 mb-4">
            Thank You!
          </h1>
          <p className="text-dusty-600 mb-8">
            Your review has been submitted and will be published after verification. 
            We appreciate you taking the time to share your experience!
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-serif font-bold gradient-text mb-4">
            Share Your Experience
          </h1>
          <p className="text-xl text-dusty-600 max-w-2xl mx-auto">
            Help others discover our service by sharing your story. Your review will be featured 
            on our website after verification.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Selection */}
            <div>
              <label className="block text-lg font-medium text-dusty-700 mb-4">
                Which service are you reviewing?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setService('timecapsule')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    service === 'timecapsule'
                      ? 'border-dusty-500 bg-dusty-50'
                      : 'border-dusty-200 hover:border-dusty-300'
                  }`}
                >
                  <h3 className="font-semibold text-dusty-800">Time Capsules</h3>
                  <p className="text-sm text-dusty-600">Digital memory preservation</p>
                </button>
                <button
                  type="button"
                  onClick={() => setService('customsong')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    service === 'customsong'
                      ? 'border-dusty-500 bg-dusty-50'
                      : 'border-dusty-200 hover:border-dusty-300'
                  }`}
                >
                  <h3 className="font-semibold text-dusty-800">Custom Songs</h3>
                  <p className="text-sm text-dusty-600">Personalized music creation</p>
                </button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-lg font-medium text-dusty-700 mb-4">
                How would you rate your experience?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-current'
                          : 'text-dusty-300'
                      }`}
                      style={{ 
                        color: star <= (hoveredRating || rating) ? '#C0A172' : undefined 
                      }}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-dusty-600">
                  {rating === 5 && "Excellent! We're thrilled you loved it."}
                  {rating === 4 && "Great! We're so glad you had a positive experience."}
                  {rating === 3 && "Good! We appreciate your feedback."}
                  {rating === 2 && "We're sorry it wasn't better. Your feedback helps us improve."}
                  {rating === 1 && "We're sorry to hear that. Please let us know how we can do better."}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-lg font-medium text-dusty-700 mb-4">
                Tell us about your experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-dusty-200 rounded-lg focus:ring-2 focus:ring-dusty-500 focus:border-transparent"
                placeholder="Share your story... What did you love about our service? How did it help you preserve your memories?"
                required
              />
              <p className="mt-2 text-sm text-dusty-500">
                Your review will help others understand the value of our service. Please be honest and detailed.
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-lg font-medium text-dusty-700 mb-4">
                Add a photo (optional)
              </label>
              <div className="flex items-start space-x-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-dusty-300 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-dusty-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="btn-outline cursor-pointer inline-block"
                  >
                    Choose Photo
                  </label>
                  <p className="text-sm text-dusty-500 mt-2">
                    A photo helps build trust with potential customers
                  </p>
                  <p className="text-xs text-dusty-400 mt-1">
                    Note: Surnames are omitted in public reviews to protect your online privacy
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={!rating || !comment.trim() || loading}
                className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <p className="text-sm text-dusty-500 mt-4">
                Your review will be verified before being published on our website.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};