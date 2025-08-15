import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  Volume2, 
  Calendar, 
  Users, 
  Save, 
  Send,
  Eye,
  ArrowLeft,
  ArrowRight,
  Play,
  Palette,
  Type,
  Music,
  Settings,
  FileText,
  User,
  Mail,
  Plus,
  Trash2
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
  storage_path?: string; // Path in Supabase storage
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

export const CreateCapsule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Core capsule data
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [senderName, setSenderName] = useState('');

  // Customization options
  const [titleFont, setTitleFont] = useState('Playfair Display, serif');
  const [messageFont, setMessageFont] = useState('Inter, sans-serif');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#F8F8F8');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#E5E7EB');
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [transitionSpeed, setTransitionSpeed] = useState('medium');
  const [slideDuration, setSlideDuration] = useState(5);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic | null>(null);

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

  // Load existing capsule if editing
  useEffect(() => {
    if (editId && user) {
      loadCapsule(editId);
    }
  }, [editId, user]);

  const loadCapsule = async (capsuleId: string) => {
    try {
      console.log('Loading capsule:', capsuleId);
      
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading capsule:', error);
        triggerToast('Failed to load capsule', 'error');
        return;
      }

      if (data) {
        console.log('Loaded capsule data:', data);
        
        // Load basic data
        setTitle(data.title || '');
        setMessage(data.message || '');
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        setDeliveryDate(data.delivery_date ? new Date(data.delivery_date).toISOString().split('T')[0] : '');
        setSenderName(data.sender_name || '');

        // Load customization
        const customization = data.customization || {};
        setTitleFont(customization.titleFont || 'Playfair Display, serif');
        setMessageFont(customization.messageFont || 'Inter, sans-serif');
        setTitleSize(customization.titleSize || 'text-4xl');
        setMessageSize(customization.messageSize || 'text-lg');
        setBackgroundColor(customization.backgroundColor || '#F8F8F8');
        setBackgroundType(customization.backgroundType || 'solid');
        setGradientDirection(customization.gradientDirection || 'to-b');
        setSecondaryColor(customization.secondaryColor || '#E5E7EB');
        setTransitionEffect(customization.transitionEffect || 'fade');
        setTransitionSpeed(customization.transitionSpeed || 'medium');
        setSlideDuration(customization.slideDuration || 5);
        setBackgroundMusic(customization.backgroundMusic || null);

        // Load media files
        console.log('Raw files data from database:', data.files);
        
        if (data.files) {
          let filesArray = [];
          
          try {
            // Handle different storage formats
            if (typeof data.files === 'string') {
              filesArray = JSON.parse(data.files);
            } else if (Array.isArray(data.files)) {
              filesArray = data.files;
            }
            
            console.log('Parsed files array:', filesArray);
            
            // Convert stored file data back to MediaFile objects
            const loadedFiles: MediaFile[] = filesArray.map((fileData: any) => ({
              id: fileData.id || crypto.randomUUID(),
              file: new File([], fileData.name || 'unknown'), // Placeholder file object
              type: fileData.type || 'image',
              url: fileData.url || '',
              name: fileData.name || 'Unknown file',
              size: fileData.size || 0,
              storage_path: fileData.storage_path
            }));
            
            console.log('Loaded media files:', loadedFiles);
            setMediaFiles(loadedFiles);
            
          } catch (parseError) {
            console.error('Error parsing files data:', parseError);
            setMediaFiles([]);
          }
        } else {
          setMediaFiles([]);
        }
      }
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load capsule', 'error');
    }
  };

  // Upload media files to Supabase Storage
  const uploadMediaFiles = async (files: MediaFile[]): Promise<any[]> => {
    console.log('Starting media file upload process...');
    console.log('Files to upload:', files);
    
    const uploadedFiles = [];

    for (const mediaFile of files) {
      try {
        // Skip files that are already uploaded
        if (mediaFile.storage_path) {
          console.log(`Skipping already uploaded file: ${mediaFile.name}`);
          uploadedFiles.push({
            id: mediaFile.id,
            name: mediaFile.name,
            type: mediaFile.type,
            url: mediaFile.url,
            size: mediaFile.size,
            storage_path: mediaFile.storage_path
          });
          continue;
        }

        console.log(`Uploading file: ${mediaFile.name}`);
        
        // Generate unique filename
        const fileExt = mediaFile.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const fileName = `${user?.id}/capsules/${timestamp}-${randomId}.${fileExt}`;
        
        console.log(`Generated filename: ${fileName}`);

        // Upload to Supabase Storage (using 'avatars' bucket as specified)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, mediaFile.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${mediaFile.name}:`, uploadError);
          throw uploadError;
        }

        console.log(`Upload successful for ${mediaFile.name}:`, uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        console.log(`Generated public URL: ${publicUrl}`);

        // Store file metadata
        const fileMetadata = {
          id: mediaFile.id,
          name: mediaFile.name,
          type: mediaFile.type,
          url: publicUrl,
          size: mediaFile.size,
          storage_path: fileName
        };

        uploadedFiles.push(fileMetadata);
        console.log(`File metadata created:`, fileMetadata);

      } catch (error) {
        console.error(`Failed to upload ${mediaFile.name}:`, error);
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
      triggerToast('Please enter a title for your capsule', 'warning');
      return;
    }

    setLoading(true);
    console.log('=== STARTING SAVE AS DRAFT PROCESS ===');
    
    try {
      // Step 1: Upload media files if any exist
      let uploadedFiles = [];
      if (mediaFiles.length > 0) {
        console.log('Uploading media files...');
        uploadedFiles = await uploadMediaFiles(mediaFiles);
        console.log('Media files uploaded successfully:', uploadedFiles);
      } else {
        console.log('No media files to upload');
      }

      // Step 2: Prepare capsule data
      const capsuleData = {
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        sender_name: senderName.trim() || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        delivery_date: deliveryDate || new Date().toISOString(),
        files: uploadedFiles, // Store as array directly
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

      // Step 3: Save to database
      let result;
      if (editId) {
        console.log('Updating existing capsule...');
        result = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        console.log('Creating new capsule...');
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
      console.log('=== SAVE AS DRAFT PROCESS COMPLETED ===');
      
      triggerToast('Capsule saved as draft successfully!', 'success');
      
      // Navigate to my capsules page
      setTimeout(() => {
        navigate('/my-capsules');
      }, 1500);

    } catch (error) {
      console.error('=== SAVE AS DRAFT FAILED ===');
      console.error('Error details:', error);
      triggerToast(`Failed to save capsule: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected for upload:', files);
    
    files.forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];
      if (!validTypes.includes(file.type)) {
        triggerToast(`Unsupported file type: ${file.type}`, 'error');
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        triggerToast(`File too large: ${file.name}. Maximum size is 100MB.`, 'error');
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 'audio';

      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        file,
        type: fileType,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      console.log('Created media file object:', mediaFile);
      setMediaFiles(prev => [...prev, mediaFile]);
    });

    // Clear the input
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addRecipient = () => {
    setRecipients([...recipients, { name: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {editId ? 'Edit Time Capsule' : 'Create Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600">
            Preserve your precious memories for future delivery
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'recipients', label: 'Recipients', icon: Users },
              { id: 'customize', label: 'Customize', icon: Palette },
              { id: 'schedule', label: 'Schedule', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
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
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Write a heartfelt message to your recipients..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From (Sender Name)
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
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Media Files
                    </label>
                    
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">
                            Uploaded Files ({mediaFiles.length})
                          </h4>
                          {mediaFiles.length > 1 && (
                            <button
                              onClick={() => setShowFileArrangement(true)}
                              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                              Arrange Order
                            </button>
                          )}
                        </div>
                        
                        {mediaFiles.map((file) => (
                          <div key={file.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {file.type === 'image' ? (
                                <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  {file.type === 'video' ? (
                                    <Video className="w-6 h-6 text-gray-500" />
                                  ) : (
                                    <Volume2 className="w-6 h-6 text-gray-500" />
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.type} • {formatFileSize(file.size)}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Who will receive this time capsule?
                    </h3>
                    
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Recipient name"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Email address"
                          />
                        </div>
                        {recipients.length > 1 && (
                          <button
                            onClick={() => removeRecipient(index)}
                            className="p-3 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={addRecipient}
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Another Recipient</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-6">
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
                        <option value="Playfair Display, serif">Playfair Display</option>
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Lora, serif">Lora</option>
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
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Playfair Display, serif">Playfair Display</option>
                        <option value="Lora, serif">Lora</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-12 border border-gray-300 rounded-lg"
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
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
              <button
                onClick={() => setShowPreview(true)}
                className="w-full btn-primary py-3 flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview Slideshow
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  className="w-full btn-outline py-3 flex items-center justify-center disabled:opacity-50"
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
              </div>
            </div>

            {/* File Summary */}
            {mediaFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Media Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <span className="font-medium">{mediaFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-medium">{mediaFiles.filter(f => f.type === 'image').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos:</span>
                    <span className="font-medium">{mediaFiles.filter(f => f.type === 'video').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audio:</span>
                    <span className="font-medium">{mediaFiles.filter(f => f.type === 'audio').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slideshow Preview Modal */}
      <SlideshowPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        message={message}
        senderName={senderName || user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'}
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
        onSave={(reorderedFiles) => setMediaFiles(reorderedFiles)}
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