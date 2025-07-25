import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const CreateCapsule = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const user = supabase.auth.getUser();

  useEffect(() => {
    // If editing an existing draft (e.g., from route or props), fetch it
    const loadDraft = async () => {
      const draftIdFromUrl = new URLSearchParams(window.location.search).get('draftId');
      if (draftIdFromUrl) {
        setDraftId(draftIdFromUrl);
        const { data, error } = await supabase
          .from('capsules')
          .select('*')
          .eq('id', draftIdFromUrl)
          .single();

        if (error) {
          console.error('Failed to load draft:', error.message);
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setMediaUrls(data.media_urls || []);
      }
    };

    loadDraft();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      let uploadedUrls: string[] = [];

      if (mediaFiles.length > 0) {
        const uploads = await Promise.all(
          mediaFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const filePath = `${uuidv4()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, file);

            if (uploadError) {
              throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);

            return publicUrl;
          })
        );

        uploadedUrls = uploads;
      }

      const payload = {
        title,
        description,
        media_urls: uploadedUrls,
        is_draft: true,
        updated_at: new Date().toISOString()
      };

      if (draftId) {
        const { error } = await supabase
          .from('capsules')
          .update(payload)
          .eq('id', draftId);

        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from('capsules')
          .insert([{ ...payload }])
          .select()
          .single();

        if (error) throw new Error(error.message);
        setDraftId(data.id);
      }

      setMediaFiles([]);
      alert('Draft saved!');
    } catch (err: any) {
      console.error(err.message);
      alert('Failed to save draft.');
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

      <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

      <button onClick={handleSaveDraft} disabled={loading}>
        {loading ? 'Saving...' : 'Save as Draft'}
      </button>

      {mediaUrls.length > 0 && (
        <div className="media-preview">
          <h4>Uploaded Media:</h4>
          {mediaUrls.map((url, idx) =>
            url.match(/\.(jpeg|jpg|gif|png)$/) ? (
              <img key={idx} src={url} alt={`media-${idx}`} width="200" />
            ) : (
              <video key={idx} src={url} controls width="200" />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CreateCapsule;
