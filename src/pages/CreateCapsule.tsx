import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  Volume2, 
  Calendar, 
  Users, 
  Eye, 
  Save,
  Send,
  ArrowLeft,
  Plus,
  Trash2,
  Music,
  Palette,
  Type,
  Settings,
  Play
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';
import { ToastNotification } from '../components/ToastNotification';

interface MediaFile {
  id: string;
  file?: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
  supabaseUrl?: string; // For files already uploaded to Supabase
}

interface Recipient {
  name: string;
  email: string;
}

interface BackgroundMusic {
  id: string;
  title: string;
  url: string;
  genre: string;
}

const backgroundMusicOptions: BackgroundMusic[] = [
  {
    id: 'coastal-echoes',
    title: 'Coastal Echoes',
    url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Coastal%20Echoes.mp3',
    genre: 'Cinematic Score'
  },
  {
    id: 'sad-memory',
    title: 'Sad Memory',
    url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Sad%20Memory.wav',
    genre: 'Cinematic Score'
  }
];

const transitionEffects = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
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

const transitionSpeeds = [
  { value: 'slow', label: 'Slow (1.2s)' },
  { value: 'medium', label: 'Medium (0.8s)' },
  { value: 'fast', label: 'Fast (0.5s)' }
];

const fontOptions = [
  { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant Serif)', className: 'font-preview-playfair' },
  { value: 'Inter, sans-serif', label: 'Inter (Modern Sans-serif)', className: 'font-preview-inter' },
  { value: 'Lora, serif', label: 'Lora (Readable Serif)', className: 'font-preview-lora' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Clean Sans-serif)', className: 'font-preview-montserrat' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Professional)', className: 'font-preview-roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans (Friendly)', className: 'font-preview-opensans' }
];

const fontSizes = [
  { value: 'text-2xl', label: 'Small' },
  { value: 'text-3xl', label: 'Medium' },
  { value: 'text-4xl', label: 'Large' },
  { value: 'text-5xl', label: 'Extra Large' }
];

const messageSizes = [
  { value: 'text-base', label: 'Small' },
  { value: 'text-lg', label: 'Medium' },
  { value: 'text-xl', label: 'Large' },
  { value: 'text-2xl', label: 'Extra Large' }
];

