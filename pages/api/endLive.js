import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { channel } = req.body;
    if (!channel) return res.status(400).json({ error: 'Channel requis' });
    // Désactive le live (éphémère)
    const { error } = await supabase.from('lives').update({ active: false, viewers: 0 }).eq('channel', channel);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}
