import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  Calendar, 
  Users, 
  Type, 
  Palette, 
  Play,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Eye,
  Settings,
  Music,
  Clock,
  Shuffle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';

interface MediaFile {
  id: string;
  file: File | null;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
  storage_path?: string;
}

interface Recipient {
  name: string;
  email: string;
}

const backgroundMusicLibrary = [
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

export const CreateCapsule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCapsuleId = searchParams.get('edit');

  // Basic capsule data
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('12:00');

  // Media files
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Customization
  const [titleFont, setTitleFont] = useState('Playfair Display, serif');
  const [messageFont, setMessageFont] = useState('Inter, sans-serif');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FDF8F1');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#F4F6F7');
  const [slideDuration, setSlideDuration] = useState(5);
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [backgroundMusic, setBackgroundMusic] = useState<{
    id: string;
    title: string;
    url: string;
    genre: string;
  } | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFileArrangement, setShowFileArrangement] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load capsule data if editing
  useEffect(() => {
    if (editCapsuleId && user) {
      loadCapsuleData(editCapsuleId);
    }
  }, [editCapsuleId, user]);

  // Set default sender name when user loads
  useEffect(() => {
    if (user && !senderName && !editCapsuleId) {
      setSenderName(user.user_metadata?.name || user.email?.split('@')[0] || '');
    }
  }, [user, senderName, editCapsuleId]);

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
        setBackgroundMusic(customization.backgroundMusic || null);

        // Restore media files from saved data
        if (data.files && Array.isArray(data.files)) {
          const loadedFiles: MediaFile[] = data.files.map((fileData: any) => ({
            id: fileData.id || crypto.randomUUID(),
            file: null as any, // Set to null for loaded files
            type: fileData.type || 'image',
            url: fileData.url || '', // Use the stored Supabase URL directly
            name: fileData.name || 'Unknown file',
            size: fileData.size || 0,
            storage_path: fileData.storage_path
          }));
          setMediaFiles(loadedFiles);
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

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        triggerToast(`File ${file.name} is too large. Maximum size is 100MB.`, 'error');
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' :
                     file.type.startsWith('audio/') ? 'audio' : null;

      if (!fileType) {
        triggerToast(`File ${file.name} is not a supported format.`, 'error');
        return;
      }

      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        file,
        type: fileType,
        url: URL.createObjectURL(file), // Use blob URL for newly uploaded files
        name: file.name,
        size: file.size
      };

      setMediaFiles(prev => [...prev, mediaFile]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.url && fileToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
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

  const uploadMediaFiles = async () => {
    const uploadedFiles = [];
    
    for (const mediaFile of mediaFiles) {
      // Skip files that are already uploaded (loaded from database)
      if (!mediaFile.file || mediaFile.storage_path) {
        uploadedFiles.push({
          id: mediaFile.id,
          type: mediaFile.type,
          name: mediaFile.name,
          size: mediaFile.size,
          url: mediaFile.url, // Use existing URL for already uploaded files
          storage_path: mediaFile.storage_path
        });
        continue;
      }

      try {
        const fileExt = mediaFile.file.name.split('.').pop();
        const fileName = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, mediaFile.file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        uploadedFiles.push({
          id: mediaFile.id,
          type: mediaFile.type,
          name: mediaFile.name,
          size: mediaFile.size,
          url: publicUrl, // Use the Supabase public URL
          storage_path: fileName
        });
      } catch (error) {
        console.error('Error uploading file:', mediaFile.file.name, error);
        throw new Error(`Failed to upload ${mediaFile.file.name}`);
      }
    }
    
    return uploadedFiles;
  };

  const saveDraft = async () => {
    if (!user) {
      triggerToast('Please sign in to save your capsule.', 'error');
      return;
    }

    if (!title.trim()) {
      triggerToast('Please enter a title for your time capsule.', 'error');
      return;
    }

    setLoading(true);
    try {
      const uploadedFiles = await uploadMediaFiles();
      
      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        sender_name: senderName.trim(),
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        delivery_date: new Date(`${deliveryDate}T${deliveryTime}`).toISOString(),
        files: uploadedFiles,
        customization: {
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
        },
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      if (editCapsuleId) {
        // Update existing capsule
        const { error } = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editCapsuleId)
          .eq('user_id', user.id);

        if (error) throw error;
        triggerToast('Draft updated successfully!', 'success');
      } else {
        // Create new capsule
        const { error } = await supabase
          .from('capsules')
          .insert(capsuleData);

        if (error) throw error;
        triggerToast('Draft saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      triggerToast('Failed to save draft. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendCapsule = async () => {
    if (!user) {
      triggerToast('Please sign in to send your capsule.', 'error');
      return;
    }

    if (!title.trim() || !message.trim() || !deliveryDate) {
      triggerToast('Please fill in all required fields.', 'error');
      return;
    }

    const validRecipients = recipients.filter(r => r.name.trim() && r.email.trim());
    if (validRecipients.length === 0) {
      triggerToast('Please add at least one recipient.', 'error');
      return;
    }

    setLoading(true);
    try {
      const uploadedFiles = await uploadMediaFiles();
      
      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        sender_name: senderName.trim(),
        recipients: validRecipients,
        delivery_date: new Date(`${deliveryDate}T${deliveryTime}`).toISOString(),
        files: uploadedFiles,
        customization: {
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
        },
        status: 'sealed',
        updated_at: new Date().toISOString()
      };

      if (editCapsuleId) {
        // Update existing capsule
        const { error } = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editCapsuleId)
          .eq('user_id', user.id);

        if (error) throw error;
        triggerToast('Time capsule updated and ready for delivery!', 'success');
      } else {
        // Create new capsule
        const { error } = await supabase
          .from('capsules')
          .insert(capsuleData);

        if (error) throw error;
        triggerToast('Time capsule sealed and ready for delivery!', 'success');
      }

      // Redirect to my capsules page after a short delay
      setTimeout(() => {
        navigate('/my-capsules');
      }, 2000);
    } catch (error) {
      console.error('Error sending capsule:', error);
      triggerToast('Failed to send capsule. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileArrangementSave = (reorderedFiles: MediaFile[]) => {
    setMediaFiles(reorderedFiles);
    triggerToast('File order updated!', 'success');
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            {editCapsuleId ? 'Edit Time Capsule' : 'Create Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {editCapsuleId 
              ? 'Update your time capsule with new content or changes.'
              : 'Preserve your precious memories and schedule them for future delivery.'
            }
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="create-capsule-nav lg:flex lg:justify-center lg:space-x-8 lg:p-4">
            {[
              { id: 'content', label: 'Content', icon: Type },
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'customize', label: 'Customize', icon: Palette },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''} flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Capsule Content
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capsule Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Give your time capsule a meaningful title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Write your heartfelt message to be delivered in the future..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From (Your Name) *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Your name as it will appear to recipients..."
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Media Files
                    </h2>
                    {mediaFiles.length > 1 && (
                      <button
                        onClick={() => setShowFileArrangement(true)}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>Arrange Files</span>
                      </button>
                    )}
                  </div>

                  {/* File Upload Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Upload Your Media
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn-primary cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      Supports images, videos, and audio files (max 100MB each)
                    </p>
                  </div>

                  {/* Uploaded Files */}
                  {mediaFiles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-4">
                        Uploaded Media ({mediaFiles.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mediaFiles.map((file) => (
                          <div key={file.id} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {file.type === 'image' ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : file.type === 'video' ? (
                                <video
                                  src={file.url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Volume2 className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-gray-500 mt-2 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Recipients
                  </h2>

                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient name"
                            required
                          />
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient email"
                            required
                          />
                        </div>
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addRecipient}
                    className="btn-outline w-full py-3"
                  >
                    Add Another Recipient
                  </button>
                </motion.div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Delivery Schedule
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-blue-800 mb-2">
                      📅 Scheduling Tips
                    </h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Choose meaningful dates like birthdays, anniversaries, or graduations</li>
                      <li>• Consider time zones when setting delivery time</li>
                      <li>• You can modify the date later with our Advanced Scheduling feature</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-select"
                        >
                          <option value="Playfair Display, serif" className="font-preview-playfair">Playfair Display</option>
                          <option value="Inter, sans-serif" className="font-preview-inter">Inter</option>
                          <option value="Lora, serif" className="font-preview-lora">Lora</option>
                          <option value="Montserrat, sans-serif" className="font-preview-montserrat">Montserrat</option>
                          <option value="Roboto, sans-serif" className="font-preview-roboto">Roboto</option>
                          <option value="Open Sans, sans-serif" className="font-preview-opensans">Open Sans</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Font
                        </label>
                        <select
                          value={messageFont}
                          onChange={(e) => setMessageFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-select"
                        >
                          <option value="Inter, sans-serif" className="font-preview-inter">Inter</option>
                          <option value="Playfair Display, serif" className="font-preview-playfair">Playfair Display</option>
                          <option value="Lora, serif" className="font-preview-lora">Lora</option>
                          <option value="Montserrat, sans-serif" className="font-preview-montserrat">Montserrat</option>
                          <option value="Roboto, sans-serif" className="font-preview-roboto">Roboto</option>
                          <option value="Open Sans, sans-serif" className="font-preview-opensans">Open Sans</option>
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
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Background</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Type
                        </label>
                        <select
                          value={backgroundType}
                          onChange={(e) => setBackgroundType(e.target.value as 'solid' | 'gradient')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="solid">Solid Color</option>
                          <option value="gradient">Gradient</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>

                      {backgroundType === 'gradient' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secondary Color
                            </label>
                            <input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>

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
                              <option value="radial">Radial</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Slideshow Settings */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Slideshow Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slide Duration (seconds)
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="30"
                          value={slideDuration}
                          onChange={(e) => setSlideDuration(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transition Effect
                        </label>
                        <select
                          value={transitionEffect}
                          onChange={(e) => setTransitionEffect(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="slideUp">Slide Up</option>
                          <option value="slideDown">Slide Down</option>
                          <option value="zoom">Zoom In</option>
                          <option value="zoomOut">Zoom Out</option>
                          <option value="flipHorizontal">Flip Horizontal</option>
                          <option value="flipVertical">Flip Vertical</option>
                          <option value="rotate">Rotate</option>
                          <option value="spiral">Spiral</option>
                          <option value="blur">Blur</option>
                          <option value="bounce">Bounce</option>
                          <option value="elastic">Elastic</option>
                          <option value="curtain">Curtain</option>
                          <option value="wave">Wave</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transition Speed
                        </label>
                        <select
                          value={transitionSpeed}
                          onChange={(e) => setTransitionSpeed(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="slow">Slow</option>
                          <option value="medium">Medium</option>
                          <option value="fast">Fast</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Background Music */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Background Music</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Background Music (Optional)
                      </label>
                      <select
                        value={backgroundMusic?.id || ''}
                        onChange={(e) => {
                          const selectedMusic = backgroundMusicLibrary.find(music => music.id === e.target.value);
                          setBackgroundMusic(selectedMusic || null);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">No Background Music</option>
                        {backgroundMusicLibrary.map((music) => (
                          <option key={music.id} value={music.id}>
                            {music.title} - {music.genre}
                          </option>
                        ))}
                      </select>
                      {backgroundMusic && (
                        <p className="text-sm text-gray-500 mt-2">
                          Selected: {backgroundMusic.title} ({backgroundMusic.genre})
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Preview Your Capsule
                  </h2>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                    <h3 className="font-medium text-amber-800 mb-2">
                      🎬 Preview Mode
                    </h3>
                    <p className="text-amber-700 text-sm">
                      See exactly how your time capsule will look when delivered to recipients. 
                      You can make adjustments and preview again until it's perfect.
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3"
                      disabled={!title.trim() || mediaFiles.length === 0}
                    >
                      <Play className="w-6 h-6" />
                      <span>Preview Slideshow</span>
                    </button>
                    
                    {(!title.trim() || mediaFiles.length === 0) && (
                      <p className="text-sm text-gray-500 mt-3">
                        Add a title and at least one media file to preview
                      </p>
                    )}
                  </div>

                  {/* Preview Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-800 mb-4">Capsule Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="text-gray-800 font-medium">{title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Media Files:</span>
                        <span className="text-gray-800 font-medium">{mediaFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipients:</span>
                        <span className="text-gray-800 font-medium">
                          {recipients.filter(r => r.name.trim() && r.email.trim()).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="text-gray-800 font-medium">
                          {deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Background Music:</span>
                        <span className="text-gray-800 font-medium">
                          {backgroundMusic ? backgroundMusic.title : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={saveDraft}
                  disabled={loading || !title.trim()}
                  className="w-full btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!title.trim() || mediaFiles.length === 0}
                  className="w-full btn-secondary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={sendCapsule}
                  disabled={loading || !title.trim() || !message.trim() || !deliveryDate || recipients.filter(r => r.name.trim() && r.email.trim()).length === 0}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Capsule'}</span>
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Title</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${title.trim() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {title.trim() ? 'Complete' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Message</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${message.trim() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {message.trim() ? 'Complete' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Media</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${mediaFiles.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {mediaFiles.length > 0 ? `${mediaFiles.length} files` : 'None'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipients</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${recipients.filter(r => r.name.trim() && r.email.trim()).length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {recipients.filter(r => r.name.trim() && r.email.trim()).length || 'None'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Schedule</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${deliveryDate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {deliveryDate ? 'Set' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const tabs = ['content', 'media', 'recipients', 'schedule', 'customize', 'preview'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === 'content'}
                  className="flex-1 btn-outline py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={() => {
                    const tabs = ['content', 'media', 'recipients', 'schedule', 'customize', 'preview'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  disabled={activeTab === 'preview'}
                  className="flex-1 btn-outline py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
        deliveryDate={deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'Today'}
        slideDuration={slideDuration * 1000}
        backgroundMusic={backgroundMusic}
      />

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