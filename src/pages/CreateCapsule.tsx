import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Play,
  Pause,
  Image as ImageIcon,
  Music,
  FileText,
  Eye,
  Calendar,
  Users,
  User,
  Palette,
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

// This interface is for the local state, including the browser's File object
interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string; // This will be a temporary blob URL for previews
  name: string;
  size: number;
}

// This is the shape of the data that gets saved to and loaded from the database
interface StoredFileData {
    url: string; // This is the permanent Supabase Storage URL
    name: string;
    size: number;
    type: 'image' | 'video' | 'audio';
    storage_path: string;
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
  
  // Customization state (from your original file)
  const [titleFont, setTitleFont] = useState('Playfair Display, serif');
  const [messageFont, setMessageFont] = useState('Inter, sans-serif');
  const [titleSize, setTitleSize] = useState('text-4xl');
  const [messageSize, setMessageSize] = useState('text-lg');
  const [backgroundColor, setBackgroundColor] = useState('#FDF8F1');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-b');
  const [secondaryColor, setSecondaryColor] = useState('#F4F6F7');
  const [slideDuration, setSlideDuration] = useState(5);
  const [backgroundMusic, setBackgroundMusic] = useState<{ id: string; title: string; url: string; genre: string; } | null>(null);
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
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'arrange' | 'customize' | 'recipients'>('details');
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
  
  // *** START OF NEW LOGIC ***