export const CreateCapsule: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCapsuleId = searchParams.get('edit');
  const isEditing = !!editCapsuleId;

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'recipients' | 'customize' | 'preview'>('content');

  // Customization state
  const [titleFont, setTitleFont] = useState('Playfair Display, serif');
  const [messageFont, setMessageFont] = useState('Inter, sans-serif');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#F3F4F6');
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [slideDuration, setSlideDuration] = useState(5000);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic | null>(null);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showFileArrangement, setShowFileArrangement] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [originalCapsuleStatus, setOriginalCapsuleStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load existing capsule data if editing
  useEffect(() => {
    if (isEditing && editCapsuleId && user) {
      loadCapsuleData(editCapsuleId);
    }
  }, [isEditing, editCapsuleId, user]);

  const loadCapsuleData = async (capsuleId: string) => {
    try {
      setLoading(true);
      const { data: capsule, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (capsule) {
        setTitle(capsule.title || '');
        setMessage(capsule.message || '');
        setRecipients(capsule.recipients || [{ name: '', email: '' }]);
        setDeliveryDate(new Date(capsule.delivery_date).toISOString().split('T')[0]);
        setOriginalCapsuleStatus(capsule.status);

        // Load customization settings
        const customization = capsule.customization || {};
        setTitleFont(customization.titleFont || 'Playfair Display, serif');
        setMessageFont(customization.messageFont || 'Inter, sans-serif');
        setTitleSize(customization.titleSize || 'text-4xl');
        setMessageSize(customization.messageSize || 'text-lg');
        setBackgroundColor(customization.backgroundColor || '#FFFFFF');
        setBackgroundType(customization.backgroundType || 'solid');
        setGradientDirection(customization.gradientDirection || 'to-b');
        setSecondaryColor(customization.secondaryColor || '#F3F4F6');
        setTransitionEffect(customization.transitionEffect || 'fade');
        setTransitionSpeed(customization.transitionSpeed || 'medium');
        setSlideDuration(customization.slideDuration || 5000);

        // Load background music
        if (customization.backgroundMusic) {
          setBackgroundMusic(customization.backgroundMusic);
        }

        // Load media files from Supabase URLs
        if (capsule.files && capsule.files.length > 0) {
          const loadedFiles: MediaFile[] = capsule.files.map((file: any) => ({
            id: file.id,
            type: file.type,
            url: file.url,
            name: file.name,
            size: file.size || 0,
            supabaseUrl: file.url
          }));
          setMediaFiles(loadedFiles);
        }
      }
    } catch (error: unknown) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load capsule data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadAllMediaFiles = async (): Promise<any[]> => {
    const uploadedFiles = [];

    for (const mediaFile of mediaFiles) {
      try {
        let fileUrl = mediaFile.supabaseUrl || mediaFile.url;

        // Only upload if it's a new file (has File object and no Supabase URL)
        if (mediaFile.file && !mediaFile.supabaseUrl) {
          fileUrl = await uploadFileToSupabase(mediaFile.file);
        }

        uploadedFiles.push({
          id: mediaFile.id,
          type: mediaFile.type,
          url: fileUrl,
          name: mediaFile.name,
          size: mediaFile.size
        });
      } catch (error: unknown) {
        console.error('Error uploading file:', mediaFile.name, error);
        throw new Error(`Failed to upload ${mediaFile.name}`);
      }
    }

    return uploadedFiles;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' :
                     file.type.startsWith('audio/') ? 'audio' : null;

      if (!fileType) {
        triggerToast(`Unsupported file type: ${file.name}`, 'error');
        return;
      }

      const newFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        file,
        type: fileType,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      setMediaFiles(prev => [...prev, newFile]);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.url && !fileToRemove.supabaseUrl) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const addRecipient = () => {
    setRecipients(prev => [...prev, { name: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    setRecipients(prev => prev.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    ));
  };

  const validateForm = () => {
    if (!title.trim()) {
      triggerToast('Please enter a title for your time capsule', 'error');
      return false;
    }

    if (!message.trim()) {
      triggerToast('Please enter a message for your time capsule', 'error');
      return false;
    }

    if (!deliveryDate) {
      triggerToast('Please select a delivery date', 'error');
      return false;
    }

    const selectedDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      triggerToast('Delivery date must be in the future', 'error');
      return false;
    }

    const validRecipients = recipients.filter(r => r.name.trim() && r.email.trim());
    if (validRecipients.length === 0) {
      triggerToast('Please add at least one recipient', 'error');
      return false;
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const recipient of validRecipients) {
      if (!emailRegex.test(recipient.email)) {
        triggerToast(`Invalid email address: ${recipient.email}`, 'error');
        return false;
      }
    }

    return true;
  };

  const saveCapsule = async (status: 'draft' | 'sealed') => {
    if (!user) {
      triggerToast('Please sign in to save your time capsule', 'error');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setUploadingFiles(true);

    try {
      // Upload all media files to Supabase Storage
      const uploadedFiles = await uploadAllMediaFiles();

      const validRecipients = recipients.filter(r => r.name.trim() && r.email.trim());

      const customization = {
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
        backgroundMusic
      };

      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        recipients: validRecipients,
        delivery_date: new Date(deliveryDate).toISOString(),
        files: uploadedFiles,
        customization,
        status,
        updated_at: new Date().toISOString()
      };

      if (isEditing && editCapsuleId) {
        // Update existing capsule
        const { error } = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editCapsuleId)
          .eq('user_id', user.id);

        if (error) throw error;

        const actionText = status === 'draft' ? 'saved as draft' : 
                          originalCapsuleStatus === 'sealed' ? 're-sealed' : 'sealed';
        triggerToast(`Time capsule ${actionText} successfully!`, 'success');
      } else {
        // Create new capsule
        const { error } = await supabase
          .from('capsules')
          .insert(capsuleData);

        if (error) throw error;

        const actionText = status === 'draft' ? 'saved as draft' : 'sealed';
        triggerToast(`Time capsule ${actionText} successfully!`, 'success');
      }

      // Navigate back to My Capsules after a short delay
      setTimeout(() => {
        navigate('/my-capsules');
      }, 1500);

    } catch (error: unknown) {
      console.error('Error saving capsule:', error);
      triggerToast('Failed to save time capsule. Please try again.', 'error');
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleSaveAsDraft = () => saveCapsule('draft');
  const handleSaveAndSeal = () => saveCapsule('sealed');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-green-500" />;
      case 'audio':
        return <Volume2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Image className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to create a time capsule.</p>
        </div>
      </div>
    );
  }

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate('/my-capsules')}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Capsules
          </button>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isEditing ? 'Edit Time Capsule' : 'Create Your Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEditing 
              ? 'Update your time capsule details and customize the experience'
              : 'Preserve your precious memories and schedule them for future delivery'
            }
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {[
              { key: 'content', label: 'Content', icon: Type },
              { key: 'recipients', label: 'Recipients', icon: Users },
              { key: 'customize', label: 'Customize', icon: Palette },
              { key: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  backgroundColor: activeTab === tab.key ? '#C0A172' : 'transparent',
                  borderColor: activeTab === tab.key ? '#C0A172' : 'transparent'
                }}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AnimatePresence mode="wait">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Capsule Content
                    </h2>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capsule Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{ focusRingColor: '#C0A172' }}
                        placeholder="Give your time capsule a meaningful title..."
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300 resize-none"
                        style={{ focusRingColor: '#C0A172' }}
                        placeholder="Write your heartfelt message to be delivered in the future..."
                        required
                      />
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{ focusRingColor: '#C0A172' }}
                        required
                      />
                    </div>

                    {/* Media Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media Files
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Upload photos, videos, or audio files to include in your time capsule
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-primary"
                          disabled={uploadingFiles}
                        >
                          {uploadingFiles ? 'Uploading...' : 'Choose Files'}
                        </button>
                      </div>

                      {/* Uploaded Files */}
                      {mediaFiles.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800">
                              Uploaded Files ({mediaFiles.length})
                            </h3>
                            <button
                              onClick={() => setShowFileArrangement(true)}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Arrange Order
                            </button>
                          </div>
                          
                          {mediaFiles.map((file, index) => (
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
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {file.type} • {formatFileSize(file.size)}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Recipients
                    </h2>

                    <p className="text-gray-600 mb-6">
                      Add the people who will receive this time capsule on the delivery date.
                    </p>

                    <div className="space-y-4">
                      {recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                              style={{ focusRingColor: '#C0A172' }}
                              placeholder="Recipient Name"
                              required
                            />
                            <input
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                              style={{ focusRingColor: '#C0A172' }}
                              placeholder="Recipient Email"
                              required
                            />
                          </div>
                          
                          {recipients.length > 1 && (
                            <button
                              onClick={() => removeRecipient(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
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

                {/* Customize Tab */}
                {activeTab === 'customize' && (
                  <motion.div
                    key="customize"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Customize Appearance
                    </h2>

                    {/* Typography */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Typography</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title Font
                          </label>
                          <select
                            value={titleFont}
                            onChange={(e) => setTitleFont(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300 font-select"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {fontOptions.map((font) => (
                              <option 
                                key={font.value} 
                                value={font.value}
                                className={font.className}
                              >
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title Size
                          </label>
                          <select
                            value={titleSize}
                            onChange={(e) => setTitleSize(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {fontSizes.map((size) => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300 font-select"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {fontOptions.map((font) => (
                              <option 
                                key={font.value} 
                                value={font.value}
                                className={font.className}
                              >
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Size
                          </label>
                          <select
                            value={messageSize}
                            onChange={(e) => setMessageSize(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {messageSizes.map((size) => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Background */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Background</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Type
                          </label>
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                              style={{ focusRingColor: '#C0A172' }}
                            >
                              <option value="to-b">Top to Bottom</option>
                              <option value="to-r">Left to Right</option>
                              <option value="to-br">Top-Left to Bottom-Right</option>
                              <option value="to-bl">Top-Right to Bottom-Left</option>
                              <option value="radial">Radial</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transitions */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Slideshow Transitions</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transition Effect
                          </label>
                          <select
                            value={transitionEffect}
                            onChange={(e) => setTransitionEffect(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {transitionEffects.map((effect) => (
                              <option key={effect.value} value={effect.value}>
                                {effect.label}
                              </option>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300"
                            style={{ focusRingColor: '#C0A172' }}
                          >
                            {transitionSpeeds.map((speed) => (
                              <option key={speed.value} value={speed.value}>
                                {speed.label}
                              </option>
                            ))}
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
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>3s</span>
                          <span className="font-medium">{slideDuration / 1000}s</span>
                          <span>15s</span>
                        </div>
                      </div>
                    </div>

                    {/* Background Music */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800">Background Music</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setBackgroundMusic(null)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              !backgroundMusic
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            No Music
                          </button>
                        </div>

                        {backgroundMusicOptions.map((music) => (
                          <div
                            key={music.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              backgroundMusic?.id === music.id
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setBackgroundMusic(music)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{music.title}</h4>
                                <p className="text-sm text-gray-600">{music.genre}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Music className="w-5 h-5 text-gray-400" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const audio = new Audio(music.url);
                                    audio.play().catch(console.error);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Preview Your Time Capsule
                    </h2>

                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Eye className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Ready to Preview?
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        See how your time capsule will look when it's delivered to your recipients.
                      </p>
                      
                      <button
                        onClick={() => setShowPreview(true)}
                        className="btn-primary"
                        disabled={!title || !message}
                      >
                        Launch Preview
                      </button>
                      
                      {(!title || !message) && (
                        <p className="text-sm text-gray-500 mt-2">
                          Please add a title and message to preview your capsule
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Capsule Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Media Files</span>
                  <span className="font-medium">{mediaFiles.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recipients</span>
                  <span className="font-medium">
                    {recipients.filter(r => r.name.trim() && r.email.trim()).length}
                  </span>
                </div>
                
                {deliveryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">
                      {new Date(deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={loading || !title.trim() || !message.trim()}
                  className="w-full btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSaveAndSeal}
                  disabled={loading || !title.trim() || !message.trim() || !deliveryDate}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing && originalCapsuleStatus === 'sealed' ? 'Re-sealing...' : 'Sealing...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {isEditing && originalCapsuleStatus === 'sealed' ? 'Re-seal Capsule' : 'Save and Seal'}
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                {isEditing && originalCapsuleStatus === 'sealed' 
                  ? 'Re-sealing will update the capsule with your changes'
                  : 'Sealing will finalize your capsule for delivery'
                }
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Tips</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Add multiple photos to create a slideshow</li>
                <li>• Include audio messages for a personal touch</li>
                <li>• Choose fonts that match your message tone</li>
                <li>• Preview before sealing to ensure everything looks perfect</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SlideshowPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        message={message}
        senderName={user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'}
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
        slideDuration={slideDuration}
        backgroundMusic={backgroundMusic}
      />

      <FileArrangementModal
        isOpen={showFileArrangement}
        onClose={() => setShowFileArrangement(false)}
        mediaFiles={mediaFiles}
        onSave={(reorderedFiles) => {
          setMediaFiles(reorderedFiles);
          setShowFileArrangement(false);
        }}
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