import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Image as ImageIcon, 
  Music, 
  FileText,
  Eye,
  Calendar,
  Users,
  User,
  Palette,
  Type,
  Settings,
  Crown,
  GripVertical,
  Save,
  Video
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';
import { supabase } from '../lib/supabase';
import { ToastNotification } from '../components/ToastNotification';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

export const CreateCapsule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCapsuleId = searchParams.get('edit');
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [recipients, setRecipients] = useState([{ name: '', email: '' }]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('12:00');
  
  // Customization state
  const [titleFont, setTitleFont] = useState('Playfair Display, serif');
  const [messageFont, setMessageFont] = useState('Inter, sans-serif');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FDF8F1');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#F4F6F7');
  const [slideDuration, setSlideDuration] = useState(5);
  const [backgroundMusic, setBackgroundMusic] = useState<{
    id: string;
    title: string;
    url: string;
    genre: string;
  } | null>(null);
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  
  // UI state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'customize' | 'recipients'>('details');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showFileArrangement, setShowFileArrangement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [savingDraft, setSavingDraft] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customAudioInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load existing capsule data if editing
  useEffect(() => {
    if (editCapsuleId && user) {
      loadCapsuleData(editCapsuleId);
    }
  }, [editCapsuleId, user]);

  const loadCapsuleForEditing = async (capsuleId: string) => {
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setMessage(data.message || '');
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        setDeliveryDate(data.delivery_date ? new Date(data.delivery_date).toISOString().split('T')[0] : '');
        
        // Load media files from URLs
        if (data.files && Array.isArray(data.files)) {
          const loadedFiles: MediaFile[] = [];
          for (const fileData of data.files) {
            // Create a placeholder File object for existing files
            const response = await fetch(fileData.url);
            const blob = await response.blob();
            const file = new File([blob], fileData.name, { type: blob.type });
            
            loadedFiles.push({
              id: fileData.id,
              file: file,
              type: fileData.type,
              url: fileData.url,
              name: fileData.name,
              size: fileData.size
            });
          }
          setMediaFiles(loadedFiles);
        }
        
        // Load customization settings
        if (data.customization) {
          const custom = data.customization;
          setTitleFont(custom.titleFont || 'Playfair Display, serif');
          setMessageFont(custom.messageFont || 'Inter, sans-serif');
          setTitleSize(custom.titleSize || 'text-4xl');
          setMessageSize(custom.messageSize || 'text-lg');
          setBackgroundColor(custom.backgroundColor || '#FFFFFF');
          setBackgroundType(custom.backgroundType || 'solid');
          setGradientDirection(custom.gradientDirection || 'to-b');
          setSecondaryColor(custom.secondaryColor || '#F3F4F6');
          setTransitionEffect(custom.transitionEffect || 'fade');
          setTransitionSpeed(custom.transitionSpeed || 'medium');
          setSlideDuration(custom.slideDuration || 5000);
          if (custom.backgroundMusic) {
            setSelectedBackgroundMusic(custom.backgroundMusic);
          }
        }
      }
    } catch (error) {
      console.error('Error loading capsule for editing:', error);
      triggerToast('Failed to load capsule for editing', 'error');
    }
  };
  const loadCapsuleData = async (capsuleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        // Load basic details
        setTitle(data.title || '');
        setMessage(data.message || '');
        setSenderName(data.sender_name || '');
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        
        // Format delivery date and time
        if (data.delivery_date) {
          const deliveryDateTime = new Date(data.delivery_date);
          setDeliveryDate(deliveryDateTime.toISOString().split('T')[0]);
          setDeliveryTime(deliveryDateTime.toTimeString().slice(0, 5));
        }

        // Load customization settings
        const customization = data.customization || {};
        setTitleFont(customization.titleFont || 'Playfair Display, serif');
        setMessageFont(customization.messageFont || 'Inter, sans-serif');
        setTitleSize(customization.titleSize || 'text-4xl');
        setMessageSize(customization.messageSize || 'text-lg');
        setBackgroundColor(customization.backgroundColor || '#FDF8F1');
        setBackgroundType(customization.backgroundType || 'solid');
        setGradientDirection(customization.gradientDirection || 'to-b');
        setSecondaryColor(customization.secondaryColor || '#F4F6F7');
        setSlideDuration(customization.slideDuration || 5);
        setTransitionEffect(customization.transitionEffect || 'fade');
        setTransitionSpeed(customization.transitionSpeed || 'medium');
        
        // Handle media files - show info about previous files but don't try to restore them
        if (data.files && (data.files.count > 0 || data.files.length > 0)) {
          const fileCount = data.files.count || data.files.length || 0;
          triggerToast(`This draft had ${fileCount} media file(s). Please re-upload your media files to continue.`, 'info');
          // Clear any existing media files since we can't restore them
          setMediaFiles([]);
        }

        // Load media files - Note: In a real implementation, you'd need to handle file reconstruction
        // For now, we'll show a message that files need to be re-uploaded
        if (data.files && data.files.length > 0) {
          triggerToast(`This capsule has ${data.files.length} media files. You may need to re-upload them if you want to make changes.`, 'info');
        }

        triggerToast('Draft loaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load draft. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Available music tracks from your library
  const musicLibrary = [
    {
      id: 'coastal-echoes',
      title: 'Coastal Echoes',
      url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Coastal%20Echoes.mp3',
      genre: 'Cinematic Score',
      description: 'Epic orchestral composition perfect for emotional storytelling'
    }
    // Additional tracks would be loaded from your music library API
  ];

  const transitionEffects = [
    { id: 'fade', name: 'Fade', description: 'Classic smooth fade in/out' },
    { id: 'slide', name: 'Slide', description: 'Slide from right to left' },
    { id: 'slideUp', name: 'Slide Up', description: 'Slide from bottom to top' },
    { id: 'slideDown', name: 'Slide Down', description: 'Slide from top to bottom' },
    { id: 'zoom', name: 'Zoom In', description: 'Zoom in from center' },
    { id: 'zoomOut', name: 'Zoom Out', description: 'Zoom out from center' },
    { id: 'flipHorizontal', name: 'Flip Horizontal', description: 'Horizontal flip transition' },
    { id: 'flipVertical', name: 'Flip Vertical', description: 'Vertical flip transition' },
    { id: 'rotate', name: 'Rotate', description: 'Rotate into view' },
    { id: 'spiral', name: 'Spiral', description: 'Spiral motion with scaling' },
    { id: 'blur', name: 'Blur', description: 'Blur transition effect' },
    { id: 'bounce', name: 'Bounce', description: 'Bouncy spring entrance' },
    { id: 'elastic', name: 'Elastic', description: 'Elastic spring animation' },
    { id: 'curtain', name: 'Curtain', description: 'Curtain reveal effect' },
    { id: 'wave', name: 'Wave', description: 'Wave-like motion' }
  ];

  const speedOptions = [
    { id: 'slow', name: 'Slow', description: 'Graceful and deliberate (1.2s)' },
    { id: 'medium', name: 'Medium', description: 'Balanced and smooth (0.8s)' },
    { id: 'fast', name: 'Fast', description: 'Quick and fluid (0.5s)' }
  ];

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 5GB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images, videos, or audio files.';
    }

    return null;
  };

  // Get file type from MIME type
  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // fallback
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    const newFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      newFiles.push(mediaFile);
    }

    setMediaFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Check authentication - moved after all hooks
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to create a time capsule.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Remove file
  const removeFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Audio playback
  const toggleAudio = (fileId: string, url: string) => {
    if (playingAudio === fileId) {
      audioRefs.current[fileId]?.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      Object.values(audioRefs.current).forEach(audio => audio.pause());
      
      if (!audioRefs.current[fileId]) {
        audioRefs.current[fileId] = new Audio(url);
        audioRefs.current[fileId].addEventListener('ended', () => {
          setPlayingAudio(null);
        });
      }
      
      audioRefs.current[fileId].play();
      setPlayingAudio(fileId);
    }
  };

  // Add recipient
  const addRecipient = () => {
    setRecipients(prev => [...prev, { name: '', email: '' }]);
  };

  // Remove recipient
  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  // Update recipient
  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    setRecipients(prev => prev.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    ));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get background style for preview
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

  const toggleMusicPlayback = (track: typeof musicLibrary[0]) => {
    if (currentlyPlaying === track.id) {
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
      const audio = new Audio(track.url);
      audio.addEventListener('ended', () => setCurrentlyPlaying(null));
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setCurrentlyPlaying(null);
      });
      
      audio.play().then(() => {
        setCurrentlyPlaying(track.id);
        setAudioElement(audio);
      }).catch((error) => {
        console.error('Playback failed:', error);
        setCurrentlyPlaying(null);
      });
    }
  };

  const selectBackgroundMusic = (track: typeof musicLibrary[0]) => {
    setBackgroundMusic(track);
    setShowMusicLibrary(false);
    // Stop any currently playing preview
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setCurrentlyPlaying(null);
  };

  const removeBackgroundMusic = () => {
    setBackgroundMusic(null);
    // Clean up custom audio
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl(null);
    }
    setCustomAudioFile(null);
    // Stop any currently playing music
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setCurrentlyPlaying(null);
  };

  // Handle custom audio upload
  const handleCustomAudioUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/m4a'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an audio file (MP3, WAV, OGG, M4A)');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('Audio file must be less than 50MB');
      return;
    }

    // Clean up previous custom audio
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
    }

    // Create object URL and set as background music
    const url = URL.createObjectURL(file);
    setCustomAudioFile(file);
    setCustomAudioUrl(url);
    
    // Set as background music
    setBackgroundMusic({
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      url: url,
      genre: 'Custom Upload'
    });
  };

  // Handle file arrangement save
  const handleFileArrangementSave = (reorderedFiles: MediaFile[]) => {
    setMediaFiles(reorderedFiles);
    setShowFileArrangement(false);
  };

  // Handle form submission
  const handleSubmit = async (saveAsDraft = false) => {
    if (!saveAsDraft) {
      // Full validation for final submission
      if (!title.trim()) {
        alert('Please enter a title for your time capsule');
        return;
      }
      
      if (!senderName.trim()) {
        alert('Please enter a sender name');
        return;
      }

      if (!deliveryDate) {
        alert('Please select a delivery date');
        return;
      }

      if (recipients.some(r => !r.name.trim() || !r.email.trim())) {
        alert('Please fill in all recipient information');
        return;
      }
    } else {
      // Minimal validation for draft
      if (!title.trim()) {
        triggerToast('Please enter a title to save as draft', 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      // Upload media files to Supabase Storage first
      const uploadedFiles = [];
      for (const mediaFile of mediaFiles) {
        const fileExt = mediaFile.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, mediaFile.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        uploadedFiles.push({
          id: mediaFile.id,
          name: mediaFile.name,
          type: mediaFile.type,
          url: publicUrl,
          size: mediaFile.size
        });
      }

      // Prepare delivery date
      let finalDeliveryDate = deliveryDate;
      if (!finalDeliveryDate && saveAsDraft) {
        // Set default delivery date to 30 days from now for drafts
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        finalDeliveryDate = defaultDate.toISOString().split('T')[0];
      }

      // Combine date and time
      const deliveryDateTime = new Date(`${finalDeliveryDate}T${deliveryTime}`);
      console.log('Starting draft save process...');
      

      // Filter out empty recipients for drafts
      const validRecipients = saveAsDraft 
        ? recipients.filter(r => r.name.trim() || r.email.trim())
        : recipients;
      
      // Simplified data structure for debugging
      const capsuleData = {
        title: title.trim(),
        message: message.trim() || null,
        recipients: validRecipients,
        delivery_date: `${finalDeliveryDate}T${deliveryTime}:00.000Z`,
        files: mediaFiles.map(file => ({
        files: uploadedFiles,
          name: file.name,
          type: file.type,
          size: file.size
        })),
        customization: {
          senderName: senderName.trim() || null,
          titleFont,
          messageFont,
          titleSize,
          messageSize,
          backgroundColor,
          backgroundType,
          gradientDirection,
          secondaryColor,
          slideDuration,
          transitionEffect,
          transitionSpeed,
          backgroundMusic
        }
      };

      const result = await supabase
        .from('capsules')
        .insert({
          user_id: user.id,
          ...capsuleData
        });

      if (result.error) {
        console.error('Insert error:', result.error);
        throw result.error;
      }

      console.log('Draft saved successfully');

      if (saveAsDraft) {
        triggerToast('Draft saved successfully!', 'success');
        setTimeout(() => {
          navigate('/my-capsules');
        }, 2000);
      } else {
        triggerToast('Time capsule saved successfully!', 'success');
        setTimeout(() => {
          navigate('/my-capsules');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to save draft. Please try again.';
      if (error.message) {
        errorMessage = `Failed to save draft: ${error.message}`;
      }
      
      triggerToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    handleSubmit(true);
  };

  const handleFinalSubmit = () => {
    handleSubmit(false);
  };

  if (loading && editCapsuleId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4" style={{ borderColor: '#C0A172' }}></div>
          <p className="text-gray-600">Loading your time capsule...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'arrange', label: 'Arrange Files', icon: GripVertical },
    { id: 'customize', label: 'Customize', icon: Palette },
    { id: 'recipients', label: 'Recipients', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            {editCapsuleId ? 'Edit Your Time Capsule' : 'Create Your Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {editCapsuleId 
              ? 'Make changes to your time capsule and save your updates.'
              : 'Preserve your precious memories and schedule them to be delivered at the perfect moment.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: '#C0A172', color: 'white' } : {}}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Capsule Details
                  </h2>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Give your time capsule a meaningful title..."
                      maxLength={100}
                      required
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {title.length}/100
                    </div>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      From (Sender Name) *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., Mom & Dad, Your Family, Grandpa Joe..."
                      maxLength={50}
                      required
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {senderName.length}/50
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      placeholder="Write a heartfelt message to accompany your memories..."
                      maxLength={2000}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {message.length}/2000
                    </div>
                  </div>

                  {/* Delivery Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time
                      </label>
                      <input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Upload Media
                  </h2>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Upload your memories
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Choose Files'}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      Supports images, videos, and audio files • Max file size: 5GB per file
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded Files */}
                  {mediaFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">
                          Uploaded Media ({mediaFiles.length})
                        </h3>
                        <button
                          onClick={() => setActiveTab('arrange')}
                          className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                        >
                          <GripVertical className="w-4 h-4" />
                          <span>Arrange Files</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mediaFiles.map((file) => (
                          <div key={file.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {file.type === 'image' && <ImageIcon className="w-5 h-5 text-blue-500" />}
                                {file.type === 'video' && <Video className="w-5 h-5 text-green-500" />}
                                {file.type === 'audio' && <Music className="w-5 h-5 text-purple-500" />}
                                <div>
                                  <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Media Preview */}
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                              {file.type === 'image' && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-48 object-contain"
                                />
                              )}
                              {file.type === 'video' && (
                                <video
                                  src={file.url}
                                  className="w-full h-48 object-contain"
                                  controls
                                />
                              )}
                              {file.type === 'audio' && (
                                <div className="h-48 flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <Music className="w-8 h-8 text-purple-600" />
                                  </div>
                                  <button
                                    onClick={() => toggleAudio(file.id, file.url)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    {playingAudio === file.id ? (
                                      <>
                                        <Pause className="w-4 h-4" />
                                        <span>Pause</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4" />
                                        <span>Play</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Arrange Files Tab */}
              {activeTab === 'arrange' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Arrange Files for Slideshow
                  </h2>
                  
                  {mediaFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <GripVertical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No files uploaded yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Upload some media files first to arrange their order
                      </p>
                      <button
                        onClick={() => setActiveTab('media')}
                        className="btn-primary"
                      >
                        Upload Files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-6">
                        This is the order your files will appear in the slideshow. The file arrangement will be opened in a modal for better organization.
                      </p>
                      <button
                        onClick={() => setShowFileArrangement(true)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <GripVertical className="w-5 h-5" />
                        <span>Open File Arrangement</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Customize Appearance
                  </h2>

                  {/* Typography */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Typography</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title Font
                        </label>
                        <select
                          value={titleFont}
                          onChange={(e) => setTitleFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          {/* Serif Fonts */}
                          <optgroup label="Serif Fonts">
                            <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                            <option value="Merriweather, serif">Merriweather</option>
                            <option value="Crimson Text, serif">Crimson Text</option>
                            <option value="Libre Baskerville, serif">Libre Baskerville</option>
                            <option value="Lora, serif">Lora</option>
                            <option value="Cormorant Garamond, serif">Cormorant Garamond</option>
                            <option value="EB Garamond, serif">EB Garamond</option>
                            <option value="Spectral, serif">Spectral</option>
                            <option value="Vollkorn, serif">Vollkorn</option>
                            <option value="Alegreya, serif">Alegreya</option>
                            <option value="Cardo, serif">Cardo</option>
                            <option value="Gentium Plus, serif">Gentium Plus</option>
                            <option value="Neuton, serif">Neuton</option>
                            <option value="Old Standard TT, serif">Old Standard TT</option>
                            <option value="PT Serif, serif">PT Serif</option>
                            <option value="Rokkitt, serif">Rokkitt</option>
                            <option value="Source Serif Pro, serif">Source Serif Pro</option>
                            <option value="Tinos, serif">Tinos</option>
                            <option value="Bitter, serif">Bitter</option>
                            <option value="Domine, serif">Domine</option>
                            <option value="Arvo, serif">Arvo</option>
                            <option value="Zilla Slab, serif">Zilla Slab</option>
                            <option value="Abril Fatface, serif">Abril Fatface</option>
                            <option value="Cinzel, serif">Cinzel</option>
                            <option value="Trajan Pro, serif">Trajan Pro</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Book Antiqua, serif">Book Antiqua</option>
                            <option value="Palatino, serif">Palatino</option>
                            <option value="Garamond, serif">Garamond</option>
                          </optgroup>
                          
                          {/* Sans-Serif Fonts */}
                          <optgroup label="Sans-Serif Fonts">
                            <option value="Inter, sans-serif">Inter (Modern)</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                            <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                            <option value="Nunito, sans-serif">Nunito</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Raleway, sans-serif">Raleway</option>
                            <option value="Ubuntu, sans-serif">Ubuntu</option>
                            <option value="Work Sans, sans-serif">Work Sans</option>
                            <option value="Fira Sans, sans-serif">Fira Sans</option>
                            <option value="Noto Sans, sans-serif">Noto Sans</option>
                            <option value="PT Sans, sans-serif">PT Sans</option>
                            <option value="Oxygen, sans-serif">Oxygen</option>
                            <option value="Muli, sans-serif">Muli</option>
                            <option value="Rubik, sans-serif">Rubik</option>
                            <option value="Karla, sans-serif">Karla</option>
                            <option value="Barlow, sans-serif">Barlow</option>
                            <option value="DM Sans, sans-serif">DM Sans</option>
                            <option value="Manrope, sans-serif">Manrope</option>
                            <option value="Hind, sans-serif">Hind</option>
                            <option value="Cabin, sans-serif">Cabin</option>
                            <option value="Quicksand, sans-serif">Quicksand</option>
                            <option value="Varela Round, sans-serif">Varela Round</option>
                            <option value="Comfortaa, sans-serif">Comfortaa</option>
                            <option value="Josefin Sans, sans-serif">Josefin Sans</option>
                            <option value="Catamaran, sans-serif">Catamaran</option>
                            <option value="Exo 2, sans-serif">Exo 2</option>
                            <option value="Mukti, sans-serif">Mukti</option>
                            <option value="Asap, sans-serif">Asap</option>
                            <option value="Titillium Web, sans-serif">Titillium Web</option>
                            <option value="Dosis, sans-serif">Dosis</option>
                            <option value="Abel, sans-serif">Abel</option>
                            <option value="Archivo, sans-serif">Archivo</option>
                            <option value="Overpass, sans-serif">Overpass</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Tahoma, sans-serif">Tahoma</option>
                            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                            <option value="Calibri, sans-serif">Calibri</option>
                          </optgroup>
                          
                          {/* Display Fonts */}
                          <optgroup label="Display Fonts">
                            <option value="Oswald, sans-serif">Oswald</option>
                            <option value="Bebas Neue, sans-serif">Bebas Neue</option>
                            <option value="Anton, sans-serif">Anton</option>
                            <option value="Fjalla One, sans-serif">Fjalla One</option>
                            <option value="Righteous, sans-serif">Righteous</option>
                            <option value="Fredoka One, sans-serif">Fredoka One</option>
                            <option value="Bangers, sans-serif">Bangers</option>
                            <option value="Bungee, sans-serif">Bungee</option>
                            <option value="Lobster, sans-serif">Lobster</option>
                            <option value="Pacifico, sans-serif">Pacifico</option>
                            <option value="Dancing Script, cursive">Dancing Script</option>
                            <option value="Great Vibes, cursive">Great Vibes</option>
                            <option value="Satisfy, cursive">Satisfy</option>
                            <option value="Kaushan Script, cursive">Kaushan Script</option>
                            <option value="Amatic SC, sans-serif">Amatic SC</option>
                            <option value="Caveat, cursive">Caveat</option>
                            <option value="Shadows Into Light, cursive">Shadows Into Light</option>
                            <option value="Permanent Marker, cursive">Permanent Marker</option>
                            <option value="Indie Flower, cursive">Indie Flower</option>
                            <option value="Handlee, cursive">Handlee</option>
                          </optgroup>
                          
                          {/* Monospace Fonts */}
                          <optgroup label="Monospace Fonts">
                            <option value="Fira Code, monospace">Fira Code</option>
                            <option value="Source Code Pro, monospace">Source Code Pro</option>
                            <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                            <option value="Roboto Mono, monospace">Roboto Mono</option>
                            <option value="Space Mono, monospace">Space Mono</option>
                            <option value="Inconsolata, monospace">Inconsolata</option>
                            <option value="Ubuntu Mono, monospace">Ubuntu Mono</option>
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Monaco, monospace">Monaco</option>
                            <option value="Consolas, monospace">Consolas</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Font
                        </label>
                        <select
                          value={messageFont}
                          onChange={(e) => setMessageFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          {/* Serif Fonts */}
                          <optgroup label="Serif Fonts">
                            <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                            <option value="Merriweather, serif">Merriweather</option>
                            <option value="Crimson Text, serif">Crimson Text</option>
                            <option value="Libre Baskerville, serif">Libre Baskerville</option>
                            <option value="Lora, serif">Lora</option>
                            <option value="Cormorant Garamond, serif">Cormorant Garamond</option>
                            <option value="EB Garamond, serif">EB Garamond</option>
                            <option value="Spectral, serif">Spectral</option>
                            <option value="Vollkorn, serif">Vollkorn</option>
                            <option value="Alegreya, serif">Alegreya</option>
                            <option value="Cardo, serif">Cardo</option>
                            <option value="Gentium Plus, serif">Gentium Plus</option>
                            <option value="Neuton, serif">Neuton</option>
                            <option value="Old Standard TT, serif">Old Standard TT</option>
                            <option value="PT Serif, serif">PT Serif</option>
                            <option value="Rokkitt, serif">Rokkitt</option>
                            <option value="Source Serif Pro, serif">Source Serif Pro</option>
                            <option value="Tinos, serif">Tinos</option>
                            <option value="Bitter, serif">Bitter</option>
                            <option value="Domine, serif">Domine</option>
                            <option value="Arvo, serif">Arvo</option>
                            <option value="Zilla Slab, serif">Zilla Slab</option>
                            <option value="Abril Fatface, serif">Abril Fatface</option>
                            <option value="Cinzel, serif">Cinzel</option>
                            <option value="Trajan Pro, serif">Trajan Pro</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Book Antiqua, serif">Book Antiqua</option>
                            <option value="Palatino, serif">Palatino</option>
                            <option value="Garamond, serif">Garamond</option>
                          </optgroup>
                          
                          {/* Sans-Serif Fonts */}
                          <optgroup label="Sans-Serif Fonts">
                            <option value="Inter, sans-serif">Inter (Modern)</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                            <option value="Lato, sans-serif">Lato</option>
                            <option value="Montserrat, sans-serif">Montserrat</option>
                            <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                            <option value="Nunito, sans-serif">Nunito</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="Raleway, sans-serif">Raleway</option>
                            <option value="Ubuntu, sans-serif">Ubuntu</option>
                            <option value="Work Sans, sans-serif">Work Sans</option>
                            <option value="Fira Sans, sans-serif">Fira Sans</option>
                            <option value="Noto Sans, sans-serif">Noto Sans</option>
                            <option value="PT Sans, sans-serif">PT Sans</option>
                            <option value="Oxygen, sans-serif">Oxygen</option>
                            <option value="Muli, sans-serif">Muli</option>
                            <option value="Rubik, sans-serif">Rubik</option>
                            <option value="Karla, sans-serif">Karla</option>
                            <option value="Barlow, sans-serif">Barlow</option>
                            <option value="DM Sans, sans-serif">DM Sans</option>
                            <option value="Manrope, sans-serif">Manrope</option>
                            <option value="Hind, sans-serif">Hind</option>
                            <option value="Cabin, sans-serif">Cabin</option>
                            <option value="Quicksand, sans-serif">Quicksand</option>
                            <option value="Varela Round, sans-serif">Varela Round</option>
                            <option value="Comfortaa, sans-serif">Comfortaa</option>
                            <option value="Josefin Sans, sans-serif">Josefin Sans</option>
                            <option value="Catamaran, sans-serif">Catamaran</option>
                            <option value="Exo 2, sans-serif">Exo 2</option>
                            <option value="Mukti, sans-serif">Mukti</option>
                            <option value="Asap, sans-serif">Asap</option>
                            <option value="Titillium Web, sans-serif">Titillium Web</option>
                            <option value="Dosis, sans-serif">Dosis</option>
                            <option value="Abel, sans-serif">Abel</option>
                            <option value="Archivo, sans-serif">Archivo</option>
                            <option value="Overpass, sans-serif">Overpass</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Tahoma, sans-serif">Tahoma</option>
                            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                            <option value="Calibri, sans-serif">Calibri</option>
                          </optgroup>
                          
                          {/* Display Fonts */}
                          <optgroup label="Display Fonts">
                            <option value="Oswald, sans-serif">Oswald</option>
                            <option value="Bebas Neue, sans-serif">Bebas Neue</option>
                            <option value="Anton, sans-serif">Anton</option>
                            <option value="Fjalla One, sans-serif">Fjalla One</option>
                            <option value="Righteous, sans-serif">Righteous</option>
                            <option value="Fredoka One, sans-serif">Fredoka One</option>
                            <option value="Bangers, sans-serif">Bangers</option>
                            <option value="Bungee, sans-serif">Bungee</option>
                            <option value="Lobster, sans-serif">Lobster</option>
                            <option value="Pacifico, sans-serif">Pacifico</option>
                            <option value="Dancing Script, cursive">Dancing Script</option>
                            <option value="Great Vibes, cursive">Great Vibes</option>
                            <option value="Satisfy, cursive">Satisfy</option>
                            <option value="Kaushan Script, cursive">Kaushan Script</option>
                            <option value="Amatic SC, sans-serif">Amatic SC</option>
                            <option value="Caveat, cursive">Caveat</option>
                            <option value="Shadows Into Light, cursive">Shadows Into Light</option>
                            <option value="Permanent Marker, cursive">Permanent Marker</option>
                            <option value="Indie Flower, cursive">Indie Flower</option>
                            <option value="Handlee, cursive">Handlee</option>
                          </optgroup>
                          
                          {/* Monospace Fonts */}
                          <optgroup label="Monospace Fonts">
                            <option value="Fira Code, monospace">Fira Code</option>
                            <option value="Source Code Pro, monospace">Source Code Pro</option>
                            <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                            <option value="Roboto Mono, monospace">Roboto Mono</option>
                            <option value="Space Mono, monospace">Space Mono</option>
                            <option value="Inconsolata, monospace">Inconsolata</option>
                            <option value="Ubuntu Mono, monospace">Ubuntu Mono</option>
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Monaco, monospace">Monaco</option>
                            <option value="Consolas, monospace">Consolas</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title Size
                        </label>
                        <select
                          value={titleSize}
                          onChange={(e) => setTitleSize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="text-2xl">Small</option>
                          <option value="text-3xl">Medium</option>
                          <option value="text-4xl">Large</option>
                          <option value="text-5xl">Extra Large</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Size
                        </label>
                        <select
                          value={messageSize}
                          onChange={(e) => setMessageSize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="text-sm">Small</option>
                          <option value="text-base">Medium</option>
                          <option value="text-lg">Large</option>
                          <option value="text-xl">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Background */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Background</h3>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setBackgroundType('solid')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          backgroundType === 'solid'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Solid Color
                      </button>
                      <button
                        onClick={() => setBackgroundType('gradient')}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          backgroundType === 'gradient'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Gradient
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      {backgroundType === 'gradient' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Color
                          </label>
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {backgroundType === 'gradient' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gradient Direction
                        </label>
                        <select
                          value={gradientDirection}
                          onChange={(e) => setGradientDirection(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="to-b">Top to Bottom</option>
                          <option value="to-r">Left to Right</option>
                          <option value="to-br">Top-Left to Bottom-Right</option>
                          <option value="to-bl">Top-Right to Bottom-Left</option>
                          <option value="radial">Radial (Center Out)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Slideshow Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Slideshow Settings</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slide Duration: {slideDuration} seconds
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={slideDuration}
                        onChange={(e) => setSlideDuration(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #C0A172 0%, #C0A172 ${((slideDuration - 1) / 29) * 100}%, #e5e7eb ${((slideDuration - 1) / 29) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1s</span>
                        <span>30s</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <p>• Images/Text: {slideDuration} seconds</p>
                        <p>• Videos: {slideDuration * 3} seconds (or until video ends)</p>
                        <p>• Audio: {slideDuration * 2} seconds (or until audio ends)</p>
                      </div>
                    </div>
                  </div>

                  {/* Background Music Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Background Music (Optional)
                    </label>
                    
                    {backgroundMusic ? (
                      <div className={`rounded-lg p-6 border ${
                        backgroundMusic.genre === 'Custom Upload' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              backgroundMusic.genre === 'Custom Upload'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            }`}>
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{backgroundMusic.title}</h4>
                              <p className="text-sm text-gray-600">{backgroundMusic.genre}</p>
                              {backgroundMusic.genre === 'Custom Upload' && customAudioFile && (
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(customAudioFile.size)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => toggleMusicPlayback(backgroundMusic)}
                              className={`p-2 rounded-full transition-colors ${
                                backgroundMusic.genre === 'Custom Upload'
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-purple-600 hover:bg-purple-100'
                              }`}
                            >
                              {currentlyPlaying === backgroundMusic.id ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={removeBackgroundMusic}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Music Library Option */}
                        <button
                          type="button"
                          onClick={() => setShowMusicLibrary(true)}
                          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                        >
                          <div className="text-center">
                            <Music className="w-12 h-12 text-gray-400 group-hover:text-purple-500 mx-auto mb-4 transition-colors" />
                            <p className="text-lg font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                              Choose from Music Library
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Select from our curated instrumental collection
                            </p>
                          </div>
                        </button>

                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                          </div>
                        </div>

                        {/* Custom Audio Upload Option */}
                        <button
                          type="button"
                          onClick={() => customAudioInputRef.current?.click()}
                          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
                        >
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-gray-400 group-hover:text-green-500 mx-auto mb-4 transition-colors" />
                            <p className="text-lg font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                              Upload Your Own Audio
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Upload your personal audio file (MP3, WAV, OGG, M4A • Max 50MB)
                            </p>
                          </div>
                        </button>

                        {/* Hidden file input for custom audio */}
                        <input
                          ref={customAudioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCustomAudioUpload(file);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Transition Effects Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Transition Effects
                    </h3>
                    
                    {/* Transition Effect Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
                        Choose Transition Effect
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {transitionEffects.map((effect) => (
                          <button
                            key={effect.id}
                            type="button"
                            onClick={() => setTransitionEffect(effect.id)}
                            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                              transitionEffect === effect.id
                                ? 'border-amber-500 bg-amber-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            style={{ borderColor: transitionEffect === effect.id ? '#C0A172' : undefined }}
                          >
                            <div className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {effect.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {effect.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transition Speed Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
                        Transition Speed
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {speedOptions.map((speed) => (
                          <button
                            key={speed.id}
                            type="button"
                            onClick={() => setTransitionSpeed(speed.id)}
                            className={`p-4 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md ${
                              transitionSpeed === speed.id
                                ? 'border-amber-500 bg-amber-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            style={{ borderColor: transitionSpeed === speed.id ? '#C0A172' : undefined }}
                          >
                            <div className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                              {speed.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {speed.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Recipients
                  </h2>

                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-800">
                            Recipient {index + 1}
                          </h3>
                          {recipients.length > 1 && (
                            <button
                              onClick={() => removeRecipient(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Recipient's name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="recipient@example.com"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addRecipient}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                    >
                      + Add Another Recipient
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowPreview(true)}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Preview Slideshow</span>
              </button>
              
              <button
                onClick={handleSaveAsDraft}
                disabled={!title.trim() || loading}
                className="btn-outline flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save as Draft</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editCapsuleId ? 'Update Time Capsule' : 'Save Time Capsule')}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </h3>

                {/* Preview Content */}
                <div 
                  className="rounded-lg p-6 min-h-[300px] transition-all duration-500"
                  style={getBackgroundStyle()}
                >
                  {title && (
                    <h1 
                      className={`${titleSize} font-bold text-gray-800 mb-4 leading-tight`}
                      style={{ fontFamily: titleFont }}
                    >
                      {title}
                    </h1>
                  )}
                  
                  {message && (
                    <p 
                      className={`${messageSize} text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap`}
                      style={{ fontFamily: messageFont }}
                    >
                      {message}
                    </p>
                  )}

                  {/* Media Preview */}
                  {mediaFiles.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Media ({mediaFiles.length} files)
                      </h4>
                      <div className="space-y-3">
                        {mediaFiles.slice(0, 3).map((file) => (
                          <div key={file.id} className="bg-gray-50 rounded-lg overflow-hidden">
                            {file.type === 'image' && (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-40 object-contain bg-gray-50"
                              />
                            )}
                            {file.type === 'video' && (
                              <video
                                src={file.url}
                                className="w-full h-40 object-contain bg-gray-50"
                                controls
                              />
                            )}
                            {file.type === 'audio' && (
                              <div className="h-40 flex flex-col items-center justify-center bg-gray-50">
                                <Music className="w-8 h-8 text-purple-600 mb-2" />
                                <p className="text-sm text-gray-600 text-center px-2">
                                  {file.name}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                        {mediaFiles.length > 3 && (
                          <div className="text-center text-sm text-gray-500">
                            +{mediaFiles.length - 3} more files
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Style Information */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                  <div>Font: {titleFont.split(',')[0]} / {messageFont.split(',')[0]}</div>
                  <div>Background: {backgroundType === 'gradient' ? 'Gradient' : 'Solid'}</div>
                  <div>Slide Duration: {slideDuration}s</div>
                  {senderName && <div>From: {senderName}</div>}
                  {deliveryDate && <div>Delivery: {new Date(deliveryDate).toLocaleDateString()}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slideshow Preview Modal */}
      <SlideshowPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        message={message}
        senderName={senderName || 'Your Family'}
        titleFont={titleFont}
        messageFont={messageFont}
        titleSize={titleSize}
        messageSize={messageSize}
        backgroundColor={backgroundColor}
        backgroundType={backgroundType}
        gradientDirection={gradientDirection}
        secondaryColor={secondaryColor}
        transitionEffect={transitionEffect}
        transitionSpeed={transitionSpeed}
        mediaFiles={mediaFiles}
        deliveryDate={deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'Today'}
        slideDuration={slideDuration * 1000}
        backgroundMusic={backgroundMusic}
      />

      {/* Music Library Modal */}
      <AnimatePresence>
        {showMusicLibrary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMusicLibrary(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Choose Background Music
                </h2>
                <button
                  onClick={() => setShowMusicLibrary(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save and Seal'}
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 gap-4">
                  {musicLibrary.map((track) => (
                    <div
                      key={track.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{track.title}</h4>
                            <p className="text-sm text-gray-600">{track.genre}</p>
                            <p className="text-xs text-gray-500 mt-1">{track.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleMusicPlayback(track)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                          >
                            {currentlyPlaying === track.id ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => selectBackgroundMusic(track)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upgrade Notice */}
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">
                        Unlock Full Music Library
                      </h3>
                      <p className="text-amber-700 text-sm mb-4">
                        Access our complete collection of 100+ instrumental tracks with the Legacy plan. 
                        Perfect for creating the ideal atmosphere for your time capsules.
                      </p>
                      <button
                        onClick={() => window.location.href = '/#pricing'}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                      >
                        View Plans
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Arrangement Modal */}
      <FileArrangementModal
        isOpen={showFileArrangement}
        onClose={() => setShowFileArrangement(false)}
        mediaFiles={mediaFiles}
        onSave={handleFileArrangementSave}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};