import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    let query = supabase.from('lives').select('*').eq('active', true);
    if (id) query = query.eq('channel', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ lives: data });
  } else {
    res.status(405).end();
  }
}
