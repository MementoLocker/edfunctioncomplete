import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Play, 
  Pause, 
  Save, 
  Send, 
  Calendar, 
  Users, 
  Type, 
  Palette, 
  Music, 
  Eye, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Volume2,
  ArrowUpDown,
  User,
  Mail,
  MessageSquare,
  Settings,
  Clock,
  Package
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { SlideshowPreview } from '../components/SlideshowPreview';
import { FileArrangementModal } from '../components/FileArrangementModal';

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
  const [senderName, setSenderName] = useState('');
  
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
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showArrangement, setShowArrangement] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Load existing capsule if editing
  useEffect(() => {
    if (editId && user) {
      loadCapsule(editId);
    }
  }, [editId, user]);

  // Set sender name from user data
  useEffect(() => {
    if (user && !senderName) {
      setSenderName(user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous');
    }
  }, [user, senderName]);

  const loadCapsule = async (capsuleId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      // Load basic data
      setTitle(data.title || '');
      setMessage(data.message || '');
      setRecipients(data.recipients || [{ name: '', email: '' }]);
      setDeliveryDate(data.delivery_date ? new Date(data.delivery_date).toISOString().split('T')[0] : '');

      // Load customization
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
        
        if (custom.backgroundMusic) {
          setBackgroundMusic(custom.backgroundMusic);
        }
      }

      // Load media files using your suggested approach
      if (data.files && Array.isArray(data.files)) {
        const loadedFiles: MediaFile[] = data.files.map((fileData: any) => ({
          id: fileData.id || crypto.randomUUID(),
          file: new File([], fileData.name || 'unknown'), // placeholder file object
          type: fileData.type || 'image',
          url: fileData.url || '',
          name: fileData.name || 'Unknown file',
          size: fileData.size || 0,
          storage_path: fileData.storage_path
        }));
        setMediaFiles(loadedFiles);
        console.log('Loaded media files from draft:', loadedFiles);
      }

      triggerToast('Draft loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load capsule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFiles = async (files: MediaFile[]): Promise<any[]> => {
    const uploadedFiles: any[] = [];
    
    for (const mediaFile of files) {
      try {
        // Skip files that are already uploaded (have storage_path)
        if (mediaFile.storage_path) {
          console.log('Skipping already uploaded file:', mediaFile.name);
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
        const fileName = `${user?.id}/capsules/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          .from('captules')
        // Upload to Supabase Storage (captules bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('captules')
          .upload(fileName, mediaFile.file);

        if (uploadError) {
          console.error('Upload error for file:', mediaFile.name, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('captules')
          .getPublicUrl(fileName);

        console.log('Generated public URL:', publicUrl);

          .from('captules')
          .getPublicUrl(fileName);

        const uploadedFile = {
          id: mediaFile.id,
          name: mediaFile.name,
          type: mediaFile.type,
          size: mediaFile.size,
          url: publicUrl, // Use permanent Supabase public URL
          storage_path: fileName
        };

        uploadedFiles.push(uploadedFile);
        console.log('Successfully uploaded file:', uploadedFile);
        
      } catch (error) {
        console.error('Error uploading file:', mediaFile.name, error);
        throw new Error(`Failed to upload ${mediaFile.name}: ${error.message}`);
      }
    }
    
    return uploadedFiles;
  };

  const handleSaveAsDraft = async () => {
    if (!user) {
      triggerToast('Please sign in to save your capsule', 'error');
      return;
    }

    if (!title.trim()) {
      triggerToast('Please enter a title for your capsule', 'warning');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting save as draft process...');
      console.log('Media files to process:', mediaFiles);

      // Upload media files to Supabase Storage
      let uploadedFiles: any[] = [];
      if (mediaFiles.length > 0) {
        console.log('Uploading media files...');
        uploadedFiles = await uploadMediaFiles(mediaFiles);
        console.log('All files uploaded successfully:', uploadedFiles);
      }

      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        delivery_date: deliveryDate || new Date().toISOString(),
        files: uploadedFiles, // Store as direct array
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
          backgroundMusic
        },
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('Saving capsule data:', capsuleData);

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

      if (result.error) throw result.error;

      console.log('Capsule saved successfully:', result.data);
      triggerToast('Draft saved successfully!', 'success');
      
      // Navigate to my capsules page
      setTimeout(() => {
        navigate('/my-capsules');
      }, 1500);

    } catch (error) {
      console.error('Error saving draft:', error);
      triggerToast(`Failed to save draft: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];
      if (!validTypes.includes(file.type)) {
        triggerToast(`${file.name} is not a supported file type`, 'error');
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        triggerToast(`${file.name} is too large. Maximum size is 100MB`, 'error');
        return;
      }

      // Use blob URL only for newly uploaded files in current session
      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        file,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      setMediaFiles(prev => [...prev, mediaFile]);
    });

    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  const removeFile = (fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.url.startsWith('blob:')) {
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

  const handleArrangeFiles = () => {
    if (mediaFiles.length === 0) {
      triggerToast('Please upload some media files first', 'warning');
      return;
    }
    setShowArrangement(true);
  };

  const handleFileArrangementSave = (reorderedFiles: MediaFile[]) => {
    setMediaFiles(reorderedFiles);
    triggerToast('File order updated', 'success');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to create time capsules.</p>
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            {editId ? 'Edit Time Capsule' : 'Create Time Capsule'}
          </h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'content', label: 'Content', icon: MessageSquare },
                  { id: 'recipients', label: 'Recipients', icon: Users },
                  { id: 'schedule', label: 'Schedule', icon: Calendar },
                  { id: 'customize', label: 'Customize', icon: Palette },
                  { id: 'preview', label: 'Preview', icon: Eye }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capsule Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Give your time capsule a meaningful title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Write a heartfelt message to your recipients..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Your name or how you'd like to be identified..."
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
                          onClick={handleArrangeFiles}
                          className="text-sm text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          <span>Arrange Order</span>
                        </button>
                      )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Drag and drop your files here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports images, videos, and audio files (max 100MB each)
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                      >
                        Choose Files
                      </button>
                    </div>

                    {/* Uploaded Files */}
                    {mediaFiles.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mediaFiles.map((file) => (
                          <div key={file.id} className="relative bg-white rounded-lg p-4 shadow border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {file.type === 'image' ? (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                    {file.type === 'video' ? (
                                      <Video className="w-6 h-6 text-gray-500" />
                                    ) : (
                                      <Volume2 className="w-6 h-6 text-gray-500" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Recipients</h3>
                    <button
                      onClick={addRecipient}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Recipient</span>
                    </button>
                  </div>

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
                          />
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient email"
                          />
                        </div>
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
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
                    <p className="text-sm text-gray-500 mt-2">
                      Choose when you want this time capsule to be delivered to your recipients.
                    </p>
                  </div>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-8">
                  {/* Typography */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title Font</label>
                        <select
                          value={titleFont}
                          onChange={(e) => setTitleFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                          <option value="Inter, sans-serif">Inter (Modern)</option>
                          <option value="Lora, serif">Lora (Classic)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Font</label>
                        <select
                          value={messageFont}
                          onChange={(e) => setMessageFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="Inter, sans-serif">Inter (Clean)</option>
                          <option value="Lora, serif">Lora (Readable)</option>
                          <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-12 border border-gray-300 rounded-lg"
                        />
                      </div>
                      {backgroundType === 'gradient' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-full h-12 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transitions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Slideshow Transitions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transition Effect</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transition Speed</label>
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Background Music</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          id="no-music"
                          name="background-music"
                          checked={!backgroundMusic}
                          onChange={() => setBackgroundMusic(null)}
                          className="text-amber-600"
                        />
                        <label htmlFor="no-music" className="text-gray-700">No background music</label>
                      </div>
                      
                      {backgroundMusicOptions.map((music) => (
                        <div key={music.id} className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id={music.id}
                            name="background-music"
                            checked={backgroundMusic?.id === music.id}
                            onChange={() => setBackgroundMusic(music)}
                            className="text-amber-600"
                          />
                          <label htmlFor={music.id} className="flex-1 text-gray-700">
                            {music.title} <span className="text-gray-500">({music.genre})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Who will receive this time capsule?</h3>
                    <button
                      onClick={addRecipient}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Recipient</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient name"
                          />
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient email"
                          />
                        </div>
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">When should this be delivered?</h3>
                    <div className="max-w-md">
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
                      <p className="text-sm text-gray-500 mt-2">
                        Your time capsule will be delivered on this date.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-8">
                  {/* Typography Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title Font</label>
                        <select
                          value={titleFont}
                          onChange={(e) => setTitleFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                          <option value="Inter, sans-serif">Inter (Modern)</option>
                          <option value="Lora, serif">Lora (Classic)</option>
                          <option value="Montserrat, sans-serif">Montserrat (Bold)</option>
                          <option value="Roboto, sans-serif">Roboto (Clean)</option>
                          <option value="Open Sans, sans-serif">Open Sans (Friendly)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Font</label>
                        <select
                          value={messageFont}
                          onChange={(e) => setMessageFont(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="Inter, sans-serif">Inter (Clean)</option>
                          <option value="Lora, serif">Lora (Readable)</option>
                          <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                          <option value="Montserrat, sans-serif">Montserrat (Bold)</option>
                          <option value="Roboto, sans-serif">Roboto (Clean)</option>
                          <option value="Open Sans, sans-serif">Open Sans (Friendly)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title Size</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message Size</label>
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

                  {/* Background Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-12 border border-gray-300 rounded-lg"
                        />
                      </div>
                      {backgroundType === 'gradient' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                            <input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="w-full h-12 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Direction</label>
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

                  {/* Transitions Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Slideshow Transitions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transition Effect</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transition Speed</label>
                        <select
                          value={transitionSpeed}
                          onChange={(e) => setTransitionSpeed(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="slow">Slow (1.2s)</option>
                          <option value="medium">Medium (0.8s)</option>
                          <option value="fast">Fast (0.5s)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Background Music Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Background Music</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          id="no-music"
                          name="background-music"
                          checked={!backgroundMusic}
                          onChange={() => setBackgroundMusic(null)}
                          className="text-amber-600"
                        />
                        <label htmlFor="no-music" className="text-gray-700">No background music</label>
                      </div>
                      
                      {backgroundMusicOptions.map((music) => (
                        <div key={music.id} className="flex items-center space-x-4">
                          <input
                            type="radio"
                            id={music.id}
                            name="background-music"
                            checked={backgroundMusic?.id === music.id}
                            onChange={() => setBackgroundMusic(music)}
                            className="text-amber-600"
                          />
                          <label htmlFor={music.id} className="flex-1 text-gray-700">
                            {music.title} <span className="text-gray-500">({music.genre})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Your Time Capsule</h3>
                    <p className="text-gray-600 mb-8">
                      See how your time capsule will look when it's delivered to recipients.
                    </p>
                    
                    <button
                      onClick={handlePreview}
                      className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3"
                    >
                      <Eye className="w-6 h-6" />
                      <span>Preview Slideshow</span>
                    </button>
                  </div>

                  {mediaFiles.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-800 mb-4">Media Files ({mediaFiles.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaFiles.slice(0, 8).map((file) => (
                          <div key={file.id} className="relative">
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                {file.type === 'video' ? (
                                  <Video className="w-8 h-8 text-gray-500" />
                                ) : (
                                  <Volume2 className="w-8 h-8 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {mediaFiles.length > 8 && (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm">+{mediaFiles.length - 8} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="btn-outline text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
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
              onClick={handlePreview}
              className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-3"
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </button>
          </div>
        </motion.div>
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
        deliveryDate={deliveryDate || 'Today'}
        backgroundMusic={backgroundMusic}
      />

      {/* File Arrangement Modal */}
      <FileArrangementModal
        isOpen={showArrangement}
        onClose={() => setShowArrangement(false)}
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