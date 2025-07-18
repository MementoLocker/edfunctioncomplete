import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Download, Shield, ArrowLeft, Headphones, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

const musicGenres = [
  {
    id: 1,
    name: 'Cinematic Score',
    description: 'Epic orchestral compositions perfect for dramatic storytelling, film trailers, and emotional moments.',
    trackCount: 2,
    color: 'from-purple-500 to-indigo-600',
    icon: '🎬',
    sampleTracks: [
      {
        id: 'coastal-echoes',
        title: 'Coastal Echoes',
        url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Coastal%20Echoes.mp3'
      },
      {
        id: 'sad-memory',
        title: 'Sad Memory',
        url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Sad%20Memory.wav'
      }
    ]
  },
  {
    id: 2,
    name: 'Classical (Modern Minimalist)',
    description: 'Contemporary classical pieces with clean, minimalist arrangements ideal for sophisticated projects.',
    trackCount: 0,
    color: 'from-blue-500 to-cyan-600',
    icon: '🎼',
    sampleTracks: []
  },
  {
    id: 3,
    name: 'Advertisement',
    description: 'Upbeat, engaging tracks designed specifically for commercials, marketing videos, and promotional content.',
    trackCount: 0,
    color: 'from-green-500 to-emerald-600',
    icon: '📢',
    sampleTracks: []
  },
  {
    id: 4,
    name: 'Ambient',
    description: 'Atmospheric soundscapes and gentle textures perfect for background music and contemplative moments.',
    trackCount: 0,
    color: 'from-teal-500 to-blue-600',
    icon: '🌊',
    sampleTracks: []
  },
  {
    id: 5,
    name: 'Celtic',
    description: 'Traditional and modern Celtic melodies featuring authentic instruments and mystical atmospheres.',
    trackCount: 0,
    color: 'from-emerald-500 to-green-600',
    icon: '🍀',
    sampleTracks: []
  }
];

export const MusicLibrary: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const togglePlayPause = (trackUrl: string, trackId: string) => {
    // Prevent event bubbling to parent container
    event?.stopPropagation();
    
    if (currentlyPlaying === trackId) {
      // Stop current track
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing track
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      // Start new track
      const audio = new Audio(trackUrl);
      audio.addEventListener('ended', () => setCurrentlyPlaying(null));
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setCurrentlyPlaying(null);
      });
      
      audio.play().then(() => {
        setCurrentlyPlaying(trackId);
        setAudioElement(audio);
      }).catch((error) => {
        console.error('Playback failed:', error);
        setCurrentlyPlaying(null);
      });
    }
  };

  const handleGetAccess = () => {
    // Navigate to pricing section on homepage
    window.location.href = '/#pricing';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl lg:text-6xl font-bold gradient-text mb-6">
            Instrumental Music Library - Coming Soon
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            We're building a curated collection of original instrumental tracks with full personal and commercial use rights. 
            This will be perfect for your creative projects, business ventures, advertisements, and more.
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-8 max-w-4xl mx-auto border border-amber-200">
            <div className="flex items-center justify-center mb-4">
              <Music className="w-12 h-12 text-amber-600 mr-4" />
              <h2 className="text-3xl font-bold text-amber-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                Music Library Coming Soon!
              </h2>
            </div>
            <p className="text-amber-700 text-lg mb-6">
              We're currently working hard to curate and produce an amazing collection of professional instrumental music. 
              Our music library will launch shortly after the main platform goes live.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <strong className="text-amber-800">🎵 High-Quality Tracks</strong>
                <p className="text-amber-600 mt-1">Professional compositions across multiple genres</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <strong className="text-amber-800">📜 Full Commercial Rights</strong>
                <p className="text-amber-600 mt-1">Use in any project without royalty concerns</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <strong className="text-amber-800">🔄 Regular Updates</strong>
                <p className="text-amber-600 mt-1">New tracks added monthly to expand your options</p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 opacity-75"
        >
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Full Commercial Rights
            </h3>
            <p className="text-gray-600">
              Every track will come with complete personal and commercial use rights. No royalties, no restrictions.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              High-Quality Downloads
            </h3>
            <p className="text-gray-600">
              High-quality downloads will be ready for your projects.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Growing Library
            </h3>
            <p className="text-gray-600">
              New tracks will be added monthly across all genres to expand your creative options.
            </p>
          </div>
        </motion.div>

        {/* Music Genres */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 opacity-75"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
            Music Genres (Preview)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {musicGenres.map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`bg-white rounded-lg p-8 shadow-lg border border-gray-200 transition-all duration-300 cursor-not-allowed relative ${
                  selectedGenre === genre.id ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                {/* Coming Soon Overlay for each genre */}
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Coming Soon</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${genre.color} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl`}>
                    {genre.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {genre.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {genre.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span className="flex items-center">
                      <Music className="w-4 h-4 mr-2" />
                      {genre.trackCount} tracks (coming soon)
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                      Premium
                    </span>
                  </div>

                  {selectedGenre === genre.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-gray-200 pt-6"
                    >
                      {genre.sampleTracks && genre.sampleTracks.length > 0 ? (
                        // Genre with sample tracks
                        <div className="space-y-3">
                          {genre.sampleTracks.map((track) => (
                            <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">{track.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlayPause(track.url, track.id);
                                }}
                                className="text-amber-600 hover:text-amber-700 transition-colors"
                              >
                                {currentlyPlaying === track.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                          <p className="text-xs text-gray-500 mt-2 italic">
                            * Sample tracks - Full library coming soon
                          </p>
                        </div>
                      ) : (
                        // Genres without sample tracks
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            Sample tracks coming soon...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-12 max-w-4xl mx-auto text-white opacity-75">
            <h3 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Music Library Coming Soon!
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              We're working hard to bring you an amazing collection of professional instrumental tracks with 
              full commercial rights. Perfect for creators, businesses, and content producers.
            </p>
            <div className="space-y-4">
              <button
                disabled={true}
                className="bg-gray-300 text-gray-600 cursor-not-allowed font-medium px-8 py-4 rounded-lg text-lg uppercase tracking-wider"
              >
                Coming Soon
              </button>
              <p className="text-sm opacity-75">
                Launch date to be announced soon
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};