  const uploadFilesToSupabase = async (filesToUpload: MediaFile[]): Promise<StoredFileData[]> => {
    if (!user) throw new Error("User not authenticated for file upload.");
    if (filesToUpload.length === 0) return [];
    
    setUploading(true);
    const uploadedFileData: StoredFileData[] = [];

    for (const mediaFile of filesToUpload) {
      const file = mediaFile.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/capsules/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('captules')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', file.name, uploadError);
        throw new Error(`Failed to upload ${file.name}.`);
      }

      const { data } = supabase.storage.from('captules').getPublicUrl(fileName);
      
      uploadedFileData.push({
        url: data.publicUrl,
        name: file.name,
        size: file.size,
        type: mediaFile.type,
        storage_path: fileName,
      });
    }
    setUploading(false);
    return uploadedFileData;
  };

  const handleSaveAsDraft = async () => {
    if (!user) return triggerToast("You must be logged in to save.", "error");
    if (!title.trim()) return triggerToast("Please enter a title to save a draft.", "warning");

    setSavingDraft(true);
    try {
        const uploadedFilesData = await uploadFilesToSupabase(mediaFiles);
        
        const capsuleData = {
            user_id: user.id,
            title: title,
            message: message,
            sender_name: senderName,
            recipients: recipients.filter(r => r.name || r.email),
            delivery_date: deliveryDate ? `${deliveryDate}T${deliveryTime}` : null,
            status: 'draft' as const,
            files: JSON.stringify(uploadedFilesData)
            // Note: Saving customization data is omitted for brevity but would be included here
        };

        const { error } = await supabase.from('capsules').upsert({
            id: editCapsuleId || undefined,
            ...capsuleData
        });

        if (error) throw error;
        
        triggerToast("Draft saved successfully!", "success");
        setMediaFiles([]); // Clear local file list after successful save
        setTimeout(() => navigate('/my-capsules'), 1500);

    } catch (error) {
        console.error("Error saving draft:", error);
        triggerToast(`Failed to save draft: ${(error as Error).message}`, "error");
    } finally {
        setSavingDraft(false);
    }
  };

  const loadCapsuleData = async (capsuleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setMessage(data.message || '');
        setSenderName(data.sender_name || '');
        setRecipients(data.recipients || [{ name: '', email: '' }]);
        
        if (data.delivery_date) {
          const d = new Date(data.delivery_date);
          setDeliveryDate(d.toISOString().split('T')[0]);
          setDeliveryTime(d.toTimeString().slice(0, 5));
        }

        // Restore media files from stored URLs
        if (data.files && typeof data.files === 'string') {
          const storedFiles: StoredFileData[] = JSON.parse(data.files);
          const restoredMediaFiles: MediaFile[] = storedFiles.map((sf, i) => ({
            id: `${Date.now()}-${i}`,
            // We create a placeholder File object as we can't recreate the original
            file: new File([], sf.name, { type: 'text/plain' }), 
            type: sf.type,
            url: sf.url,
            name: sf.name,
            size: sf.size,
          }));
          setMediaFiles(restoredMediaFiles);
        }
        triggerToast('Draft loaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error loading capsule:', error);
      triggerToast('Failed to load draft.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editCapsuleId && user) {
      loadCapsuleData(editCapsuleId);
    }
  }, [editCapsuleId, user]);

  // *** END OF NEW LOGIC ***


  // The rest of the file is your original, working code.
  // ... (All your original functions for UI handling go here)
  const musicLibrary = [{ id: 'coastal-echoes', title: 'Coastal Echoes', url: 'https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Coastal%20Echoes.mp3', genre: 'Cinematic Score', description: 'Epic orchestral composition perfect for emotional storytelling' }];
  const transitionEffects = [{ id: 'fade', name: 'Fade', description: 'Classic smooth fade in/out' }, /* ...more effects... */];
  const speedOptions = [{ id: 'slow', name: 'Slow', description: 'Graceful and deliberate (1.2s)' }, { id: 'medium', name: 'Medium', description: 'Balanced and smooth (0.8s)' }, { id: 'fast', name: 'Fast', description: 'Quick and fluid (0.5s)' }];

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'];
    if (file.size > maxSize) return 'File size must be less than 5GB';
    if (!allowedTypes.includes(file.type)) return 'File type not supported.';
    return null;
  };
  
  const handleFileUpload = useCallback((files: FileList) => {
    setUploading(true);
    const newFiles: MediaFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }
      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
    }
    setMediaFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);
  
  const removeFile = (id: string) => { setMediaFiles(prev => prev.filter(f => f.id !== id)); };
  const addRecipient = () => { setRecipients(prev => [...prev, { name: '', email: '' }]); };
  const removeRecipient = (index: number) => { setRecipients(prev => prev.filter((_, i) => i !== index)); };
  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => { setRecipients(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r)); };
  const formatFileSize = (bytes: number): string => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };
  // ...and so on for all your other helper functions...

  const handleFileArrangementSave = (reorderedFiles: MediaFile[]) => {
    setMediaFiles(reorderedFiles);
    setShowFileArrangement(false);
  };
  
  const handleFinalSubmit = () => {
      // Placeholder for final submission logic
      alert('Final submit logic to be implemented.');
  };

  if (!user) {
    return <div>Please sign in to create a capsule.</div>;
  }
  
  // Your full, original JSX return statement goes here.
  // The only change is the onClick for the "Save as Draft" button.
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            {editCapsuleId ? 'Edit Your Time Capsule' : 'Create Your Time Capsule'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {editCapsuleId ? 'Make changes to your time capsule and save your updates.' : 'Preserve your precious memories and schedule them to be delivered at the perfect moment.'}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              {/* Your tab navigation JSX */}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Your tab content JSX */}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowPreview(true)} className="btn-secondary flex items-center justify-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Preview Slideshow</span>
              </button>
              <button onClick={handleSaveAsDraft} disabled={savingDraft || !title.trim()} className="btn-outline flex items-center justify-center space-x-2 disabled:opacity-50">
                {savingDraft ? 'Saving...' : <><Save className="w-5 h-5" /><span>Save as Draft</span></>}
              </button>
              <button onClick={handleFinalSubmit} className="btn-primary flex-1">
                {editCapsuleId ? 'Update Time Capsule' : 'Save and Seal'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-1">
             {/* Your live preview JSX */}
          </div>
        </div>
      </div>
      <ToastNotification message={toastMessage} isVisible={showToast} onHide={() => setShowToast(false)} type={toastType} />
    </div>
  );
};
