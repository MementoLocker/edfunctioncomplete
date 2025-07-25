import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CreateCapsule = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate a unique file ID (no external dependency)
  const generateId = () =>
    Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);

  // Load draft if editing
  useEffect(() => {
    const loadDraft = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('draftId');
      if (!id) return;

      setDraftId(id);
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch draft:', error.message);
        return;
      }

      setTitle(data.title || '');
      setDescription(data.description || '');
      setMediaUrls(data.media_urls || []);
    };

    loadDraft();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const uploadMediaFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of mediaFiles) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${generateId()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        continue;
      }

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleSaveDraft = async () => {
    setLoading(true);

    try {
      let allMediaUrls = [...mediaUrls];

      if (mediaFiles.length > 0) {
        const newUrls = await uploadMediaFiles();
        allMediaUrls = [...allMediaUrls, ...newUrls];
        setMediaUrls(allMediaUrls);
      }

      const payload = {
        title,
        description,
        media_urls: allMediaUrls,
        is_draft: true,
        updated_at: new Date().toISOString(),
      };

      if (draftId) {
        const { error } = await supabase
          .from('capsules')
          .update(payload)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('capsules')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setDraftId(data.id);
      }

      setMediaFiles([]);
      alert('Draft saved successfully!');
    } catch (err: any) {
      console.error('Error saving draft:', err.message);
      alert('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-capsule-container">
      <h2>Create Capsule</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
      />

      <button onClick={handleSaveDraft} disabled={loading}>
        {loading ? 'Saving...' : 'Save as Draft'}
      </button>

      {mediaUrls.length > 0 && (
        <div className="media-preview">
          <h4>Attached Media:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {mediaUrls.map((url, index) =>
              url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img key={index} src={url} alt={`media-${index}`} width="200" />
              ) : (
                <video key={index} src={url} controls width="200" />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCapsule;
