import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ToastNotification } from '../components/ToastNotification';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';
import { 
  FileText, 
  Upload, 
  Palette, 
  Users, 
  Calendar,
  Save,
  Send,
  Eye,
  Plus,
  X,
  Image,
  Video,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Play,
  Trash2,
  Clock,
  User,
  Music,
  Info,
  ArrowUpDown
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

interface Recipient {
  name: string;
  email: string;
}

export const CreateCapsule: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Tab state
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('12:00');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Customization state
  const [titleFont, setTitleFont] = useState('Playfair Display');
  const [messageFont, setMessageFont] = useState('Inter');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#F3F4F6');
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [slideDuration, setSlideDuration] = useState(5000);
  
  // Music state
  const [musicOption, setMusicOption] = useState<'none' | 'library' | 'upload'>('none');
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<any>(null);
  const [uploadedMusic, setUploadedMusic] = useState<File | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [showPreview, setShowPreview] = useState(false);
  const [showFileArrangement, setShowFileArrangement] = useState(false);

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'media', label: 'Media', icon: Upload },
    { id: 'customize', label: 'Style', icon: Palette },
    { id: 'recipients', label: 'Send To', icon: Users }
  ];

  const fontOptions = [
    { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'serif', label: 'Times (Classic)' },
    { value: 'Georgia', label: 'Georgia (Traditional)' },
    { value: 'Lora', label: 'Lora (Readable)' },
    { value: 'Merriweather', label: 'Merriweather (Friendly)' },
    { value: 'Open Sans', label: 'Open Sans (Clean)' },
    { value: 'Roboto', label: 'Roboto (Technical)' }
  ];

  const transitionEffects = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide Left' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'zoom', label: 'Zoom In' },
    { value: 'zoomOut', label: 'Zoom Out' },
    { value: 'flipHorizontal', label: 'Flip Horizontal' },
    { value: 'flipVertical', label: 'Flip Vertical' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'spiral', label: 'Spiral' },
    { value: 'blur', label: 'Blur' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'elastic', label: 'Elastic' },
    { value: 'curtain', label: 'Curtain' },
    { value: 'wave', label: 'Wave' }
  ];

  const gradientDirections = [
    { value: 'to-b', label: 'Top to Bottom' },
    { value: 'to-r', label: 'Left to Right' },
    { value: 'to-br', label: 'Top-Left to Bottom-Right' },
    { value: 'to-bl', label: 'Top-Right to Bottom-Left' },
    { value: 'radial', label: 'Radial (Center Out)' }
  ];

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Set default sender name from user profile
    if (profile?.name) {
      setSenderName(profile.name);
    }

    if (editId) {
      loadCapsuleForEdit(editId);
    }
  }, [user, profile, editId, navigate]);

  const loadCapsuleForEdit = async (capsuleId: string) => {
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
        setDeliveryDate(data.delivery_date ? new Date(data.delivery_date).toISOString().split('T')[0] : '');
        setDeliveryTime(data.delivery_date ? new Date(data.delivery_date).toTimeString().slice(0, 5) : '12:00');
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        
        // Load customization settings
        if (data.customization) {
          const custom = data.customization;
          setTitleFont(custom.titleFont || 'Playfair Display');
          setMessageFont(custom.messageFont || 'Inter');
          setTitleSize(custom.titleSize || 'text-4xl');
          setMessageSize(custom.messageSize || 'text-lg');
          setBackgroundColor(custom.backgroundColor || '#FFFFFF');
          setBackgroundType(custom.backgroundType || 'solid');
          setGradientDirection(custom.gradientDirection || 'to-b');
          setSecondaryColor(custom.secondaryColor || '#F3F4F6');
          setTransitionEffect(custom.transitionEffect || 'fade');
          setTransitionSpeed(custom.transitionSpeed || 'medium');
          setSlideDuration(custom.slideDuration || 5000);
        }
      }
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load capsule for editing', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 'audio';
      
      const mediaFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type: fileType,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };
      
      setMediaFiles(prev => [...prev, mediaFile]);
    });
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedMusic(file);
      setMusicOption('upload');
    }
  };

  const removeFile = (fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const addRecipient = () => {
    setRecipients(prev => [...prev, { name: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    setRecipients(prev => prev.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    ));
  };

  const handlePreview = () => {
    if (!title.trim()) {
      triggerToast('Please enter a title to preview your capsule', 'warning');
      return;
    }
    setShowPreview(true);
  };

  const saveCapsule = async (status: 'draft' | 'sealed') => {
    if (!title.trim()) {
      triggerToast('Please enter a title for your capsule', 'warning');
      return;
    }

    if (!deliveryDate) {
      triggerToast('Please select a delivery date', 'warning');
      return;
    }

    if (status === 'sealed' && recipients.some(r => !r.name.trim() || !r.email.trim())) {
      triggerToast('Please fill in all recipient details before sealing', 'warning');
      return;
    }

    setLoading(true);
    try {
      const deliveryDateTime = new Date(`${deliveryDate}T${deliveryTime}`).toISOString();
      
      const capsuleData = {
        user_id: user?.id,
        title: title.trim(),
        message: message.trim(),
        delivery_date: deliveryDateTime,
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        files: [], // Files would be uploaded to storage separately
        customization: {
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
          slideDuration,
          musicOption,
          senderName
        },
        status,
        updated_at: new Date().toISOString()
      };

      if (editId) {
        const { error } = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editId);
        
        if (error) throw error;
        triggerToast(`Capsule ${status === 'draft' ? 'saved' : 'sealed'} successfully!`, 'success');
      } else {
        const { error } = await supabase
          .from('capsules')
          .insert(capsuleData);
        
        if (error) throw error;
        triggerToast(`Capsule ${status === 'draft' ? 'saved' : 'sealed'} successfully!`, 'success');
      }

      // Navigate to My Capsules after a short delay
      setTimeout(() => {
        navigate('/my-capsules');
      }, 1500);

    } catch (error) {
      console.error('Error saving capsule:', error);
      triggerToast('Failed to save capsule. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-green-500" />;
      case 'audio': return <Volume2 className="w-5 h-5 text-purple-500" />;
      default: return <Image className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to create time capsules.
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Create Your Time Capsule
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Preserve your precious memories and schedule them to be delivered at the perfect moment.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors min-w-[70px] md:min-w-auto ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ 
                  borderColor: activeTab === tab.id ? '#C0A172' : 'transparent',
                  color: activeTab === tab.id ? '#C0A172' : undefined
                }}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <AnimatePresence mode="wait">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Capsule Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capsule Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-gray-900"
                    style={{ focusRingColor: '#C0A172' }}
                    placeholder="Give your time capsule a meaningful title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From (Sender Name) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-gray-900"
                      style={{ focusRingColor: '#C0A172' }}
                      placeholder="Your name as it will appear to recipients"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none text-gray-900"
                    style={{ focusRingColor: '#C0A172' }}
                    placeholder="Write a heartfelt message to your recipients..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <motion.div
                key="media"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Add Media</h2>
                  {mediaFiles.length > 1 && (
                    <button
                      onClick={() => setShowFileArrangement(true)}
                      className="btn-outline text-xs md:text-sm py-2 px-3 flex items-center"
                    >
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                      Arrange
                    </button>
                  )}
                </div>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 md:w-12 h-8 md:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
                    Upload Photos, Videos & Audio
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm md:text-base">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer inline-block text-sm md:text-base"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Music Options */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-800">Background Music</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="musicOption"
                        value="none"
                        checked={musicOption === 'none'}
                        onChange={(e) => setMusicOption(e.target.value as any)}
                        className="mr-3"
                      />
                      <span className="text-gray-700 text-sm md:text-base">No background music</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="musicOption"
                        value="library"
                        checked={musicOption === 'library'}
                        onChange={(e) => setMusicOption(e.target.value as any)}
                        className="mr-3"
                      />
                      <Music className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-gray-700 text-sm md:text-base">Use our music library (Coming Soon)</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="musicOption"
                        value="upload"
                        checked={musicOption === 'upload'}
                        onChange={(e) => setMusicOption(e.target.value as any)}
                        className="mr-3"
                      />
                      <Upload className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-gray-700 text-sm md:text-base">Upload your own music</span>
                    </label>
                  </div>

                  {musicOption === 'upload' && (
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleMusicUpload}
                        className="hidden"
                        id="music-upload"
                      />
                      <label
                        htmlFor="music-upload"
                        className="btn-outline cursor-pointer inline-block text-sm"
                      >
                        {uploadedMusic ? `Selected: ${uploadedMusic.name}` : 'Choose Music File'}
                      </label>
                    </div>
                  )}
                </div>

                {/* Uploaded Files */}
                {mediaFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-medium text-gray-800">
                      Uploaded Files ({mediaFiles.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {mediaFiles.map((file) => (
                        <div key={file.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.type} • {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Customize Tab */}
            {activeTab === 'customize' && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Customize Appearance</h2>
                  <button
                    onClick={handlePreview}
                    className="btn-outline text-xs md:text-sm py-2 px-3 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </button>
                </div>
                
                {/* Typography */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-800">Typography</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Font
                      </label>
                      <select
                        value={titleFont}
                        onChange={(e) => setTitleFont(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        {fontOptions.map(font => (
                          <option key={font.value} value={font.value}>{font.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Font
                      </label>
                      <select
                        value={messageFont}
                        onChange={(e) => setMessageFont(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        {fontOptions.map(font => (
                          <option key={font.value} value={font.value}>{font.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Size
                      </label>
                      <select
                        value={titleSize}
                        onChange={(e) => setTitleSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
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
                  <h3 className="text-base md:text-lg font-medium text-gray-800">Background</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="backgroundType"
                        value="solid"
                        checked={backgroundType === 'solid'}
                        onChange={(e) => setBackgroundType(e.target.value as any)}
                        className="mr-3"
                      />
                      <span className="text-gray-700 text-sm">Solid Color</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="backgroundType"
                        value="gradient"
                        checked={backgroundType === 'gradient'}
                        onChange={(e) => setBackgroundType(e.target.value as any)}
                        className="mr-3"
                      />
                      <span className="text-gray-700 text-sm">Color Gradient</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                          style={{ focusRingColor: '#C0A172' }}
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    {backgroundType === 'gradient' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                            style={{ focusRingColor: '#C0A172' }}
                            placeholder="#F3F4F6"
                          />
                        </div>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        {gradientDirections.map(direction => (
                          <option key={direction.value} value={direction.value}>{direction.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Slideshow Settings */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-medium text-gray-800">Slideshow Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transition Effect
                      </label>
                      <select
                        value={transitionEffect}
                        onChange={(e) => setTransitionEffect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        {transitionEffects.map(effect => (
                          <option key={effect.value} value={effect.value}>{effect.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transition Speed
                      </label>
                      <select
                        value={transitionSpeed}
                        onChange={(e) => setTransitionSpeed(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        <option value="slow">Slow</option>
                        <option value="medium">Medium</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slide Duration (seconds)
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={slideDuration / 1000}
                      onChange={(e) => setSlideDuration(parseInt(e.target.value) * 1000)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3s</span>
                      <span className="font-medium">{slideDuration / 1000}s</span>
                      <span>15s</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recipients Tab */}
            {activeTab === 'recipients' && (
              <motion.div
                key="recipients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Recipients</h2>
                
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={recipient.name}
                          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                          style={{ focusRingColor: '#C0A172' }}
                          placeholder="Recipient Name"
                        />
                        <input
                          type="email"
                          value={recipient.email}
                          onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                          style={{ focusRingColor: '#C0A172' }}
                          placeholder="Recipient Email"
                        />
                      </div>
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addRecipient}
                  className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Another Recipient
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <div className="flex-1 relative">
            <button
              onClick={() => saveCapsule('draft')}
              disabled={loading}
              className="w-full btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save as Draft
              <Info className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-600" />
            </button>
            
            {/* Tooltip for Save as Draft */}
            <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                <div className="text-center">
                  This saves the details and text of your capsule, but not your uploaded photos or videos.
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => saveCapsule('sealed')}
            disabled={loading}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Seal & Schedule
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Creating Great Time Capsules</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Write from the heart - your future self or loved ones will treasure authentic messages</li>
            <li>• Include a mix of photos, videos, and audio for a rich experience</li>
            <li>• Choose a meaningful delivery date like birthdays, anniversaries, or graduations</li>
            <li>• Save as draft to continue editing later, or seal to schedule delivery</li>
          </ul>
        </div>
      </div>

      {/* Slideshow Preview Modal */}
      <SlideshowPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        message={message}
        senderName={senderName}
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
        deliveryDate={deliveryDate}
        slideDuration={slideDuration}
        backgroundMusic={selectedBackgroundMusic}
      />

      {/* File Arrangement Modal */}
      <FileArrangementModal
        isOpen={showFileArrangement}
        onClose={() => setShowFileArrangement(false)}
        mediaFiles={mediaFiles}
        onSave={(reorderedFiles) => setMediaFiles(reorderedFiles)}
      />

      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};