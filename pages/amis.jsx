// pages/amis.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AmisPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFriends() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/landing');
        return;
      }
      const { data: friendsData } = await supabase
        .from('follows')
        .select('followed_id, profiles:followed_id(username, avatar_url)')
        .eq('follower_id', user.id);
      setFriends((friendsData || []).map(f => f.profiles));
      setLoading(false);
    }
    fetchFriends();
  }, []);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 80 }}>Chargement...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#1a2740 0%,#0d1524 100%)', color: '#fff', padding: '32px 0' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(20,28,48,0.92)', borderRadius: 22, padding: 24, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.13)', border: '1.5px solid #22304a' }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Mes amis</h2>
        {friends.length === 0 ? (
          <div style={{ color: '#b0c4d8', fontSize: 16 }}>Aucun ami pour l’instant</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {friends.map(f => (
              <div key={f.username} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#22304a', borderRadius: 12, padding: '8px 14px' }}>
                {f.avatar_url ? <img src={f.avatar_url} alt={f.username} style={{ width: 36, height: 36, borderRadius: '50%' }} /> : <span style={{ fontSize: 24 }}>👤</span>}
                <span style={{ color: '#fff', fontSize: 17 }}>{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
