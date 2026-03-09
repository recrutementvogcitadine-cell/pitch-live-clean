# PITCH LIVE

Plateforme live vidéo ultra légère, scalable, inspirée de TikTok Live.

## Stack
- Next.js (frontend)
- Agora SDK (streaming vidéo)
- Supabase (backend, base de données)
- Vercel (hébergement)

## Structure
- `/app` : pages principales (home, live, watch, profile)
- `/components` : composants UI (LiveCamera, LivePlayer, LiveFeed, ReactionBar)
- `/lib` : clients externes (agora, supabase)
- `/api` : endpoints API (createLive, joinLive, endLive, getActiveLives)

## Fonctionnalités V1
- Démarrer un live
- Regarder un live
- Liste des lives actifs
- Inscription simple
- Vidéos éphémères 24h

## À compléter
- Intégration Agora SDK
- Logique Supabase
- UI minimaliste
