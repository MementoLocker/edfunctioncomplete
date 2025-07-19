import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Headphones, Download, Shield, ArrowRight, Play, Pause, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InstrumentalMusicSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const sampleTracks = [
    {
      id: 'coastal-echoes',
      title: 'Coastal Echoes',
      genre: 'Cinematic Score',
      url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Coastal%20Echoes.mp3'
    },
    {
      id: 'sad-memory',
      title: 'Sad Memory',
      genre: 'Cinematic Score',
      url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Sad%20Memory.wav'
    },
    {
      id: 'journey',
      title: 'Journey',
      genre: 'Cinematic Score',
      url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Journey.mp3'
    }
  ];

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
      });
    };
  }, [audioElements]);

  const handleExploreLibrary = () => {
    // Navigate to the dedicated music library page
    navigate('/music-library');
  };

  const togglePlayPause = (trackId: string, trackUrl: string) => {
    if (currentlyPlaying === trackId) {
      // Stop current track
      if (audioElements[trackId]) {
        audioElements[trackId].pause();
        audioElements[trackId].currentTime = 0;
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing track
      if (currentlyPlaying && audioElements[currentlyPlaying]) {
        audioElements[currentlyPlaying].pause();
        audioElements[currentlyPlaying].currentTime = 0;
      }
      
      // Start new track
      let audio = audioElements[trackId];
      if (!audio) {
        audio = new Audio(trackUrl);
        audio.addEventListener('ended', () => setCurrentlyPlaying(null));
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setCurrentlyPlaying(null);
        });
        setAudioElements(prev => ({ ...prev, [trackId]: audio }));
      }
      
      audio.play().then(() => {
        setCurrentlyPlaying(trackId);
      }).catch((error) => {
        console.error('Playback failed:', error);
        setCurrentlyPlaying(null);
      });
    }
  };

  return (
    <section id="music-library" className="section-padding bg-white">
      <div className="container-max">
        <div className="two-column">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
                Inspire Your Projects with Our Instrumental Music - Coming Soon
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                We're building an amazing library of original instrumental tracks, perfect for your personal projects, 
                business ventures, advertisements, short films, and more. Our curated collection will feature 
                professionally composed music across multiple genres and moods.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Every track will come with full personal and commercial use rights, empowering your creativity 
                without royalty concerns. Whether you're creating content, building presentations, or 
                enhancing your time capsules, our music library will provide the perfect soundtrack.
              </p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <Music className="w-6 h-6 text-amber-600 mr-3" />
                <h3 className="font-bold text-amber-800">Music Library Coming Soon!</h3>
              </div>
              <p className="text-amber-700 text-sm">
                We're currently curating and producing high-quality instrumental tracks for our music library. 
                This feature will be available shortly after launch. Stay tuned for updates!
              </p>
            </div>

            {/* Sample Tracks Preview */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                🎵 Sample Tracks Preview
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Here's a taste of what's coming to our music library:
              </p>
              <div className="space-y-3">
                {sampleTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{track.title}</div>
                      <div className="text-sm text-gray-500">{track.genre}</div>
                    </div>
                    <button
                      onClick={() => togglePlayPause(track.id, track.url)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                      style={{ color: '#C0A172' }}
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                * These are sample tracks to demonstrate quality. Full library coming soon.
              </p>
            </div>
            
            <div className="bg-white rounded-none p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                What Will Be Included in Our Music Library?
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Music className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>Original instrumental compositions across multiple genres</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>Full personal and commercial use rights included</span>
                </li>
                <li className="flex items-start">
                  <Download className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>High-quality downloads</span>
                </li>
                <li className="flex items-start">
                  <Headphones className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>New tracks added monthly to expand your options</span>
                </li>
              </ul>
            </div>

            <button
              disabled={true}
              className="bg-gray-300 text-gray-500 cursor-not-allowed inline-flex items-center group px-8 py-4 rounded-none font-medium transition-all duration-300 uppercase tracking-wider text-sm"
            >
              Coming Soon
              <Music className="w-5 h-5 ml-2" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-full h-96 rounded-none overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Professional music production studio with audio equipment and waveform visualization"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Audio waveform overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-none pointer-events-none">
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end space-x-1 h-12">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/80 rounded-sm animate-pulse"
                      style={{
                        width: '4px',
                        height: `${Math.random() * 100 + 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        backgroundColor: '#C0A172'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};