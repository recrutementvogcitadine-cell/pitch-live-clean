// joinLive.js
// Endpoint pour rejoindre un live
import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { liveId, viewer } = req.body;
  // Optionnel: enregistrer le spectateur
  res.status(200).json({ joined: true });
}
