import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Heart,
  Calendar,
  User
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

interface SlideshowPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  senderName: string;
  titleFont: string;
  messageFont: string;
  titleSize: string;
  messageSize: string;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientDirection: string;
  secondaryColor: string;
  transitionEffect: string;
  transitionSpeed: string;
  mediaFiles: MediaFile[];
  deliveryDate?: string;
  slideDuration?: number;
  backgroundMusic?: {
    id: string;
    title: string;
    url: string;
    genre: string;
  } | null;
}

export const SlideshowPreview: React.FC<SlideshowPreviewProps> = ({
  isOpen,
  onClose,
  title,
  message,
  senderName,
  titleFont,
  messageFont,
  titleSize,
  messageSize,
  backgroundColor,
  backgroundType,
  gradientDirection,
  secondaryColor,
  transitionEffect,
  transitionSpeed,
  mediaFiles,
  deliveryDate = "Today",
  slideDuration = 5000,
  backgroundMusic
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);
  const [currentSlideDuration, setCurrentSlideDuration] = useState(slideDuration);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [originalMusicVolume] = useState(0.3); // Store original volume

  // Create slides array
  const slides = [
    { type: 'title', content: { title, message } },
    ...mediaFiles.map(file => ({ type: file.type, content: file })),
    { type: 'closing', content: { senderName, deliveryDate } }
  ];

  // Get transition variants based on selected effect and speed
  const getTransitionVariants = () => {
    const getDuration = () => {
      switch (transitionSpeed) {
        case 'slow': return 1.2;
        case 'fast': return 0.5;
        default: return 0.8; // medium
      }
    };

    const duration = getDuration();
    const ease = "easeInOut";

    switch (transitionEffect) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 },
          transition: { duration, ease }
        };
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 100 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -100 },
          transition: { duration, ease }
        };
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -100 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 100 },
          transition: { duration, ease }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 },
          transition: { duration, ease }
        };
      case 'zoomOut':
        return {
          initial: { opacity: 0, scale: 1.2 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
          transition: { duration, ease }
        };
      case 'flipHorizontal':
        return {
          initial: { opacity: 0, rotateY: -90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: 90 },
          transition: { duration, ease }
        };
      case 'flipVertical':
        return {
          initial: { opacity: 0, rotateX: -90 },
          animate: { opacity: 1, rotateX: 0 },
          exit: { opacity: 0, rotateX: 90 },
          transition: { duration, ease }
        };
      case 'rotate':
        return {
          initial: { opacity: 0, rotate: -180 },
          animate: { opacity: 1, rotate: 0 },
          exit: { opacity: 0, rotate: 180 },
          transition: { duration, ease }
        };
      case 'spiral':
        return {
          initial: { opacity: 0, scale: 0.5, rotate: -360 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          exit: { opacity: 0, scale: 0.5, rotate: 360 },
          transition: { duration: duration * 1.5, ease }
        };
      case 'blur':
        return {
          initial: { opacity: 0, filter: 'blur(10px)' },
          animate: { opacity: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, filter: 'blur(10px)' },
          transition: { duration, ease }
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3, y: 50 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.3, y: -50 },
          transition: { 
            duration, 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }
        };
      case 'elastic':
        return {
          initial: { opacity: 0, scale: 0.5 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.5 },
          transition: { 
            duration, 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }
        };
      case 'curtain':
        return {
          initial: { opacity: 0, scaleY: 0, transformOrigin: 'top' },
          animate: { opacity: 1, scaleY: 1 },
          exit: { opacity: 0, scaleY: 0, transformOrigin: 'bottom' },
          transition: { duration, ease }
        };
      case 'wave':
        return {
          initial: { opacity: 0, x: 30, rotate: 5 },
          animate: { opacity: 1, x: 0, rotate: 0 },
          exit: { opacity: 0, x: -30, rotate: -5 },
          transition: { duration, ease }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, ease }
        };
    }
  };

  // Update slide duration based on current slide type
  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    if (currentSlideData?.type === 'video') {
      // For videos, use a longer duration or let video control timing
      setCurrentSlideDuration(slideDuration * 3); // 3x longer for videos
    } else if (currentSlideData?.type === 'audio') {
      // For audio, use longer duration
      setCurrentSlideDuration(slideDuration * 2); // 2x longer for audio
    } else {
      setCurrentSlideDuration(slideDuration);
    }
  }, [currentSlide, slideDuration]);

  // Background music management
  useEffect(() => {
    if (backgroundMusic && isOpen) {
      // Start background music
      const audio = new Audio(backgroundMusic.url);
      audio.loop = true;
      audio.volume = originalMusicVolume; // Use original volume
      
      audio.play().catch((error) => {
        console.error('Background music playback failed:', error);
      });
      
      backgroundMusicRef.current = audio;
    }

    return () => {
      // Cleanup background music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, [backgroundMusic, isOpen]);

  // Handle video audio detection and music volume adjustment
  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    
    if (currentSlideData?.type === 'video' && videoRef.current && backgroundMusicRef.current) {
      const video = videoRef.current;
      
      // Check if video has audio track
      const hasAudio = video.mozHasAudio || 
                      Boolean(video.webkitAudioDecodedByteCount) || 
                      Boolean(video.audioTracks && video.audioTracks.length) ||
                      // Fallback: assume video has audio if it's not muted
                      !video.muted;
      
      if (hasAudio) {
        // Reduce background music volume to 40% of original
        backgroundMusicRef.current.volume = originalMusicVolume * 0.4;
      }
      
      // Listen for video events
      const handleVideoPlay = () => {
        if (backgroundMusicRef.current && hasAudio) {
          backgroundMusicRef.current.volume = originalMusicVolume * 0.4;
        }
      };
      
      const handleVideoPause = () => {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.volume = originalMusicVolume;
        }
      };
      
      const handleVideoEnded = () => {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.volume = originalMusicVolume;
        }
      };
      
      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('ended', handleVideoEnded);
      
      // Cleanup event listeners
      return () => {
        video.removeEventListener('play', handleVideoPlay);
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('ended', handleVideoEnded);
      };
    } else if (backgroundMusicRef.current) {
      // Restore original volume for non-video slides
      backgroundMusicRef.current.volume = originalMusicVolume;
    }
  }, [currentSlide, originalMusicVolume]);

  // Handle mute for background music
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-advance slides
  useEffect(() => {
    if (isPlaying && isOpen) {
      intervalRef.current = setInterval(() => {
        setSlideProgress(prev => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + (100 / (currentSlideDuration / 100));
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => { 
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isOpen, currentSlide, currentSlideDuration]);

  // Reset progress when slide changes
  useEffect(() => {
    setSlideProgress(0);
  }, [currentSlide]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    if (isOpen) {
      resetTimeout();
      const handleMouseMove = () => resetTimeout();
      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, [isOpen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Escape':
          onClose();
          break;
        case 'm':
          setIsMuted(!isMuted);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, isMuted]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const restart = () => {
    setCurrentSlide(0);
    setSlideProgress(0);
    setIsPlaying(true);
    
    // Restart background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch(console.error);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      if (gradientDirection === 'radial') {
        return {
          background: `radial-gradient(circle, ${backgroundColor}, ${secondaryColor})`
        };
      } else {
        const directionMap: { [key: string]: string } = {
          'to-b': 'to bottom',
          'to-r': 'to right',
          'to-br': 'to bottom right', 
          'to-bl': 'to bottom left'
        };
        const direction = directionMap[gradientDirection] || 'to bottom';
        return {
          background: `linear-gradient(${direction}, ${backgroundColor}, ${secondaryColor})`
        };
      }
    }
    return { backgroundColor };
  };

  const currentSlideData = slides[currentSlide];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={getBackgroundStyle()}
      />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-20 z-20">
        <div className="flex h-full">
          {slides.map((_, index) => (
            <div key={index} className="flex-1 bg-white bg-opacity-30 mx-px">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ 
                  width: index < currentSlide ? '100%' : 
                         index === currentSlide ? `${slideProgress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-30 flex items-center space-x-3"
          >
            <button
              onClick={restart}
              className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <AnimatePresence>
        {showControls && slides.length > 1 && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Slide Indicators */}
      <AnimatePresence>
        {showControls && slides.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 z-30 w-full flex justify-between px-8"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            {...getTransitionVariants()}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Title Slide */}
            {currentSlideData.type === 'title' && (
              <div className="text-center max-w-4xl space-y-8">
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`${titleSize} font-bold text-gray-800 leading-tight`}
                    style={{ fontFamily: titleFont }}
                  >
                    {title}
                  </motion.h1>
                )}
                
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="prose prose-lg max-w-none"
                  >
                    <p 
                      className={`${messageSize} text-gray-700 leading-relaxed whitespace-pre-wrap`}
                      style={{ fontFamily: messageFont }}
                    >
                      {message}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Image Slide */}
            {currentSlideData.type === 'image' && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src={(currentSlideData.content as MediaFile).url}
                alt={(currentSlideData.content as MediaFile).name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}

            {/* Video Slide */}
            {currentSlideData.type === 'video' && (
              <motion.video
                ref={videoRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src={(currentSlideData.content as MediaFile).url}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                controls
                autoPlay
                muted={isMuted}
                onEnded={() => {
                  setSlideProgress(100);
                  setTimeout(nextSlide, 100);
                }}
              />
            )}

            {/* Audio Slide */}
            {currentSlideData.type === 'audio' && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl mx-auto"
                >
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Volume2 className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: titleFont }}
                >
                  {(currentSlideData.content as MediaFile).name}
                </motion.h3>
                
                <audio
                  ref={audioRef}
                  src={(currentSlideData.content as MediaFile).url}
                  controls
                  autoPlay
                  muted={isMuted}
                  onEnded={nextSlide}
                  className="mx-auto"
                />
              </div>
            )}

            {/* Closing Slide */}
            {currentSlideData.type === 'closing' && (
              <div className="text-center max-w-2xl space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                >
                  <Heart className="w-12 h-12 text-white" fill="currentColor" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl font-bold text-gray-800"
                  style={{ fontFamily: titleFont }}
                >
                  With Love
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="text-lg" style={{ fontFamily: messageFont }}>
                      From: {senderName}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg" style={{ fontFamily: messageFont }}>
                      Delivered: {deliveryDate}
                    </span>
                  </div>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="text-sm text-gray-500 italic"
                  style={{ fontFamily: messageFont }}
                >
                  Created with MementoLocker
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Help */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 z-30 text-white text-xs space-y-1 bg-black bg-opacity-50 p-3 rounded-lg"
          >
            <div>← → Navigate</div>
            <div>Space Play/Pause</div>
            <div>M Mute</div>
            <div>Esc Exit</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};