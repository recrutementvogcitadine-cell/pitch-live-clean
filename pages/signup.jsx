import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Signup() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({
      phone,
      password
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Ajoute nom/prénom dans le profil utilisateur (table 'profiles')
    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName
      });
    }
    // Connexion automatique
    const { error: loginError } = await supabase.auth.signInWithPassword({
      phone,
      password
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push('/'); // Redirige vers le fil vidéo
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <form onSubmit={handleSignup} style={{ background: '#23272f', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)', width: 320 }}>
        <h2 style={{ color: '#fff', marginBottom: 24 }}>Inscription</h2>
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', marginBottom: 12, fontSize: 16 }}
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', marginBottom: 12, fontSize: 16 }}
        />
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', marginBottom: 12, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', marginBottom: 24, fontSize: 16 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 8, background: 'linear-gradient(90deg, #ff1b6b 0%, #45caff 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Création...' : "S'inscrire"}
        </button>
        {error && <div style={{ color: '#ff1b6b', marginTop: 16 }}>{error}</div>}
      </form>
    </div>
  );
}
