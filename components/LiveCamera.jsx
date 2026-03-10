import { useRef, useEffect, useState } from "react";
import { createAgoraClient, joinChannel } from '../lib/agoraClient';

// Props attendues : channel (string), token (string|null), uid (string|number|null), style
export default function LiveCamera({ channel = 'test-live', token = null, uid = null, style }) {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = avant, 'environment' = arrière
  const [localTrack, setLocalTrack] = useState(null);

  useEffect(() => {
    let client = null;
    let mounted = true;

    async function startLive() {
      client = createAgoraClient();
      // Contrainte caméra : facingMode, pas de zoom, pas de miroir
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 },
          frameRate: { ideal: 30 },
          // Zoom désactivé
          zoom: false
        }
      };
      // Crée la track caméra avec contraintes
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const track = await AgoraRTC.createCameraVideoTrack(constraints.video);
      // Beauté : applique un filtre CSS (lissage)
      if (videoRef.current) {
        videoRef.current.innerHTML = '';
        const videoElem = document.createElement('video');
        videoElem.style.width = '100%';
        videoElem.style.height = '100%';
        videoElem.style.objectFit = 'cover';
        videoElem.autoplay = true;
        videoElem.playsInline = true;
        videoElem.muted = true;
        // Pas d’effet miroir
        videoElem.style.transform = 'none';
        // Filtre beauté (lissage)
        videoElem.style.filter = 'blur(1.5px) brightness(1.08) contrast(1.05)';
        videoRef.current.appendChild(videoElem);
        track.play(videoElem);
      }
      await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, channel, token || null, uid || null);
      await client.publish([track]);
      setLocalTrack(track);
    }
    startLive();

    return () => {
      mounted = false;
      if (localTrack) localTrack.close();
      if (client) client.leave();
      // Appelle l’API endLive pour rendre le live éphémère
      if (channel) {
        fetch('/api/endLive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel })
        });
      }
    };
    // eslint-disable-next-line
  }, [channel, token, uid, facingMode]);

  // Bouton switch caméra
  function handleSwitchCamera() {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
      <button
        onClick={handleSwitchCamera}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          zIndex: 10,
          background: 'rgba(24,119,242,0.92)',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 2px 8px 0 rgba(24,119,242,0.18)',
          cursor: 'pointer'
        }}
        title="Changer de caméra"
      >
        🔄
      </button>
    </div>
  );
}
