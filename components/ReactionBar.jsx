export default function ReactionBar({ onReact }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button onClick={() => onReact('heart')} style={{ fontSize: 22 }}>❤️</button>
      <button onClick={() => onReact('like')} style={{ fontSize: 22 }}>👍</button>
      <button onClick={() => onReact('fire')} style={{ fontSize: 22 }}>🔥</button>
    </div>
  );
}// ReactionBar.jsx
// Composant pour afficher et envoyer des réactions en temps réel
import React from 'react';

const ReactionBar = () => {
  return (
    <div>
      {/* Réactions */}
      <p>Reaction Bar (placeholder)</p>
    </div>
  );
};

export default ReactionBar;
