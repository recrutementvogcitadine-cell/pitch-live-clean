
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import ReactionBar from '../../components/ReactionBar';
import { supabase } from '../../lib/supabaseClient';
import { createAgoraClient, joinChannel } from '../../lib/agoraClient';

export default function WatchLivePage() {
  const router = useRouter();
  const { id } = router.query;
  const [reactions, setReactions] = useState([]);
  const [flyingHearts, setFlyingHearts] = useState([]);
  const containerRef = useRef(null);
  const [agoraToken, setAgoraToken] = useState(null);
  const [uid, setUid] = useState(null);
  const [client, setClient] = useState(null);
  const [remoteTrack, setRemoteTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [whatsapp, setWhatsapp] = useState(null);
  // Chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  // Récupère les messages du chat en temps réel
  useEffect(() => {
    if (!id) return;
    let subscription = null;
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      // Ecoute en temps réel
      subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `channel=eq.${id}` }, payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(msgs => [...msgs, payload.new]);
          }
        })
        .subscribe();
    }
    fetchMessages();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [id]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSending(true);
    // Récupère le pseudo de l'utilisateur connecté
    let username = 'Anonyme';
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (profile && profile.username) username = profile.username;
    }
    await supabase.from('messages').insert({
      channel: id,
      content: chatInput,
      username
    });
    setChatInput('');
    setSending(false);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const generatedUid = Math.floor(Math.random()*1000000);
    setUid(generatedUid);
    fetch('/api/agoraToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: id, uid: generatedUid })
    })
      .then(res => res.json())
      .then(data => {
        setAgoraToken(data.token);
        setLoading(false);
      });
    // Incrémente viewers à l’arrivée
    fetch('/api/joinLive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: id })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.viewers !== undefined) setViewers(data.viewers);
      });
    // Rafraîchit le nombre de viewers et récupère le numéro WhatsApp toutes les 5s
    const fetchLiveInfo = () => {
      fetch(`/api/getActiveLives?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.lives && data.lives[0]) {
            setViewers(data.lives[0].viewers || 0);
            setWhatsapp(data.lives[0].whatsapp || null);
          }
        });
    };
    fetchLiveInfo();
    const interval = setInterval(fetchLiveInfo, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!agoraToken || !id || !uid) return;
    let clientInstance = createAgoraClient();
    setClient(clientInstance);
    let mounted = true;
    async function join() {
      await clientInstance.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, id, agoraToken, uid);
      clientInstance.on('user-published', async (user, mediaType) => {
        await clientInstance.subscribe(user, mediaType);
        if (mediaType === 'video' && mounted) {
          setRemoteTrack(user.videoTrack);
          user.videoTrack.play('agora-remote-video');
        }
      });
    }
    join();
    return () => {
      mounted = false;
      if (clientInstance) clientInstance.leave();
    };
  }, [agoraToken, id, uid]);

  function handleReact(type) {
    setReactions(r => [...r, type]);
    // TODO: envoyer la réaction au backend
  }

  // Tap sur l'écran pour faire apparaître un cœur
  function handleScreenTap(e) {
    // Ignore si tap sur un bouton ou champ interactif
    if (e.target.tagName === 'BUTTON' || e.target.closest('form')) return;
    const id = Math.random().toString(36).substr(2, 9);
    setFlyingHearts(hearts => [...hearts, { id, x: e.clientX || (e.touches && e.touches[0].clientX) || 180 }]);
    // Optionnel: handleReact('heart');
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        background: '#000',
        overflow: 'hidden',
        zIndex: 0,
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onClick={handleScreenTap}
      onTouchStart={handleScreenTap}
    >
      {/* Cœurs animés */}
      {flyingHearts.map(h => (
        <span
          key={h.id}
          style={{
            position: 'absolute',
            left: h.x - 20,
            bottom: 80,
            fontSize: 32,
            animation: 'flyHeart 1s ease-out',
            pointerEvents: 'none',
            zIndex: 1000
          }}
          onAnimationEnd={() => setFlyingHearts(hearts => hearts.filter(f => f.id !== h.id))}
        >❤️</span>
      ))}
      <style jsx global>{`
        @keyframes flyHeart {
          0% { opacity: 0.8; transform: translateY(0) scale(1); }
          60% { opacity: 1; transform: translateY(-80px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-160px) scale(0.8); }
        }
      `}</style>
      {/* Vidéo plein écran */}
      <div id="agora-remote-video" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        background: '#000',
        pointerEvents: 'none',
      }} />
      {/* Overlay UI (chat, réactions, rail, etc.) */}
      {/* Barre d’actions à droite */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100vh',
        width: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 3,
        pointerEvents: 'auto',
        paddingBottom: 32
      }}>
        {/* Bouton WhatsApp */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Contacter sur WhatsApp"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#25D366',
              marginBottom: 18,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)',
              textDecoration: 'none',
              border: '3px solid #fff',
              transition: 'transform 0.1s',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M16 6C10.477 6 6 10.477 6 16c0 1.624.43 3.14 1.18 4.46L6 26l5.66-1.16A9.94 9.94 0 0016 26c5.523 0 10-4.477 10-10S21.523 6 16 6zm0 18c-1.47 0-2.85-.4-4.02-1.1l-.29-.17-3.36.69.7-3.27-.18-.3A7.96 7.96 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.13-5.47c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.66-.59-1.1-1.31-1.23-1.53-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38-.13-.01-.28-.01-.43-.01-.15 0-.39.05-.6.22-.21.17-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.62 2.47 3.93 3.37.55.24.98.38 1.32.49.56.18 1.07.15 1.47.09.45-.07 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26z" fill="#fff"/></svg>
          </a>
        )}
      </div>
      {/* Overlay reactions (en bas, centré) */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 4,
        pointerEvents: 'auto',
      }}>
        <ReactionBar onReact={handleReact} />
      </div>
      {/* Overlay chat (style TikTok/Instagram) */}
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 80,
        width: 320,
        maxHeight: 320,
        zIndex: 6,
        background: 'rgba(20,28,48,0.82)',
        borderRadius: 18,
        padding: 10,
        overflowY: 'auto',
        marginLeft: 10,
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)'
      }}>
        <div style={{ fontWeight: 700, color: '#45caff', marginBottom: 6, fontSize: 15 }}>Chat en direct</div>
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 6 }}>
          {messages.length === 0 ? (
            <div style={{ color: '#b0c4d8', fontSize: 14 }}>Aucun message</div>
          ) : messages.map((msg, idx) => (
            <div key={msg.id || idx} style={{ marginBottom: 4 }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{msg.username || 'Anonyme'} : </span>
              <span style={{ color: '#fff', fontSize: 14 }}>{msg.content}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#fff', borderRadius: 22, padding: '4px 8px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Votre message..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, background: 'transparent', color: '#222', padding: '10px 8px', borderRadius: 18 }}
            disabled={sending}
            maxLength={120}
          />
          <button type="submit" disabled={sending || !chatInput.trim()} style={{
            background: '#1877f2',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
            fontSize: 20,
            boxShadow: '0 2px 8px 0 rgba(24,119,242,0.15)',
            cursor: sending ? 'wait' : 'pointer',
            transition: 'background 0.2s'
          }} aria-label="Envoyer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 20v-6l13-2-13-2V4l18 8-18 8z" fill="#fff"/></svg>
          </button>
        </form>
      </div>
      {/* Infos live (en haut) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        padding: '18px 20px 0 20px',
        color: '#fff',
        fontWeight: 700,
        fontSize: 18,
        zIndex: 5,
        textShadow: '0 2px 8px #000',
        pointerEvents: 'none',
      }}>
        Live : {id} · 👁️ {viewers}
      </div>
      {/* Loader */}
      {loading && <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:10,color:'#fff',fontSize:22}}>Connexion au live...</div>}
    </div>
  );
}
