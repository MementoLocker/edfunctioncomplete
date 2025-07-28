code for create capule which saved uploads but broke the UI

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';
import { 
  Calendar, 
  Users, 
  Upload, 
  Save, 
  Send, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Image,
  Video,
  Volume2,
  ArrowUpDown,
  Play,
  Music
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
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
  const editId = searchParams.get('edit');

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'recipients' | 'customize' | 'preview'>('content');

  // Customization state
  const [titleFont, setTitleFont] = useState('Playfair Display');
  const [messageFont, setMessageFont] = useState('Inter');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#F8F8F8');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#E5E7EB');
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [slideDuration, setSlideDuration] = useState(5000);
  const [backgroundMusic, setBackgroundMusic] = useState<typeof backgroundMusicLibrary[0] | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [showPreview, setShowPreview] = useState(false);
  const [showFileArrangement, setShowFileArrangement] = useState(false);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load existing capsule for editing
  useEffect(() => {
    if (editId && user) {
      loadCapsuleForEditing(editId);
    }
  }, [editId, user]);

  const loadCapsuleForEditing = async (capsuleId: string) => {
    try {
      setLoading(true);
      console.log('Loading capsule for editing:', capsuleId);

      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      console.log('Loaded capsule data:', data);

      // Set basic fields
      setTitle(data.title || '');
      setMessage(data.message || '');
      setRecipients(data.recipients || [{ name: '', email: '' }]);
      setDeliveryDate(data.delivery_date ? new Date(data.delivery_date).toISOString().split('T')[0] : '');

      // Load customization
      if (data.customization) {
        const custom = data.customization;
        setTitleFont(custom.titleFont || 'Playfair Display');
        setMessageFont(custom.messageFont || 'Inter');
        setTitleSize(custom.titleSize || 'text-4xl');
        setMessageSize(custom.messageSize || 'text-lg');
        setBackgroundColor(custom.backgroundColor || '#F8F8F8');
        setBackgroundType(custom.backgroundType || 'solid');
        setGradientDirection(custom.gradientDirection || 'to-b');
        setSecondaryColor(custom.secondaryColor || '#E5E7EB');
        setTransitionEffect(custom.transitionEffect || 'fade');
        setTransitionSpeed(custom.transitionSpeed || 'medium');
        setSlideDuration(custom.slideDuration || 5000);
        if (custom.backgroundMusic) {
          setBackgroundMusic(custom.backgroundMusic);
        }
      }

      // Load media files
      if (data.files) {
        console.log('Raw files data from database:', data.files);
        
        try {
          let filesData;
          if (typeof data.files === 'string') {
            filesData = JSON.parse(data.files);
          } else {
            filesData = data.files;
          }

          console.log('Parsed files data:', filesData);

          if (Array.isArray(filesData) && filesData.length > 0) {
            const reconstructedFiles: MediaFile[] = filesData.map((fileData: any) => ({
              id: fileData.id || Math.random().toString(36).substr(2, 9),
              file: new File([], fileData.name || 'unknown'), // Placeholder file object
              type: fileData.type || 'image',
              url: fileData.url || fileData.storage_url || '',
              name: fileData.name || 'Unknown file',
              size: fileData.size || 0,
              storage_path: fileData.storage_path || fileData.url
            }));

            console.log('Reconstructed media files:', reconstructedFiles);
            setMediaFiles(reconstructedFiles);
          }
        } catch (parseError) {
          console.error('Error parsing files data:', parseError);
          setMediaFiles([]);
        }
      }

      triggerToast('Capsule loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load capsule', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Upload media files to Supabase Storage
  const uploadMediaFiles = async (files: MediaFile[]): Promise<any[]> => {
    console.log('Starting file upload process for', files.length, 'files');
    const uploadedFiles = [];

    for (const mediaFile of files) {
      try {
        // Skip files that are already uploaded (have storage_path)
        if (mediaFile.storage_path) {
          console.log('File already uploaded, skipping:', mediaFile.name);
          uploadedFiles.push({
            id: mediaFile.id,
            name: mediaFile.name,
            type: mediaFile.type,
            size: mediaFile.size,
            url: mediaFile.url,
            storage_path: mediaFile.storage_path
          });
          continue;
        }

        console.log('Uploading file:', mediaFile.name);

        // Generate unique filename
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user?.id}/capsules/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        // Upload to Supabase Storage (using avatars bucket as specified)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, mediaFile.file);

        if (uploadError) {
          console.error('Upload error for file', mediaFile.name, ':', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', fileName);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        console.log('Public URL generated:', publicUrl);

        // Add to uploaded files array
        uploadedFiles.push({
          id: mediaFile.id,
          name: mediaFile.name,
          type: mediaFile.type,
          size: mediaFile.size,
          url: publicUrl,
          storage_path: fileName
        });

      } catch (error) {
        console.error('Error uploading file', mediaFile.name, ':', error);
        throw new Error(`Failed to upload ${mediaFile.name}: ${error.message}`);
      }
    }

    console.log('All files uploaded successfully:', uploadedFiles);
    return uploadedFiles;
  };

  const handleSaveAsDraft = async () => {
    if (!user) {
      triggerToast('Please sign in to save your capsule', 'error');
      return;
    }

    if (!title.trim()) {
      triggerToast('Please enter a title for your capsule', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting save as draft process...');
      console.log('Media files to upload:', mediaFiles);

      // Upload media files first
      let uploadedFiles = [];
      if (mediaFiles.length > 0) {
        console.log('Uploading media files...');
        uploadedFiles = await uploadMediaFiles(mediaFiles);
        console.log('Media files uploaded:', uploadedFiles);
      }

      // Prepare capsule data
      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        recipients: recipients.filter(r => r.name.trim() || r.email.trim()),
        delivery_date: deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        files: JSON.stringify(uploadedFiles), // Store as JSON string
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
          backgroundMusic
        },
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('Capsule data to save:', capsuleData);

      let result;
      if (editId) {
        // Update existing capsule
        result = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new capsule
        result = await supabase
          .from('capsules')
          .insert(capsuleData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Database save error:', result.error);
        throw result.error;
      }

      console.log('Capsule saved successfully:', result.data);

      // Update media files with storage paths
      if (uploadedFiles.length > 0) {
        const updatedMediaFiles = mediaFiles.map(file => {
          const uploadedFile = uploadedFiles.find(uf => uf.id === file.id);
          if (uploadedFile) {
            return {
              ...file,
              url: uploadedFile.url,
              storage_path: uploadedFile.storage_path
            };
          }
          return file;
        });
        setMediaFiles(updatedMediaFiles);
      }

      triggerToast('Draft saved successfully!', 'success');

      // If this was a new capsule, update the URL to include the edit ID
      if (!editId && result.data) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('edit', result.data.id);
        window.history.replaceState({}, '', newUrl.toString());
      }

    } catch (error) {
      console.error('Error saving draft:', error);
      triggerToast(`Failed to save draft: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSeal = async () => {
    if (!user) {
      triggerToast('Please sign in to save your capsule', 'error');
      return;
    }

    if (!title.trim()) {
      triggerToast('Please enter a title for your capsule', 'error');
      return;
    }

    if (!deliveryDate) {
      triggerToast('Please select a delivery date', 'error');
      return;
    }

    if (recipients.filter(r => r.name.trim() && r.email.trim()).length === 0) {
      triggerToast('Please add at least one recipient', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting save and seal process...');

      // Upload media files first
      let uploadedFiles = [];
      if (mediaFiles.length > 0) {
        console.log('Uploading media files...');
        uploadedFiles = await uploadMediaFiles(mediaFiles);
        console.log('Media files uploaded:', uploadedFiles);
      }

      // Prepare capsule data
      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        delivery_date: new Date(deliveryDate).toISOString(),
        files: JSON.stringify(uploadedFiles), // Store as JSON string
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
          backgroundMusic
        },
        status: 'sealed',
        updated_at: new Date().toISOString()
      };

      console.log('Capsule data to save and seal:', capsuleData);

      let result;
      if (editId) {
        // Update existing capsule
        result = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new capsule
        result = await supabase
          .from('capsules')
          .insert(capsuleData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Database save error:', result.error);
        throw result.error;
      }

      console.log('Capsule saved and sealed successfully:', result.data);

      triggerToast('Time capsule saved and sealed successfully!', 'success');

      // Redirect to capsules list
      setTimeout(() => {
        navigate('/my-capsules');
      }, 1500);

    } catch (error) {
      console.error('Error saving and sealing capsule:', error);
      triggerToast(`Failed to save capsule: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];
      if (!validTypes.includes(file.type)) {
        triggerToast(`${file.name} is not a supported file type`, 'error');
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        triggerToast(`${file.name} is too large. Maximum size is 100MB`, 'error');
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'audio';

      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: fileType,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      setMediaFiles(prev => [...prev, mediaFile]);
    });

    // Reset input
    e.target.value = '';
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.url.startsWith('blob:')) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (loading && !editId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            {editId ? 'Edit Time Capsule' : 'Create Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preserve your precious memories and schedule them for future delivery to your loved ones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'content', label: 'Content', icon: Upload },
                  { id: 'recipients', label: 'Recipients', icon: Users },
                  { id: 'customize', label: 'Customize', icon: Eye },
                  { id: 'preview', label: 'Preview', icon: Play }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Capsule Content</h2>
                    
                    {/* Title */}
                    <div className="mb-6">
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

                    {/* Message */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personal Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Write a heartfelt message to your recipients..."
                      />
                    </div>

                    {/* Delivery Date */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    {/* Media Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Media Files ({mediaFiles.length})
                        </label>
                        {mediaFiles.length > 1 && (
                          <button
                            onClick={() => setShowFileArrangement(true)}
                            className="flex items-center space-x-2 text-sm text-amber-600 hover:text-amber-700"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                            <span>Arrange Files</span>
                          </button>
                        )}
                      </div>

                      {/* Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="media-upload"
                        />
                        <label htmlFor="media-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            Upload Photos, Videos & Audio
                          </p>
                          <p className="text-sm text-gray-500">
                            Drag and drop files here, or click to browse
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Supports: JPG, PNG, GIF, MP4, MOV, MP3, WAV (Max 100MB each)
                          </p>
                        </label>
                      </div>

                      {/* Uploaded Files */}
                      {mediaFiles.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {mediaFiles.map((file) => (
                            <div key={file.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
                                {file.type === 'image' ? (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    {getFileIcon(file.type)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="capitalize">{file.type}</span>
                                  <span>{formatFileSize(file.size)}</span>
                                  {file.storage_path && (
                                    <span className="text-green-600">✓ Uploaded</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeMediaFile(file.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Recipients</h2>
                    
                    <div className="space-y-4">
                      {recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Recipient Name"
                            />
                            <input
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Recipient Email"
                            />
                          </div>
                          {recipients.length > 1 && (
                            <button
                              onClick={() => removeRecipient(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addRecipient}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Recipient</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Appearance</h2>
                  
                  {/* Typography */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title Font
                      </label>
                      <select
                        value={titleFont}
                        onChange={(e) => setTitleFont(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Inter">Inter</option>
                        <option value="Lora">Lora</option>
                        <option value="Montserrat">Montserrat</option>
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
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Lora">Lora</option>
                        <option value="Montserrat">Montserrat</option>
                      </select>
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Background
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
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
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-12 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {backgroundType === 'gradient' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Secondary Color
                          </label>
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-full h-12 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
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
                      </div>
                    )}
                  </div>

                  {/* Transitions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <option value="zoom">Zoom In</option>
                        <option value="zoomOut">Zoom Out</option>
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

                  {/* Background Music */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Background Music (Optional)
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="no-music"
                          name="background-music"
                          checked={!backgroundMusic}
                          onChange={() => setBackgroundMusic(null)}
                          className="mr-3"
                        />
                        <label htmlFor="no-music" className="text-gray-700">No background music</label>
                      </div>
                      
                      {backgroundMusicLibrary.map((track) => (
                        <div key={track.id} className="flex items-center">
                          <input
                            type="radio"
                            id={track.id}
                            name="background-music"
                            checked={backgroundMusic?.id === track.id}
                            onChange={() => setBackgroundMusic(track)}
                            className="mr-3"
                          />
                          <label htmlFor={track.id} className="flex-1 flex items-center justify-between text-gray-700">
                            <span>{track.title}</span>
                            <span className="text-sm text-gray-500">{track.genre}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Preview Your Capsule</h2>
                  
                  <div className="text-center">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Preview Slideshow
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      See how your time capsule will look when delivered
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  className="flex-1 btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  disabled={loading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Save and Seal
                    </>
                  )}
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

      {/* File Arrangement Modal */}
      <FileArrangementModal
        isOpen={showFileArrangement}
        onClose={() => setShowFileArrangement(false)}
        mediaFiles={mediaFiles}
        onSave={setMediaFiles}
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
