export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #18181b 0%, #23272f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'Inter, Arial, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{
        fontWeight: 900,
        fontSize: '2.8rem',
        letterSpacing: '-2px',
        marginBottom: '1.5rem',
        background: 'linear-gradient(90deg, #ff1b6b 0%, #45caff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        PITCH LIVE
      </div>
      <div style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2.5rem' }}>
        La plateforme de live vidéo nouvelle génération
      </div>
      <button
        style={{
          background: 'linear-gradient(90deg, #ff1b6b 0%, #45caff 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '32px',
          padding: '1rem 2.5rem',
          fontSize: '1.2rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 24px 0 rgba(69,202,255,0.15)',
          transition: 'transform 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        onClick={() => window.location.href = '/live'}
      >
        Go Live
      </button>
    </div>
  );
}
