import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Landing() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    let uploadedAvatarUrl = '';
    // Upload avatar si présent
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${Date.now()}_${Math.random().toString(36).substr(2,6)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
      if (uploadError) {
        setError('Erreur upload photo: ' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      uploadedAvatarUrl = publicUrlData?.publicUrl || '';
      setAvatarUrl(uploadedAvatarUrl);
    }
    const { data, error } = await supabase.auth.signUp({
      phone,
      password
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Ajoute nom/prénom/pseudo/avatar dans le profil utilisateur (table 'profiles')
    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username,
        avatar_url: uploadedAvatarUrl
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
    router.push('/mon-mur'); // Redirige vers la page "Mon mur"
  }

  // Validation simple : tous champs remplis et téléphone 8 à 15 chiffres
  const phoneValid = /^\d{8,15}$/.test(phone);
  const canSubmit = firstName && lastName && username && phoneValid && password && !loading;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(180deg, #1a2740 0%, #0d1524 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Image src="/landing.jpg" alt="Pitch Live" layout="fill" objectFit="cover" quality={95} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,18,32,0.7) 0%,rgba(10,18,32,0.92) 100%)', zIndex: 2 }} />
      </div>
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 410, margin: '0 auto', padding: '48px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image src="/landing.jpg" alt="Logo Pitch Live" width={180} height={98} style={{ borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }} />
        </div>
        <div style={{ color: '#fff', fontSize: 23, fontWeight: 800, textAlign: 'center', marginBottom: 10, letterSpacing: '-1px', textShadow: '0 2px 8px #000' }}>
          Rejoignez-nous pour vos <span style={{ color: '#45caff' }}>lives de vente</span> <span style={{ color: '#fff' }}>no limite</span> !
        </div>
        <div style={{ color: '#b0c4d8', fontSize: 16, textAlign: 'center', marginBottom: 18, fontWeight: 500 }}>
          Inscrivez-vous pour accéder à la plateforme.
        </div>
        <form onSubmit={handleSignup} style={{ background: 'rgba(20,28,48,0.92)', borderRadius: 22, padding: 24, marginTop: 18, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.13)', border: '1.5px solid #22304a' }}>
          <input
            type="text"
            placeholder="Pseudonyme (unique)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', marginBottom: 13, fontSize: 17, background: '#19233a', color: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          />
          <div style={{ marginBottom: 13 }}>
            <label style={{ color: '#b0c4d8', fontSize: 15, marginBottom: 4, display: 'block' }}>Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setAvatarFile(e.target.files[0])}
              style={{ color: '#fff', background: '#19233a', borderRadius: 14, padding: 8, border: 'none', width: '100%' }}
              disabled={loading}
            />
          </div>
          <input
            type="text"
            placeholder="Prénom"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', marginBottom: 13, fontSize: 17, background: '#19233a', color: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          />
          <input
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', marginBottom: 13, fontSize: 17, background: '#19233a', color: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            required
            style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', marginBottom: 13, fontSize: 17, background: '#19233a', color: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', marginBottom: 18, fontSize: 17, background: '#19233a', color: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: 18,
              borderRadius: 32,
              background: canSubmit ? 'linear-gradient(90deg, #45caff 0%, #1b6bff 100%)' : 'linear-gradient(90deg, #b0b8c6 0%, #6a7a8c 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 21,
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              marginTop: 8,
              opacity: canSubmit ? 1 : 0.6,
              transition: 'opacity 0.2s',
              position: 'relative',
              boxShadow: canSubmit ? '0 4px 24px 0 rgba(69,202,255,0.13)' : 'none',
              letterSpacing: 1,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="loader" style={{
                  width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #45caff', borderRadius: '50%', display: 'inline-block', marginRight: 10, animation: 'spin 1s linear infinite', verticalAlign: 'middle'
                }} />
                Création...
              </span>
            ) : "S'inscrire"}
          </button>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @media (max-width: 600px) {
              div[style*='max-width: 410px'] { max-width: 98vw !important; padding: 24px 0 !important; }
              form { padding: 14px !important; }
              input, button { font-size: 16px !important; }
            }
          `}</style>
          {error && <div style={{ color: '#ff1b6b', marginTop: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
