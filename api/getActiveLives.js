// getActiveLives.js
// Endpoint pour récupérer la liste des lives actifs
import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('lives')
    .select('*')
    .eq('active', true)
    .order('started_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ lives: data });
}
