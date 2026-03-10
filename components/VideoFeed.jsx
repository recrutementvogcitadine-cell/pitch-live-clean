import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// Composant principal du fil vidéo vertical
export default function VideoFeed() {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchVideos() {
      // Récupère les vidéos actives (moins de 24h)
      const since = new Date(Date.now() - 24*60*60*1000).toISOString();
      const { data } = await supabase
        .from('videos')
        .select('*')
        .gt('created_at', since)
        .order('created_at', { ascending: false });
      setVideos(data || []);
    }
    fetchVideos();
  }, []);

  // Gestion du scroll/défilement vertical
  function handleScroll(e) {
    const { scrollTop, clientHeight } = e.target;
    const idx = Math.round(scrollTop / clientHeight);
    setCurrent(idx);
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: '100vh',
        width: '100vw',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        background: '#000',
      }}
    >
      {videos.map((video, idx) => (
        <div
          key={video.id}
          style={{
            height: '100vh',
            width: '100vw',
            scrollSnapAlign: 'start',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
          }}
        >
          {/* Remplacer par un vrai player vidéo */}
          <video
            src={video.url}
            controls
            autoPlay={current === idx}
            loop
            style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
          />
          {/* Overlay infos auteur, titre, etc. */}
          <div style={{ position: 'absolute', bottom: 32, left: 24, color: '#fff', textShadow: '0 2px 8px #000' }}>
            <div style={{ fontWeight: 700 }}>{video.title}</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{video.author_name}</div>
          </div>
        </div>
      ))}
      {videos.length === 0 && (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: 120, fontSize: 22 }}>Aucune vidéo active</div>
      )}
    </div>
  );
}
