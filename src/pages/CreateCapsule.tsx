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

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

// This is the shape of the data that gets saved to the database
interface UploadedFileData {
    url: string;
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
  
  // UI state
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'arrange' | 'customize' | 'recipients'>('details');
  const [loading, setLoading] = useState(false); // General loading state
  const [savingDraft, setSavingDraft] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  
  // Other states from your original code
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // NEW: Function to upload files to Supabase Storage
  const uploadFilesToSupabase = async (filesToUpload: MediaFile[]): Promise<UploadedFileData[]> => {
    if (!user) throw new Error("User not authenticated for file upload.");
    
    const uploadedFileData: UploadedFileData[] = [];

    for (const mediaFile of filesToUpload) {
      const file = mediaFile.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/capsules/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('captules') // Use your 'captules' bucket
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
    return uploadedFileData;
  };
  
  // NEW: Function to handle saving the draft
  const handleSaveAsDraft = async () => {
    if (!user) {
        triggerToast("You must be logged in to save.", "error");
        return;
    }
    if (!title.trim()) {
        triggerToast("Please enter a title to save a draft.", "warning");
        return;
    }

    setSavingDraft(true);
    try {
        // Step 1: Upload any new media files
        const uploadedFilesData = await uploadFilesToSupabase(mediaFiles);
        
        // Step 2: Prepare the data to save in the database
        const capsuleData = {
            user_id: user.id,
            title: title,
            message: message,
            sender_name: senderName,
            recipients: recipients.filter(r => r.name || r.email),
            delivery_date: deliveryDate ? `${deliveryDate}T${deliveryTime}` : null,
            status: 'draft',
            // Store the array of file data as a JSON string
            files: JSON.stringify(uploadedFilesData) 
        };

        // Step 3: Save the data to the 'capsules' table
        const { error } = await supabase.from('capsules').upsert({
            id: editCapsuleId || undefined, // Use existing ID if editing
            ...capsuleData
        });

        if (error) throw error;
        
        triggerToast("Draft saved successfully!", "success");
        setMediaFiles([]); // Clear the local file list after successful save
        setTimeout(() => navigate('/my-capsules'), 1500);

    } catch (error) {
        console.error("Error saving draft:", error);
        triggerToast(`Failed to save draft: ${(error as Error).message}`, "error");
    } finally {
        setSavingDraft(false);
    }
  };


  // Your existing functions (like handleFileUpload, handleDrag, removeFile, etc.)
  // should be here. I have included simplified versions of what's needed.
  
  const handleFileUpload = useCallback((files: FileList) => {
    const newFiles: MediaFile[] = Array.from(files).map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      type: getFileType(file),
      url: URL.createObjectURL(file), // Temporary local URL for preview
      name: file.name,
      size: file.size,
    }));
    setMediaFiles(prev => [...prev, ...newFiles]);
  }, []);

  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // fallback
  };

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
  
  const removeFile = (id: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== id));
  };
  
  // The rest of your component's JSX and other functions...
  // I am including a simplified structure of your original code below.
  // The key change is that the "Save as Draft" button now calls the new `handleSaveAsDraft` function.

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div /* Your header motion.div */ >
           <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
             {editCapsuleId ? 'Edit Your Time Capsule' : 'Create Your Time Capsule'}
           </h1>
           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
             Preserve your precious memories and schedule them to be delivered at the perfect moment.
           </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             {/* Your complex tab navigation and content would go here */}
             <p>Your full UI for creating capsules goes here...</p>
             <p>Current Title: {title}</p>
             
             {/* Example Upload Area */}
             <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className="border-2 border-dashed rounded-lg p-8 text-center">
                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p>Drag and drop files here, or click below.</p>
                 <button onClick={() => fileInputRef.current?.click()} className="btn-primary mt-4">Choose Files</button>
                 <input ref={fileInputRef} type="file" multiple onChange={(e) => e.target.files && handleFileUpload(e.target.files)} className="hidden" />
             </div>
             <div>
                {mediaFiles.map(mf => <div key={mf.id}>{mf.name} <button onClick={() => removeFile(mf.id)}>X</button></div>)}
             </div>
          </div>

          <div className="lg:col-span-1">
             {/* Your live preview section would go here */}
          </div>
        </div>
        
        {/* Action Buttons at the bottom */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
           <button className="btn-secondary">Preview Slideshow</button>
           <button onClick={handleSaveAsDraft} disabled={savingDraft} className="btn-outline">
               {savingDraft ? 'Saving...' : 'Save as Draft'}
           </button>
           <button className="btn-primary flex-1">
               {editCapsuleId ? 'Update & Seal' : 'Save and Seal'}
           </button>
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
