export default function LivePlayer({ streamUrl, style }) {
  return (
    <video
      src={streamUrl}
      controls
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}// LivePlayer.jsx
// Composant pour afficher le flux vidéo en direct
import React from 'react';

const LivePlayer = () => {
  return (
    <div>
      {/* Player vidéo */}
      <p>Live Player (placeholder)</p>
    </div>
  );
};

export default LivePlayer;
