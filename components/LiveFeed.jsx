export default function LiveFeed({ lives }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {lives && lives.length > 0 ? (
        lives.map(live => (
          <div key={live.id} style={{ background: '#23272f', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{live.title}</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>👤 {live.creator} · 👁️ {live.viewers}</div>
          </div>
        ))
      ) : (
        <div>Aucun live en cours</div>
      )}
    </div>
  );
}"use client";
// LiveFeed.jsx
// Composant pour afficher la liste des lives actifs
import React, { useEffect, useState } from 'react';

const LiveFeed = () => {
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/getActiveLives')
      .then(res => res.json())
      .then(data => {
        setLives(data.lives || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement des lives...</div>;
  if (!lives.length) return <div>Aucun live actif.</div>;

  return (
    <div style={{width:'100%',padding:'16px'}}>
      <h3>Lives actifs</h3>
      <ul style={{listStyle:'none',padding:0}}>
        {lives.map(live => (
          <li key={live.id} style={{marginBottom:'18px',background:'#181818',color:'#fff',borderRadius:'10px',padding:'12px'}}>
            <div><b>{live.title || 'Live sans titre'}</b></div>
            <div>Créateur : {live.creator}</div>
            <div>Démarré à : {live.started_at ? new Date(live.started_at).toLocaleString() : 'N/A'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveFeed;
