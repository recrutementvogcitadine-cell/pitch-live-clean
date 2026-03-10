// Endpoint API pour créer un live (à compléter)
export default function handler(req, res) {
  if (req.method === 'POST') {
    // TODO: Créer un live dans Supabase
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}
