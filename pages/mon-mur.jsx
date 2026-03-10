// pages/mon-mur.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function MonMur() {
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [friends, setFriends] = useState([]); // profils suivis
  const [followersCount, setFollowersCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfileAndVideos() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/landing');
        return;
      }
      // Récupère le profil
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      // Récupère les vidéos 24h
      const since = new Date(Date.now() - 24*60*60*1000).toISOString();
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .gt('created_at', since)
        .order('created_at', { ascending: false });
      setVideos(videosData || []);
      // Amis (profils suivis)
      const { data: friendsData } = await supabase
        .from('follows')
        .select('followed_id, profiles:followed_id(username, avatar_url)')
        .eq('follower_id', user.id);
      setFriends((friendsData || []).map(f => f.profiles));
      // Nombre de followers
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', user.id);
      setFollowersCount(count || 0);
      // Vérifie si l'utilisateur courant suit ce profil (ici, on suit soi-même pour la démo)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && currentUser.id !== user.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('followed_id', user.id)
          .single();
        setIsFollowing(!!followData);
      }
      setLoading(false);
    }
    fetchProfileAndVideos();
  }, []);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 80 }}>Chargement...</div>;
  if (!profile) return null;

  async function handleFollow() {
    setFollowLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || !profile) return;
    await supabase.from('follows').upsert({
      follower_id: currentUser.id,
      followed_id: profile.id
    });
    setIsFollowing(true);
    setFollowLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a2740 0%,#0d1524 100%)', color: '#fff', padding: '32px 0' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(20,28,48,0.92)', borderRadius: 22, padding: 24, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.13)', border: '1.5px solid #22304a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #45caff' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#22304a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#45caff' }}>👤</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{profile.username}</div>
            <div style={{ color: '#b0c4d8', fontSize: 15 }}>{profile.first_name} {profile.last_name}</div>
            <div style={{ color: '#b0c4d8', fontSize: 14, marginTop: 2 }}>Téléphone : {profile.phone || ''}</div>
          </div>
          {/* Bouton Suivre (ne s’affiche pas sur son propre mur) */}
          {/* Pour la démo, on affiche toujours le bouton, mais en prod, il faut comparer l’id */}
          <button
            onClick={handleFollow}
            disabled={isFollowing || followLoading}
            style={{
              background: isFollowing ? 'linear-gradient(90deg,#b0b8c6 0%,#6a7a8c 100%)' : 'linear-gradient(90deg,#45caff 0%,#1b6bff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 18,
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: 16,
              cursor: isFollowing ? 'not-allowed' : 'pointer',
              opacity: isFollowing ? 0.7 : 1,
              marginLeft: 8
            }}
          >
            {isFollowing ? 'Abonné' : followLoading ? '...' : 'Suivre'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '18px 0 10px 0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Mes vidéos 24h</h3>
          <span style={{ color: '#45caff', fontWeight: 700, fontSize: 15 }}>Followers : {followersCount}</span>
        </div>
        {/* Amis (profils suivis) */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ color: '#b0c4d8', fontSize: 15, fontWeight: 600 }}>Amis :</span>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            {friends.length === 0 ? <span style={{ color: '#b0c4d8', fontSize: 14 }}>Aucun</span> : friends.map(f => (
              <div key={f.username} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22304a', borderRadius: 12, padding: '4px 10px' }}>
                {f.avatar_url ? <img src={f.avatar_url} alt={f.username} style={{ width: 24, height: 24, borderRadius: '50%' }} /> : <span style={{ fontSize: 18 }}>👤</span>}
                <span style={{ color: '#fff', fontSize: 14 }}>{f.username}</span>
              </div>
            ))}
          </div>
        </div>
        {videos.length === 0 ? (
          <div style={{ color: '#b0c4d8', fontSize: 16 }}>Aucune vidéo active</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {videos.map(video => (
              <div key={video.id} style={{ background: '#19233a', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <video src={video.url} controls style={{ width: 90, height: 90, borderRadius: 10, objectFit: 'cover', background: '#000' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{video.title}</div>
                  <div style={{ fontSize: 13, color: '#b0c4d8' }}>{new Date(video.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Barre de navigation en bas */}
      <nav style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100vw',
        background: 'rgba(20,28,48,0.98)',
        borderTop: '1.5px solid #22304a',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 68,
        zIndex: 100
      }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
          <span style={{ fontSize: 28 }}>🏠</span>
          Accueil
        </button>
        <button onClick={() => router.push('/amis')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
          <span style={{ fontSize: 28 }}>👥</span>
          Ami(e)s
        </button>
        <button onClick={() => router.push('/live')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
          <span style={{ fontSize: 34, background: 'linear-gradient(90deg,#45caff 0%,#ff1b6b 100%)', borderRadius: 16, padding: '2px 10px', color: '#fff' }}>＋</span>
        </button>
        <button onClick={() => router.push('/mon-mur')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
          <span style={{ fontSize: 28 }}>👤</span>
          Profil
        </button>
      </nav>
    </div>
  );
}
