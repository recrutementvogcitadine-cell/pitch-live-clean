// createLive.js
// Endpoint pour démarrer un live
import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { creator, title } = req.body;
  const { data, error } = await supabase
    .from('lives')
    .insert([{ creator, title, started_at: new Date(), active: true }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ live: data[0] });
}
