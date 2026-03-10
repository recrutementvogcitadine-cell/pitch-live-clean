import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PublishVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canPublish, setCanPublish] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [expireCountdown, setExpireCountdown] = useState(null);

  useEffect(() => {
    async function checkActiveVideo() {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Vous devez être connecté.');
        setLoading(false);
        return;
      }
      const since = new Date(Date.now() - 24*60*60*1000).toISOString();
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .gt('created_at', since)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        setCanPublish(false);
        // Calcule le temps restant avant expiration
        const expiresAt = new Date(new Date(data[0].created_at).getTime() + 24*60*60*1000);
        const updateCountdown = () => {
          const now = new Date();
          const diff = expiresAt - now;
          if (diff > 0) {
            const min = Math.floor(diff/1000/60);
            const sec = Math.floor((diff/1000)%60);
            setExpireCountdown(`${min}m ${sec < 10 ? '0'+sec : sec}s`);
          } else {
            setExpireCountdown('Expirée');
          }
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        setTimeLeft(Math.ceil((expiresAt - new Date())/1000/60/60));
        return () => clearInterval(interval);
      } else {
        setCanPublish(true);
        setTimeLeft(null);
        setExpireCountdown(null);
      }
      setLoading(false);
    }
    checkActiveVideo();
  }, []);

  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }
    // Vérifie la durée de la vidéo (max 3min)
    const file = videoFile;
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(url);
        if (video.duration > 180) {
          setError('La vidéo doit faire 3 minutes maximum.');
          setLoading(false);
          reject();
        } else {
          resolve();
        }
      };
      video.onerror = () => {
        setError('Impossible de lire la vidéo.');
        setLoading(false);
        reject();
      };
    });
    // Upload vidéo (exemple, à adapter selon votre stockage)
    const fileExt = file.name.split('.').pop();
    const filePath = `videos/${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, file);
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    const publicUrl = supabase.storage.from('videos').getPublicUrl(filePath).data.publicUrl;
    // Enregistre la vidéo en base
    const { error: insertError } = await supabase.from('videos').insert({
      user_id: user.id,
      url: publicUrl,
      title,
      created_at: new Date().toISOString()
    });
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setCanPublish(false);
    setTimeLeft(24);
    setVideoFile(null);
    setTitle('');
    alert('Vidéo publiée !');
  }

  return (
    <div style={{ background: '#18181b', color: '#fff', padding: 32, borderRadius: 16, maxWidth: 400, margin: '40px auto' }}>
      <h2>Publier une vidéo</h2>
      {!canPublish && timeLeft !== null && (
        <div style={{ color: '#ff1b6b', marginBottom: 16 }}>
          Vous avez déjà une vidéo active.<br />
          Temps avant expiration : {expireCountdown || `${timeLeft}h`}.
        </div>
      )}
      <form onSubmit={handlePublish}>
        <input
          type="file"
          accept="video/*"
          disabled={!canPublish || loading}
          onChange={e => setVideoFile(e.target.files[0])}
          style={{ marginBottom: 12 }}
        />
        <input
          type="text"
          placeholder="Titre de la vidéo"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={!canPublish || loading}
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 8, border: 'none' }}
        />
        <button type="submit" disabled={!canPublish || loading || !videoFile || !title} style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(90deg, #ff1b6b 0%, #45caff 100%)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Publication...' : 'Publier'}
        </button>
        {error && <div style={{ color: '#ff1b6b', marginTop: 16 }}>{error}</div>}
      </form>
    </div>
  );
}
