import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { channel } = req.body;
    if (!channel) return res.status(400).json({ error: 'Channel requis' });
    // Incrémente le compteur viewers
    const { data, error } = await supabase.rpc('increment_viewers', { channel_name: channel });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ success: true, viewers: data });
  } else {
    res.status(405).end();
  }
}
