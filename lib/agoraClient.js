// agoraClient.js
// Initialisation du client Agora SDK NG
import AgoraRTC from 'agora-rtc-sdk-ng';

// Remplace par ta vraie App ID Agora
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

export function createAgoraClient() {
  return AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
}

export async function joinChannel(client, channel, token, uid, isHost = false) {
  await client.join(AGORA_APP_ID, channel, token || null, uid || null);
  if (isHost) {
    const localTrack = await AgoraRTC.createCameraVideoTrack();
    await client.publish([localTrack]);
    return localTrack;
  }
  return null;
}
