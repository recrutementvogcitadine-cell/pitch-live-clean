// endLive.js
// Endpoint pour terminer un live
import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { liveId } = req.body;
  const { error } = await supabase
    .from('lives')
    .update({ active: false, ended_at: new Date() })
    .eq('id', liveId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ended: true });
}
