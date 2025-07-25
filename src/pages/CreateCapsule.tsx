// Assuming this is the full implementation request for src/pages/CreateCapsule.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const CreateCapsule = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setMessage('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } = await supabase.from('capsules').insert([
        {
          user_id: user.id,
          title,
          description,
          media_urls: uploadedUrls,
          status: 'draft',
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setMessage('Draft saved successfully.');
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  // Load a saved draft when component mounts (example logic)
  useEffect(() => {
    const loadDraft = async () => {
      const { data, error } = await supabase
        .from('capsules')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        // Note: We only store URLs, so preview display must be handled via <img> or <video> components separately
        setMediaFiles([]); // We can't convert URLs back to File objects
        // Instead, display URLs via another state if needed
      }
    };

    if (user) loadDraft();
  }, [user]);

  return (
    <div className="create-capsule">
      <h1>Create Capsule</h1>
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
      <input type="file" multiple onChange={handleMediaChange} />

      <button onClick={handleSaveDraft} disabled={saving}>
        {saving ? 'Saving...' : 'Save as Draft'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateCapsule;

/**
 * ✅ RLS Policy for Supabase Storage Bucket (media):
 *
 * On the 'media' bucket, add this policy:
 *
 * Policy Name: Allow authenticated users to upload and access their own files
 *
 * ```sql
 * CREATE POLICY "Authenticated users can access their files"
 * ON storage.objects
 * FOR ALL
 * USING (
 *   auth.role() = 'authenticated'
 * );
 * ```
 *
 * Or more restrictively:
 * ```sql
 * CREATE POLICY "Users can access their own uploads"
 * ON storage.objects
 * FOR ALL
 * USING (
 *   bucket_id = 'media' AND auth.uid()::text = split_part(name, '/', 1)
 * );
 * ```
 */
