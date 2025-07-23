import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { FileUp, Save, Send, Eye } from 'lucide-react';

// Define the shape of a file object
interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
}

export const CreateCapsule: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [capsuleId, setCapsuleId] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const uploadMediaFiles = async (filesToUpload: File[]): Promise<UploadedFile[]> => {
    if (!user) {
      throw new Error("User not authenticated for file upload.");
    }
    const uploadedFiles: UploadedFile[] = [];

    for (const file of filesToUpload) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/capsules/${fileName}`;
      
      console.log(`Uploading file: ${filePath} Size: ${file.size}`);

      const { error: uploadError } = await supabase.storage
        .from('media') // Ensure you have a 'media' bucket in Supabase Storage
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', file.name, uploadError);
        throw new Error(`Failed to upload ${file.name}.`);
      }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      
      uploadedFiles.push({
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        storage_path: filePath,
      });
    }
    return uploadedFiles;
  };

  const handleSaveDraft = async () => {
    if (!user) {
      triggerToast("You must be logged in to save a draft.", "error");
      return;
    }
    setIsSaving(true);
    try {
      let uploadedFilesData: UploadedFile[] = [];
      if (mediaFiles.length > 0) {
        uploadedFilesData = await uploadMediaFiles(mediaFiles);
        setMediaFiles([]); // Clear file input after successful upload
      }

      const capsuleData = {
        id: capsuleId, // Use existing ID if we are editing a draft
        user_id: user.id,
        title,
        from_name: fromName,
        message,
        delivery_date: deliveryDate || null,
        status: 'draft',
        files: JSON.stringify(uploadedFilesData), // Store files as a JSON string
      };

      const { data, error } = await supabase.from('capsules').upsert(capsuleData).select().single();
      
      if (error) throw error;
      
      if (data) {
        setCapsuleId(data.id); // Store the ID of the saved capsule
      }

      triggerToast("Draft saved successfully!", "success");

    } catch (error) {
      console.error("Error saving draft:", error);
      triggerToast(`Failed to save draft: ${(error as Error).message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSeal = async () => {
    // This function would be similar to handleSaveDraft but sets status to 'sealed'
    // For now, let's focus on getting the draft working.
    alert("Save and Seal functionality to be implemented.");
  };

  // Render logic of the page
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Create Your Time Capsule</h1>
      
      {/* Your form JSX goes here */}
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 mb-2 w-full" />
      <input type="text" placeholder="From (Sender Name)" value={fromName} onChange={(e) => setFromName(e.target.value)} className="border p-2 mb-2 w-full" />
      <textarea placeholder="Personal Message" value={message} onChange={(e) => setMessage(e.target.value)} className="border p-2 mb-2 w-full" />
      <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="border p-2 mb-2 w-full" />

      <div className="mt-4">
        <label htmlFor="media-upload" className="cursor-pointer bg-blue-500 text-white p-2 rounded inline-flex items-center">
          <FileUp className="w-4 h-4 mr-2" />
          Upload Media
        </label>
        <input id="media-upload" type="file" multiple className="hidden" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} />
      </div>

      <div className="mt-4">
        {mediaFiles.map((file, index) => (
          <div key={index}>{file.name}</div>
        ))}
      </div>
      
      <div className="mt-8 flex space-x-4">
        <button disabled={isSaving} className="p-2 border">
          <Eye className="w-4 h-4 mr-2" /> Preview Slideshow
        </button>
        <button onClick={handleSaveDraft} disabled={isSaving} className="p-2 border">
          <Save className="w-4 h-4 mr-2" /> 
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button onClick={handleSaveAndSeal} disabled={isSaving} className="p-2 bg-amber-500 text-white">
          <Send className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save and Seal'}
        </button>
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
