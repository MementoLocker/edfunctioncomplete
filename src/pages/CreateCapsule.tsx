import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // ← Fixed import path
import { v4 as uuidv4 } from 'uuid';

const CreateCapsule = () => {
  const [media, setMedia] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMedia(e.target.files[0]);
    }
  };

  const saveDraft = async () => {
    if (!media) {
      setStatus('Please select a media file first.');
      return;
    }

    try {
      setUploading(true);
      setStatus('Uploading...');

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setStatus('User not authenticated.');
        setUploading(false);
        return;
      }

      const fileExt = media.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `drafts/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('capsule-media')
        .upload(filePath, media);

      if (uploadError) {
        throw uploadError;
      }

      setStatus('Draft saved successfully!');
    } catch (error: any) {
      console.error('Upload error:', error.message);
      setStatus(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Create a Capsule</h1>
      <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
      <button onClick={saveDraft} disabled={uploading}>
        {uploading ? 'Saving...' : 'Save as Draft'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default CreateCapsule;
