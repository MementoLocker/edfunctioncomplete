import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';

const CreateCapsule = ({ user }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);

  const removeFile = (index) => {
    const updatedFiles = [...mediaFiles];
    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const saveAsDraft = async () => {
    try {
      setUploading(true);
      const uploadedMedia = [];

      for (const media of mediaFiles) {
        if (media.url?.startsWith('https://')) {
          uploadedMedia.push(media);
          continue;
        }

        const file = media.file;
        const filePath = `drafts/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase
          .storage
          .from('capsule-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        const { data: urlData } = supabase
          .storage
          .from('capsule-media')
          .getPublicUrl(filePath);

        uploadedMedia.push({
          ...media,
          url: urlData.publicUrl,
        });
      }

      const { error: insertError } = await supabase
        .from('capsules')
        .insert({
          user_id: user?.id,
          status: 'draft',
          media: uploadedMedia.map(f => ({
            url: f.url,
            type: f.type,
            name: f.name,
            size: f.size,
          })),
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Failed to save draft: ${insertError.message}`);
      }

      setToastMessage('Draft saved successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage(err.message || 'An error occurred');
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="create-capsule-page">
      <h1>Create Capsule</h1>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaChange}
      />

      <div className="media-preview">
        {mediaFiles.map((media, index) => (
          <div key={index} className="media-thumb">
            {media.type.startsWith('image') ? (
              <img src={media.url} alt={media.name} width={100} />
            ) : (
              <video src={media.url} controls width={100} />
            )}
            <button onClick={() => removeFile(index)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          onClick={saveAsDraft}
          disabled={uploading}
        >
          {uploading ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>

      {showToast && (
        <div className={`toast ${toastType}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CreateCapsule;
