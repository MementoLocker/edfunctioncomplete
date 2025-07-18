import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, ArrowRight, Play, Pause, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomSongSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sampleSong = {
    title: "Sophie's 10th Birthday",
    audioUrl: "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Sophies%2010th%20Birthday.wav"
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check if audio is still playing when component mounts/remounts
  useEffect(() => {
    if (audioRef.current && !audioRef.current.paused) {
      setIsPlaying(true);
    }
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) {
      const audio = new Audio(sampleSong.audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        alert('Unable to play audio. Please check your connection.');
        setIsPlaying(false);
      });
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Playback failed:', error);
        alert('Unable to play audio. Please check your connection.');
        setIsPlaying(false);
      });
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset to beginning when stopping
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Playback failed:', error);
          alert('Unable to play audio. Please check your connection.');
          setIsPlaying(false);
        });
      }
    }
  };

  return (
    <section className="section-padding bg-gray-50">
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
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Custom Songs for Your Memories - Coming Soon
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                We're preparing to transform your most precious memories into personalized songs. Our talented musicians 
                will create unique compositions that capture the essence of your story in melody and lyrics.
              </p>
            </div>

            {/* Compact Sample Song Display with Background Image */}
            <div 
              className="relative rounded-2xl p-8 shadow-xl border border-gray-100 max-w-sm overflow-hidden"
              style={{
                backgroundImage: 'url(/src/assets/Gemini_Generated_Image_voocpvoocpvoocpv copy.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-white bg-opacity-85 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {sampleSong.title}
                  </h3>
                  <p className="text-sm text-gray-600">Sample Custom Song</p>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)',
                      boxShadow: isPlaying ? '0 8px 25px rgba(192, 161, 114, 0.4)' : '0 4px 15px rgba(192, 161, 114, 0.3)'
                    }}
                  >
                    {/* Play/Pause Icon */}
                    <div className="relative z-10">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white ml-0" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Refined Sample Note */}
            <div className="max-w-sm">
              <p className="text-sm text-gray-500 leading-relaxed">
                <strong>Note:</strong> This is a sample composition created for demonstration purposes. 
                Your custom song will be uniquely crafted based on your personal story and preferences.
              </p>
            </div>

            <div className="bg-white rounded-none p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                What Makes Our Custom Songs Special?
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Star className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>Professionally composed and recorded by experienced musicians</span>
                </li>
                <li className="flex items-start">
                  <Heart className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>Lyrics written from your personal stories and memories</span>
                </li>
                <li className="flex items-start">
                  <Music className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3" style={{ color: '#C0A172' }} />
                  <span>Multiple musical styles available to match your preference</span>
                </li>
              </ul>
            </div>

            <Link
              to="/custom-song"
              className="btn-primary inline-flex items-center group"
            >
              Coming Soon - Join Waitlist
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
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
                src="https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Professional music studio with mixing desk and warm atmospheric lighting"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};