---
title: NofufAudio
emoji: 🎵
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# NofufAudio PWA

Reproductor de audio con búsqueda y streaming desde YouTube (yt-dlp) e import de playlists de Spotify.

## Cómo desplegar en Hugging Face Spaces

1. Crea una cuenta gratis en https://huggingface.co
2. New Space → **SDK: Docker** → Hardware: **CPU basic (Free)** → Visibility: Public
3. Sube TODOS los archivos del zip original **+** este `Dockerfile`, este `README.md` y el `.dockerignore`.
   - Borra `yt-dlp.exe` antes de subir (el Dockerfile ya instala la versión Linux).
4. Espera al build (~3-5 min). Cuando ponga *Running*, abre la URL del Space en Chrome Android → menú → **Instalar app**.

## Notas

- Puerto: **7860** (obligatorio en HF Spaces).
- `server.js` ya respeta `process.env.PORT`, no necesita cambios.
- Los configs se guardan en `/home/user/.config/nofufaudioConfigs` (ephemeral: se borran al reiniciar el Space).
- Para persistencia real necesitarías HF *Persistent Storage* (de pago) o mover los configs a `localStorage` del navegador.

# http://localhost:3000/
# abrir tailscale y npm run dev