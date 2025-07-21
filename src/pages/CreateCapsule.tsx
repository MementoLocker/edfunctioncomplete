import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ToastNotification } from '../components/ToastNotification';
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
  Trash2
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
  const [deliveryDate, setDeliveryDate] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Customization state
  const [titleFont, setTitleFont] = useState('Playfair Display');
  const [messageFont, setMessageFont] = useState('Inter');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'media', label: 'Media', icon: Upload },
    { id: 'customize', label: 'Style', icon: Palette },
    { id: 'recipients', label: 'Send To', icon: Users }
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

    if (editId) {
      loadCapsuleForEdit(editId);
    }
  }, [user, editId, navigate]);

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
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        // Note: Files would need to be handled separately for editing
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
      const capsuleData = {
        user_id: user?.id,
        title: title.trim(),
        message: message.trim(),
        delivery_date: new Date(deliveryDate).toISOString(),
        recipients: recipients.filter(r => r.name.trim() && r.email.trim()),
        files: [], // Files would be uploaded to storage separately
        customization: {
          titleFont,
          messageFont,
          titleSize,
          messageSize,
          backgroundColor
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
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Create Your Time Capsule
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ 
                  borderColor: activeTab === tab.id ? '#C0A172' : 'transparent',
                  color: activeTab === tab.id ? '#C0A172' : undefined
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Capsule Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capsule Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ focusRingColor: '#C0A172' }}
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
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ focusRingColor: '#C0A172' }}
                    placeholder="Write a heartfelt message to your recipients..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ focusRingColor: '#C0A172' }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Media</h2>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Upload Photos, Videos & Audio
                  </h3>
                  <p className="text-gray-500 mb-4">
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
                    className="btn-primary cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Uploaded Files */}
                {mediaFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Customize Appearance</h2>
                
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        <option value="Playfair Display">Playfair Display (Elegant)</option>
                        <option value="Inter">Inter (Modern)</option>
                        <option value="serif">Times (Classic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Font
                      </label>
                      <select
                        value={messageFont}
                        onChange={(e) => setMessageFont(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ focusRingColor: '#C0A172' }}
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Playfair Display">Playfair Display (Elegant)</option>
                        <option value="serif">Times (Classic)</option>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
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
                  <h3 className="text-lg font-medium text-gray-800">Background</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ focusRingColor: '#C0A172' }}
                        placeholder="#FFFFFF"
                      />
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recipients</h2>
                
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={recipient.name}
                          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          style={{ focusRingColor: '#C0A172' }}
                          placeholder="Recipient Name"
                        />
                        <input
                          type="email"
                          value={recipient.email}
                          onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
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
          <button
            onClick={() => saveCapsule('draft')}
            disabled={loading}
            className="flex-1 btn-outline py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Save as Draft
          </button>
          
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

      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};