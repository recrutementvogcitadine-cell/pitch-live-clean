// page.jsx
// Interface créateur LIVE type TikTok
import React, { useState } from 'react';

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: '#000',
  overflow: 'hidden',
};

const topBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  color: '#fff',
  fontSize: '16px',
  background: 'rgba(0,0,0,0.5)',
};

const actionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '18px',
  margin: '40px 0 0 0',
  justifyContent: 'center',
  color: '#fff',
};

const bottomBarStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100vw',
  background: '#181818',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '12px 0',
  borderTop: '1px solid #222',
};

const liveButtonStyle = {
  background: '#ff3366',
  color: '#fff',
  border: 'none',
  borderRadius: '24px',
  fontWeight: 'bold',
  fontSize: '18px',
  padding: '14px 32px',
  margin: '24px 0',
};

const infoStyle = {
  position: 'absolute',
  top: '60px',
  left: '16px',
  color: '#fff',
  background: 'rgba(0,0,0,0.5)',
  borderRadius: '12px',
  padding: '10px 16px',
  zIndex: 5,
  fontSize: '16px',
};

const counterStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '8px',
  color: '#fff',
  fontSize: '16px',
};

export default function LiveCreatorPage() {
  const [hearts, setHearts] = useState(0);
  const [viewers, setViewers] = useState(0);

  return (
    <div style={overlayStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <span>21:41 🔇</span>
        <span>Récompenses LIVE évolutives</span>
        <span>⚙️</span>
      </div>
      {/* Compteurs */}
      <div style={counterStyle}>
        <span>❤️ {hearts}</span>
        <span>👁️ {viewers}</span>
      </div>
      {/* Actions principales */}
      <div style={actionGridStyle}>
        <button>🔄<br/>Retourner</button>
        <button>✨<br/>Embellir</button>
        <button>🎭<br/>Effets</button>
        <button>⚙️<br/>Paramètres</button>
        <button>💖<br/>Fan Club</button>
        <button>🛠️<br/>Service+</button>
        <button>🤝<br/>Interagir</button>
        <button>🔗<br/>Partager</button>
        <button>🔥<br/>Promouvoir</button>
      </div>
      {/* Ajouter un titre */}
      <div style={infoStyle}>
        <input type="text" placeholder="Ajouter un titre" style={{width:'220px',padding:'8px',borderRadius:'8px',border:'none',fontSize:'15px'}} />
      </div>
      {/* Bouton LIVE */}
      <div style={{display:'flex',justifyContent:'center',marginTop:'180px'}}>
        <button style={liveButtonStyle}>Passer en LIVE</button>
      </div>
      {/* Options vocal/caméra/jeu */}
      <div style={{position:'absolute',bottom:'80px',left:'16px',color:'#fff',fontSize:'15px',display:'flex',gap:'18px'}}>
        <span>🗣️ Chat vocal</span>
        <span>📷 Caméra de l'appareil</span>
        <span>🎮 Jeu mobile</span>
      </div>
      {/* Barre navigation inférieure */}
      <nav style={bottomBarStyle}>
        <button>LIVE</button>
        <button>PUBLIER</button>
        <button>CRÉER</button>
      </nav>
    </div>
  );
}
