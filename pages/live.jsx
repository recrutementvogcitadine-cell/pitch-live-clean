

import LiveCamera from '../components/LiveCamera';
import { useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';

  const [title, setTitle] = useState("");
  const [flyingHearts, setFlyingHearts] = useState([]);
  const containerRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [agoraToken, setAgoraToken] = useState(null);
  const [channel, setChannel] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  // Chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  // Récupère les messages du chat en temps réel (si channel actif)
  useEffect(() => {
    if (!channel) return;
    let subscription = null;
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      // Ecoute en temps réel
      subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `channel=eq.${channel}` }, payload => {
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
  }, [channel]);

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
      channel,
      content: chatInput,
      username
    });
    setChatInput('');
    setSending(false);
  }

  async function startLive() {
    setLoading(true);
    // Génère un channel unique (ex: user + timestamp)
    const generatedChannel = `live-${Math.floor(Math.random()*100000)}`;
    const generatedUid = Math.floor(Math.random()*1000000);
    setChannel(generatedChannel);
    setUid(generatedUid);
    // Enregistre le live dans Supabase
    await supabase.from('lives').insert({
      channel: generatedChannel,
      title,
      creator: 'Anonyme', // à remplacer par l’utilisateur connecté
      created_at: new Date().toISOString(),
      active: true,
      whatsapp: whatsapp || null
    });
    const res = await fetch('/api/agoraToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: generatedChannel, uid: generatedUid })
    });
    const data = await res.json();
    setAgoraToken(data.token);
    setIsLive(true);
    setLoading(false);
  }

  // Tap sur l'écran pour faire apparaître un cœur
  function handleScreenTap(e) {
    // Ignore si tap/clic sur un bouton, input, textarea, select ou champ interactif
    const tag = e.target.tagName;
    if (['BUTTON','INPUT','TEXTAREA','SELECT','LABEL'].includes(tag) || e.target.closest('form')) return;
    const id = Math.random().toString(36).substr(2, 9);
    setFlyingHearts(hearts => [...hearts, { id, x: e.clientX || (e.touches && e.touches[0].clientX) || 180 }]);
    // Optionnel: setHearts(h => h + 1);
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
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#fff',
        pointerEvents: 'none',
      }}
    >
      {/* Couche de détection tap cœur, tout en bas */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}
        onClick={handleScreenTap}
        onTouchStart={handleScreenTap}
      />
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
      {/* Caméra plein écran */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        background: '#000',
        pointerEvents: 'none',
      }}>
        {isLive && agoraToken && channel && uid ? (
          <LiveCamera channel={channel} token={agoraToken} uid={uid} style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
        ) : (
          <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>Preview caméra</div>
        )}
      </div>
      {/* Overlay actions rail à droite */}
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
        zIndex: 10,
        pointerEvents: 'auto',
        paddingBottom: 32
      }}>
        <ActionIcon label="Retourner" icon="🔄" />
        <ActionIcon label="Embellir" icon="✨" />
        <ActionIcon label="Effets" icon="🎭" />
        <ActionIcon label="Paramètres" icon="⚙️" />
        <ActionIcon label="Fan Club" icon="💖" />
        <ActionIcon label="Service+" icon="🛠️" />
        <ActionIcon label="Interagir" icon="🤝" />
        <ActionIcon label="Partager" icon="🔗" />
        <ActionIcon label="Promouvoir" icon="🔥" />
      </div>
      {/* Overlay stats (en haut à gauche) */}
      <div style={{
        position: 'absolute',
        left: 16,
        top: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10,
        pointerEvents: 'auto',
        textShadow: '0 2px 8px #000',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Récompenses LIVE évolutives</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 18 }}>
          <span>❤️ {hearts}</span>
          <span>👁️ {viewers}</span>
        </div>
      </div>
      {/* Overlay titre, WhatsApp et bouton live (en bas, centré) */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 0,
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
        pointerEvents: 'auto',
      }}>
        <input
          type="text"
          placeholder="Ajouter un titre"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '90vw',
            maxWidth: 400,
            padding: '1rem',
            borderRadius: 16,
            border: 'none',
            fontSize: '1.1rem',
            marginBottom: 8,
            background: 'rgba(35,39,47,0.85)',
            color: '#fff',
            outline: 'none',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)'
          }}
          disabled={isLive}
        />
        <input
          type="tel"
          placeholder="Numéro WhatsApp (optionnel)"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          style={{
            width: '90vw',
            maxWidth: 400,
            padding: '1rem',
            borderRadius: 16,
            border: 'none',
            fontSize: '1.1rem',
            marginBottom: 8,
            background: 'rgba(35,39,47,0.85)',
            color: '#fff',
            outline: 'none',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)'
          }}
          disabled={isLive}
        />
        <button
          style={{
            background: 'linear-gradient(90deg, #ff1b6b 0%, #45caff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '32px',
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 4px 24px 0 rgba(69,202,255,0.15)',
            transition: 'transform 0.15s',
            opacity: loading ? 0.6 : 1
          }}
          onClick={startLive}
          disabled={loading || isLive}
        >
          {loading ? 'Connexion...' : isLive ? 'EN DIRECT' : 'Passer en LIVE'}
        </button>
      </div>

      {/* Overlay chat (style TikTok/Instagram) */}
      {isLive && channel && (
        <div style={{
          position: 'absolute',
          left: 0,
          bottom: 80,
          width: 320,
          maxHeight: 320,
          zIndex: 20,
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
      )}
    </div>
  );
}

function ActionIcon({ icon, label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      opacity: 0.9,
      transition: 'opacity 0.2s',
    }} title={label}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 10, marginTop: 2 }}>{label}</span>
    </div>
  );
}
