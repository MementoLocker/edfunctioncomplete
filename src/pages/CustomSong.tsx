import React, { useState, useEffect, useRef } from 'react';
import { Music, Heart, Star, Mail, User, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export const CustomSong: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  // Scroll to waitlist section when component mounts from navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'waitlist') {
      setTimeout(() => {
        const waitlistSection = document.getElementById('waitlist-section');
        if (waitlistSection) {
          waitlistSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          name: name.trim(),
          email: email.trim(),
          service: 'customsong',
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="two-column">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Custom Songs for Your Memories
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your most precious memories into a personalized song. Our talented musicians 
                  create unique compositions that capture the essence of your story in melody and lyrics.
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
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

      {/* Compact Sample Song Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
              Sample Custom Song
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listen to this example of a custom song created for a special 10th birthday celebration. 
              This demonstrates the personal touch and emotional depth we bring to every composition.
            </p>
          </motion.div>

          {/* Compact Song Display Box with Background Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <div 
              className="relative rounded-2xl p-8 shadow-xl border border-gray-100 overflow-hidden"
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
                  <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {sampleSong.title}
                  </h3>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)',
                      boxShadow: isPlaying ? '0 8px 25px rgba(192, 161, 114, 0.4)' : '0 4px 15px rgba(192, 161, 114, 0.3)'
                    }}
                  >
                    {/* Play/Pause Icon */}
                    <div className="relative z-10">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white ml-0" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Refined Sample Note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                <strong>Note:</strong> This is a sample composition created for demonstration purposes. 
                Your custom song will be uniquely crafted based on your personal story and preferences.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon & Waitlist Section */}
      <section id="waitlist-section" className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-6 py-3 bg-amber-100 rounded-none" style={{ backgroundColor: '#C0A172', color: 'white' }}>
              <Music className="w-5 h-5 mr-2" />
              <span className="font-medium uppercase tracking-wider">Coming Soon</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
              Be the First to Know
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're putting the finishing touches on our custom song service. Join our exclusive waitlist 
              to be notified when we launch and receive special early-bird pricing.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-none p-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  You're on the list!
                </h3>
                <p className="text-green-700">
                  Thank you for joining our waitlist. We'll notify you as soon as custom songs are available, 
                  along with exclusive early-bird pricing just for you.
                </p>
              </motion.div>
            ) : (
              <div className="bg-white rounded-none p-8 shadow-lg">
                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-none focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{ focusRingColor: '#C0A172' }}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-none focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{ focusRingColor: '#C0A172' }}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-none font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    style={{ backgroundColor: '#C0A172', color: 'white' }}
                  >
                    {loading ? 'Joining...' : 'Join the Waitlist'}
                  </button>

                  <p className="text-sm text-gray-500 uppercase tracking-wider">
                    We'll never spam you. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
              How Custom Songs Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple process transforms your memories into a beautiful, personalized song.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Share Your Story',
                description: 'Tell us about your memories, relationships, and special moments. The more details you share, the more personal your song becomes.',
                icon: Heart
              },
              {
                step: 2,
                title: 'We Compose',
                description: 'Our talented musicians create original lyrics and melody based on your story, choosing a style that fits your preferences.',
                icon: Music
              },
              {
                step: 3,
                title: 'Receive Your Song',
                description: 'Get your professionally recorded custom song, ready to be shared with loved ones or included in your time capsules.',
                icon: Star
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-none p-8 text-center shadow-lg border border-gray-200"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-none flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#C0A172' }}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold" style={{ backgroundColor: '#C0A172' }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};