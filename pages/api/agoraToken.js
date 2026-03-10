// Génère un token d’accès Agora pour un canal donné
// Nécessite d’installer agora-access-token : npm install agora-access-token

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { channel, uid } = req.body;
  if (!channel || !uid) return res.status(400).json({ error: 'channel and uid required' });

  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE; // à mettre dans .env.local (jamais côté client)
  if (!appID || !appCertificate) return res.status(500).json({ error: 'Agora credentials missing' });

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1h
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channel,
    uid,
    role,
    privilegeExpireTime
  );

  res.status(200).json({ token });
}
