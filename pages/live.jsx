
import { useRef, useEffect, useState } from "react";

export default function Live() {
  const videoRef = useRef(null);
  const [title, setTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    if (videoRef.current && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          videoRef.current.srcObject = stream;
        });
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #18181b 0%, #23272f 100%)',
      color: '#fff',
      fontFamily: 'Inter, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    }}>
      {/* Camera preview */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        aspectRatio: '9/16',
        background: '#222',
        borderRadius: 24,
        overflow: 'hidden',
        marginTop: 32,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
        position: 'relative',
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Overlay actions rail */}
        <div style={{
          position: 'absolute',
          right: 12,
          top: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
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
        {/* Overlay stats */}
        <div style={{
          position: 'absolute',
          left: 16,
          top: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Récompenses LIVE évolutives</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 18 }}>
            <span>❤️ {hearts}</span>
            <span>👁️ {viewers}</span>
          </div>
        </div>
      </div>
      {/* Titre et bouton live */}
      <div style={{
        marginTop: 32,
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        <input
          type="text"
          placeholder="Ajouter un titre"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 16,
            border: 'none',
            fontSize: '1.1rem',
            marginBottom: 8,
            background: '#23272f',
            color: '#fff',
            outline: 'none',
          }}
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
            cursor: 'pointer',
            boxShadow: '0 4px 24px 0 rgba(69,202,255,0.15)',
            transition: 'transform 0.15s',
          }}
          onClick={() => setIsLive(true)}
        >
          Passer en LIVE
        </button>
      </div>
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
