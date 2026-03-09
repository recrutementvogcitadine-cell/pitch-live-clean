"use client";
import React, { useState } from 'react';


// import LiveCamera from '../components/LiveCamera';
import LiveCamera from '../components/LiveCamera';
import LivePlayer from '../components/LivePlayer';
import ReactionBar from '../components/ReactionBar';
import LiveFeed from '../components/LiveFeed';
const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  background: '#181818',
  color: '#fff',
  padding: '10px 0',
  zIndex: 10,
  borderTop: '1px solid #222',
};

const screenStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100vw',
  height: '100vh',
  background: '#000',
  position: 'relative',
  overflow: 'hidden',
};

const videoContainerStyle = {
  width: '100%',
  maxWidth: '420px',
  height: 'calc(100vh - 60px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  position: 'relative',
};

const actionRailStyle = {
  position: 'absolute',
  right: 10,
  top: '30%',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  zIndex: 5,
};

const creatorInfoStyle = {
  position: 'absolute',
  bottom: 80,
  left: 16,
  color: '#fff',
  background: 'rgba(0,0,0,0.5)',
  borderRadius: '12px',
  padding: '10px 16px',
  zIndex: 5,
  fontSize: '16px',
};

const HomePage = () => {
  // States for the live creation form
  const [creator, setCreator] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  // Handler for live creation
  const handleCreateLive = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");
    try {
      const res = await fetch("/api/createLive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator, title }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg("Live créé !");
        setCreator("");
        setTitle("");
      } else {
        setCreateMsg(data.error || "Erreur lors de la création du live");
      }
    } catch (err) {
      setCreateMsg("Erreur réseau");
    }
    setCreating(false);
  };
  return (
    <div style={screenStyle}>
        {/* Lien test vers /live */}
        <a href="/live" style={{position:'fixed',top:10,right:10,background:'#ff3366',color:'#fff',padding:'8px 16px',borderRadius:'8px',zIndex:1000,textDecoration:'none',fontWeight:'bold'}}>Aller à /live</a>
      {/* Barre supérieure */}
      <div style={{width:'100%',background:'#181818',color:'#fff',padding:'8px 0',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'15px',position:'fixed',top:0,zIndex:10}}>
        <span style={{marginLeft:12,fontWeight:'bold'}}>LIVE</span>
        <div style={{display:'flex',gap:'18px'}}>
          <span>Explorer</span>
          <span>Suivis</span>
          <span style={{color:'#ff3366',fontWeight:'bold'}}>Pour toi</span>
        </div>
        <span style={{marginRight:12}}>🔍</span>
      </div>
      <div style={videoContainerStyle}>
        <LivePlayer />
        {/* Rail d’actions à droite */}
        <div style={actionRailStyle}>
          <button style={{background:'none',border:'none',color:'#fff',fontSize:'28px'}}>❤️</button>
          <span style={{color:'#fff',fontSize:'14px'}}>60K</span>
          <button style={{background:'none',border:'none',color:'#fff',fontSize:'28px'}}>💬</button>
          <span style={{color:'#fff',fontSize:'14px'}}>283</span>
          <button style={{background:'none',border:'none',color:'#fff',fontSize:'28px'}}>🔖</button>
          <span style={{color:'#fff',fontSize:'14px'}}>5885</span>
          {/* Compteur de spectateurs */}
          <div style={{display:'flex',alignItems:'center',marginTop:'10px'}}>
            <span style={{fontSize:'22px',color:'#fff',marginRight:'6px'}}>👁️</span>
            <span style={{color:'#fff',fontSize:'14px'}}>2684</span>
          </div>
        </div>
        {/* Infos créateur */}
        <div style={creatorInfoStyle}>
          <div style={{fontWeight:'bold'}}>Alcutebaby</div>
          <div>Partie 22 | #Alcutebaby</div>
          <div style={{marginTop:'6px',fontSize:'13px'}}>
            <button style={{background:'#fff',color:'#181818',border:'none',borderRadius:'8px',padding:'4px 10px',fontWeight:'bold'}}>Lecture suivante</button>
          </div>
        </div>
        {/* Réactions en temps réel */}
        <ReactionBar />
      </div>
      {/* Formulaire création live */}
      <form onSubmit={handleCreateLive} style={{background:'#181818',padding:'16px',borderRadius:'10px',margin:'18px auto',maxWidth:'420px',color:'#fff'}}>
        <h3>Démarrer un live</h3>
        <input type="text" placeholder="Nom du créateur" value={creator} onChange={e=>setCreator(e.target.value)} required style={{marginBottom:'8px',width:'100%',padding:'8px',borderRadius:'6px',border:'none'}} />
        <input type="text" placeholder="Titre du live" value={title} onChange={e=>setTitle(e.target.value)} required style={{marginBottom:'8px',width:'100%',padding:'8px',borderRadius:'6px',border:'none'}} />
        <button type="submit" disabled={creating} style={{background:'#ff3366',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 18px',fontWeight:'bold'}}>Créer le live</button>
        {createMsg && <div style={{marginTop:'8px'}}>{createMsg}</div>}
      </form>
      {/* Liste des lives actifs */}
      <LiveFeed />
      {/* Barre navigation inférieure */}
      <nav style={navStyle}>
        <button>Accueil</button>
        <button>Amis</button>
        <button style={{background:'#fff',color:'#181818',borderRadius:'50%',width:'40px',height:'40px',fontWeight:'bold'}}>+</button>
        <button>Messages</button>
        <button>Profil</button>
      </nav>
    </div>
  );
};

export default HomePage;
