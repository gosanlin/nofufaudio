/* ═══════════════════════════════════════════════
   NOFUFAUDIO — Express Server (PWA)
   Servidor web para la versión PWA de NofufAudio
═══════════════════════════════════════════════ */

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
// Middleware mejorado para parsing de JSON
app.use(express.json({ 
  limit: '50mb',
  strict: false // Permite parseear valores primitivos como strings
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos (public primero para prioridad)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, '.'))); // Para manifest.json e ícono

// Headers de seguridad
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // FIX: Allow storage-access API (fixes "requestStorageAccessFor: Permission denied")
  res.setHeader('Permissions-Policy', 'storage-access=*');
  
  // Para PWA: permitir HTTPS en producci
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Service Worker headers
  if (req.path === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Service-Worker-Allowed', '/');
  }
  
  next();
});

// ──────────────────────────────────
// CONFIG FILE API — Reemplaza IPC de Electron
// ──────────────────────────────────

function getConfigDir() {
  const platform = process.platform;
  let baseDir;
  
  if (platform === 'win32') {
    baseDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  } else if (platform === 'darwin') {
    baseDir = path.join(os.homedir(), 'Library', 'Application Support');
  } else {
    baseDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  }
  
  const dir = path.join(baseDir, 'nofufaudioConfigs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Leer config
app.get('/api/config/read/:name', (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'name required' });
    
    const filePath = path.join(getConfigDir(), path.basename(name)); // Prevent path traversal
    if (!fs.existsSync(filePath)) {
      return res.json({ content: null });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Escribir config
app.post('/api/config/write/:name', (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'name required' });
    
    // Manejar tanto { content: "..." } como solo un string primitivo
    let content = req.body?.content !== undefined ? req.body.content : req.body;
    
    if (content === undefined) {
      return res.status(400).json({ error: 'content required' });
    }
    
    // Convertir a string si es necesario
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    
    const filePath = path.join(getConfigDir(), path.basename(name));
    fs.writeFileSync(filePath, contentStr, 'utf-8');
    res.json({ ok: true, path: filePath });
  } catch (e) {
    console.error('[Config Write Error]', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Obtener directorio de config
app.get('/api/config/dir', (req, res) => {
  res.json({ dir: getConfigDir() });
});

// ──────────────────────────────────
// SYSTEM FONTS API
// ──────────────────────────────────

app.get('/api/system-fonts', (req, res) => {
  const platform = process.platform;
  const fonts = [];
  
  try {
    if (platform === 'win32') {
      // Para Windows, devolver fuentes comunes por defecto
      fonts.push('Arial', 'Calibri', 'Segoe UI', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana');
    } else if (platform === 'darwin') {
      fonts.push('SF Pro Display', 'Helvetica Neue', 'Menlo', 'Monaco', 'Arial', 'Courier New');
    } else {
      // Linux
      fonts.push('DejaVu Sans', 'Liberation Sans', 'Ubuntu', 'Noto Sans', 'Roboto', 'Arial');
    }
    
    // Agregar fuentes de Google por defecto
    fonts.push('DM Sans', 'Roboto', 'Open Sans', 'Lato', 'Montserrat');
    
    const unique = [...new Set(fonts)].sort();
    res.json({ fonts: unique });
  } catch (e) {
    res.json({ fonts: ['DM Sans', 'Arial', 'Courier New'] });
  }
});

// ──────────────────────────────────
// YT-DLP HELPERS
// ──────────────────────────────────

function findYtDlp() {
  const isWin = process.platform === 'win32';
  const searchDirs = [
    process.env.YTDLP_PATH ? path.dirname(process.env.YTDLP_PATH) : null,
    __dirname,
    path.join(__dirname, 'bin'),
  ].filter(Boolean);

  for (const dir of searchDirs) {
    const name = isWin ? 'yt-dlp.exe' : 'yt-dlp';
    const full = path.join(dir, name);
    if (fs.existsSync(full)) {
      if (!isWin) {
        try {
          const stat = fs.statSync(full);
          if ((stat.mode & 0o111) === 0) fs.chmodSync(full, stat.mode | 0o755);
        } catch (e) {}
      }
      return full;
    }
  }
  return isWin ? 'yt-dlp.exe' : 'yt-dlp';
}

// Stream URL cache (TTL = 4h)
const _streamCache = new Map();
const STREAM_CACHE_TTL = 4 * 60 * 60 * 1000;

function getCachedStream(videoId) {
  const entry = _streamCache.get(videoId);
  if (!entry) return null;
  if (Date.now() - entry.ts > STREAM_CACHE_TTL) { _streamCache.delete(videoId); return null; }
  return entry.result;
}
function setCachedStream(videoId, result) {
  _streamCache.set(videoId, { result, ts: Date.now() });
}

function resolveWithYtDlp(videoId) {
  return new Promise((resolve) => {
    const bin = findYtDlp();
    const args = [
      '--no-playlist', '--no-warnings',
      '-f', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
      '--print', '%(title)s|||%(uploader)s|||%(thumbnail)s|||%(url)s',
      `https://www.youtube.com/watch?v=${videoId}`
    ];
    let stdout = '', stderr = '';
    const proc = spawn(bin, args, { timeout: 30000 });
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => {
      if (code !== 0) {
        if (stderr.includes('unavailable') || stderr.includes('not available'))
          return resolve({ type: 'error', message: 'Vídeo no disponible.' });
        if (stderr.includes('Private video'))
          return resolve({ type: 'error', message: 'Vídeo privado.' });
        if (code === 127 || stderr.includes('not found') || stderr.includes('No such file'))
          return resolve({ type: 'error', message: 'yt-dlp no encontrado. Instálalo con: pip install yt-dlp' });
        return resolve({ type: 'error', message: `Error yt-dlp: ${stderr.slice(0, 200)}` });
      }
      const line = stdout.trim().split('\n').find(l => l.includes('|||'));
      if (!line) return resolve({ type: 'error', message: 'Respuesta yt-dlp incompleta.' });
      const parts = line.split('|||');
      if (parts.length < 4) return resolve({ type: 'error', message: 'Respuesta yt-dlp incompleta.' });
      const [title, artist, thumbnail, streamUrl] = parts;
      if (!streamUrl?.startsWith('http')) return resolve({ type: 'error', message: 'No se obtuvo URL de stream.' });
      // FIX: proxy the stream URL through our server so the browser can play it
      // (googlevideo.com URLs are IP-bound and lack CORS headers for cross-origin playback)
      const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(streamUrl)}`;
      resolve({ type: 'success', videoId, title, artist, thumbnail, streamUrl: proxyUrl });
    });
    proc.on('error', err => {
      if (err.code === 'ENOENT') resolve({ type: 'error', message: 'yt-dlp no encontrado. Instálalo con: pip install yt-dlp' });
      else resolve({ type: 'error', message: `Error yt-dlp: ${err.message}` });
    });
  });
}

function extractVideoId(inputUrl) {
  if (!inputUrl) return null;
  if (inputUrl.includes('youtu.be/'))   return inputUrl.split('youtu.be/')[1].split(/[?#]/)[0];
  if (inputUrl.includes('v='))          return inputUrl.split('v=')[1].split('&')[0];
  if (inputUrl.includes('embed/'))      return inputUrl.split('embed/')[1].split(/[?#]/)[0];
  return inputUrl.trim();
}

// ──────────────────────────────────
// YT-DLP ROUTES
// ──────────────────────────────────

// Resolve YouTube stream URL
app.post('/api/yt/resolve', async (req, res) => {
  try {
    const { url } = req.body;
    const videoId = extractVideoId(url);
    if (!videoId || videoId.length !== 11)
      return res.json({ type: 'error', message: 'ID YouTube inválido.' });
    const cached = getCachedStream(videoId);
    if (cached) return res.json(cached);
    const result = await resolveWithYtDlp(videoId);
    if (result.type === 'success') setCachedStream(videoId, result);
    res.json(result);
  } catch (e) {
    res.json({ type: 'error', message: e.message });
  }
});

// Force re-resolve (invalidate cache, used after 403)
app.post('/api/yt/resolve-force', async (req, res) => {
  try {
    const { url } = req.body;
    const videoId = extractVideoId(url);
    if (!videoId || videoId.length !== 11)
      return res.json({ type: 'error', message: 'ID YouTube inválido.' });
    _streamCache.delete(videoId);
    const result = await resolveWithYtDlp(videoId);
    if (result.type === 'success') setCachedStream(videoId, result);
    res.json(result);
  } catch (e) {
    res.json({ type: 'error', message: e.message });
  }
});

// Resolve YouTube playlist
app.post('/api/yt/playlist', (req, res) => {
  const { url } = req.body;
  if (!url) return res.json({ type: 'error', message: 'URL requerida.' });

  let playlistId = null;
  try {
    const u = new URL(url);
    playlistId = u.searchParams.get('list');
  } catch {}
  const targetUrl = playlistId
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : url;

  const bin = findYtDlp();
  const args = [
    '--yes-playlist', '--no-warnings', '--flat-playlist',
    '--print', '%(id)s|||%(title)s|||%(uploader)s|||%(thumbnail)s|||%(duration)s|||%(playlist_title)s',
    targetUrl
  ];
  let stdout = '', stderr = '';
  const proc = spawn(bin, args, { timeout: 120000 });
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());
  proc.on('close', code => {
    if (code !== 0) {
      if (code === 127 || stderr.includes('not found') || stderr.includes('No such file'))
        return res.json({ type: 'error', message: 'yt-dlp no encontrado.' });
      return res.json({ type: 'error', message: `Error yt-dlp: ${stderr.slice(0, 200)}` });
    }
    const lines = stdout.trim().split('\n').filter(l => l.includes('|||'));
    if (!lines.length) return res.json({ type: 'error', message: 'No se encontraron vídeos.' });

    let playlistTitle = '';
    const firstParts = lines[0].split('|||');
    if (firstParts[5]?.trim() && firstParts[5].trim() !== 'NA') playlistTitle = firstParts[5].trim();
    if (!playlistTitle) {
      const m = stderr.match(/\[download\] Downloading playlist: (.+)/);
      if (m) playlistTitle = m[1].trim();
    }
    if (!playlistTitle) playlistTitle = 'Playlist de YouTube';

    const videos = lines.map(line => {
      const [id, title, uploader, thumbnailRaw, durationRaw] = line.split('|||');
      const vidId = id?.trim();
      let thumbnail = thumbnailRaw?.trim() || '';
      if (!thumbnail || thumbnail === 'NA' || !thumbnail.startsWith('http'))
        thumbnail = vidId?.length === 11 ? `https://i.ytimg.com/vi/${vidId}/maxresdefault.jpg` : '';
      return { id: vidId, title: title?.trim() || 'Sin título', uploader: uploader?.trim() || '', thumbnail, duration: parseInt(durationRaw) || 0 };
    }).filter(v => v.id?.length === 11);

    res.json({ type: 'success', playlistTitle, playlistId: playlistId || 'yt-pl', videos });
  });
  proc.on('error', err => {
    res.json({ type: 'error', message: err.code === 'ENOENT' ? 'yt-dlp no encontrado.' : `Error: ${err.message}` });
  });
});

// Search YouTube
app.post('/api/yt/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ type: 'error', message: 'query requerida.' });

  const bin = findYtDlp();
  const args = [
    '--no-playlist', '--no-warnings', '--flat-playlist',
    '--print', '%(id)s|%(title)s|%(uploader)s|%(duration)s|%(thumbnail)s',
    `ytsearch15:${query}`
  ];
  let stdout = '', stderr = '';
  const proc = spawn(bin, args, { timeout: 30000 });
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());
  proc.on('close', code => {
    if (code !== 0) {
      if (code === 127 || stderr.includes('not found') || stderr.includes('No such file'))
        return res.json({ type: 'error', message: 'yt-dlp no encontrado.' });
      return res.json({ type: 'error', message: `Error yt-dlp: ${stderr.slice(0, 180)}` });
    }
    const results = stdout.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split('|');
      if (parts.length < 4) return null;
      const [id, title, uploader, duration, thumbnailRaw] = parts;
      const dur = parseInt(duration) || 0;
      const mins = Math.floor(dur / 60);
      const secs = String(dur % 60).padStart(2, '0');
      const thumbnail = thumbnailRaw && thumbnailRaw !== 'NA' && thumbnailRaw.startsWith('http')
        ? thumbnailRaw
        : (id?.length === 11 ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '');
      return { id: id?.trim(), title: title?.trim(), uploader: uploader?.trim(), duration: dur > 0 ? `${mins}:${secs}` : '—', thumbnail };
    }).filter(Boolean);
    res.json({ type: 'success', results });
  });
  proc.on('error', err => {
    res.json({ type: 'error', message: err.code === 'ENOENT' ? 'yt-dlp no encontrado.' : `Error: ${err.message}` });
  });
});

// Resolve Spotify → YouTube
app.post('/api/yt/resolve-spotify', (req, res) => {
  const { title, artist } = req.body;
  if (!title) return res.json({ type: 'error', message: 'title requerido.' });

  const bin = findYtDlp();
  const cleanTitle = (title || '').replace(/\s*[\(\[](feat\.|ft\.|with\s|prod\.|remix|version|remastered|explicit)[^\)\]]*[\)\]]/gi, '').trim();
  const primaryArtist = (artist || '').split(/[,&\/]/)[0].trim();
  const queries = [
    `${primaryArtist} - ${cleanTitle} audio`,
    `${primaryArtist} ${cleanTitle}`,
    `${artist} ${title}`,
  ];

  let attemptIndex = 0;
  function tryNext() {
    if (attemptIndex >= queries.length) return res.json({ type: 'error', message: 'No encontrado en YouTube' });
    const query = queries[attemptIndex++];
    const args = [
      '--no-playlist', '--no-warnings', '--flat-playlist',
      '--print', '%(id)s|%(title)s|%(uploader)s|%(duration)s',
      `ytsearch5:${query}`,
    ];
    let stdout = '', stderr = '';
    const proc = spawn(bin, args, { timeout: 20000 });
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => {
      if (code !== 0) return tryNext();
      const results = stdout.trim().split('\n').filter(Boolean).map(line => {
        const [id, t, u, dur] = line.split('|');
        return { id: id?.trim(), title: t?.trim() || '', uploader: u?.trim() || '', duration: parseInt(dur) || 0 };
      }).filter(r => r?.id?.length === 11);
      if (!results.length) return tryNext();

      const titleLow = cleanTitle.toLowerCase();
      const artistLow = primaryArtist.toLowerCase();
      let best = null, bestScore = -Infinity;
      for (const r of results) {
        const rt = r.title.toLowerCase();
        const ru = r.uploader.toLowerCase();
        let score = 0;
        if (rt.includes(titleLow)) score += 4;
        if (rt.includes(artistLow) || ru.includes(artistLow)) score += 3;
        if (rt.includes('cover') && !title.toLowerCase().includes('cover')) score -= 3;
        if (rt.includes('karaoke') || rt.includes('tutorial') || rt.includes('reaction')) score -= 5;
        if (ru.includes('vevo') || ru.includes('official')) score += 2;
        if (score > bestScore) { bestScore = score; best = r; }
      }
      if (best) return res.json({ type: 'success', videoId: best.id });
      tryNext();
    });
    proc.on('error', tryNext);
  }
  tryNext();
});

// ──────────────────────────────────
// LYRICS API
// ──────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    };
    try {
      const req = client.get(url, options, (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
          return fetchUrl(response.headers.location).then(resolve).catch(() => resolve({ status: 0, body: '' }));
        }
        let body = '';
        response.on('data', chunk => body += chunk.toString());
        response.on('end', () => resolve({ status: response.statusCode, body }));
        response.on('error', () => resolve({ status: 0, body: '' }));
      });
      req.on('error', () => resolve({ status: 0, body: '' }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '' }); });
    } catch (e) {
      resolve({ status: 0, body: '' });
    }
  });
}

app.post('/api/lyrics', async (req, res) => {
  try {
    const { title, artist, romaji } = req.body;
    const cleanTitle  = (title  || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/ft\.?.*/i, '').trim();
    const cleanArtist = (artist || '').replace(/\s*ft\.?.*/i, '').split(',')[0].split('&')[0].trim();

    async function scrapeGeniusPage(url) {
      try {
        const page = await fetchUrl(url);
        if (page.status !== 200) return null;
        const containers = [];
        const regex = /data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g;
        let m;
        while ((m = regex.exec(page.body)) !== null) containers.push(m[1]);
        if (!containers.length) return null;
        let raw = containers.join('\n')
          .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#x27;/gi, "'").replace(/&#39;/g, "'").trim();
        return raw.length > 20 ? raw : null;
      } catch { return null; }
    }

    async function searchGeniusAll(query, maxHits = 5) {
      const results = [];
      try {
        const r = await fetchUrl(`https://genius.com/api/search/multi?per_page=${maxHits}&q=${encodeURIComponent(query)}`);
        if (r.status !== 200) return results;
        const data = JSON.parse(r.body);
        const hits = data?.response?.sections?.find(s => s.type === 'song')?.hits || [];
        for (const h of hits.slice(0, maxHits)) {
          if (!h?.result?.url) continue;
          const lyr = await scrapeGeniusPage(h.result.url);
          if (lyr) results.push({ label: `${h.result.title} — ${h.result.primary_artist?.name || ''}`.trim(), url: h.result.url, lyrics: lyr, synced: null, source: 'Genius' });
        }
      } catch {}
      return results;
    }

    // ROMAJI MODE
    if (romaji) {
      const romajiResults = [];
      const seen = new Set();
      for (const q of [`${cleanTitle} romanized`, `${cleanTitle} ${cleanArtist} romanized`, `${cleanTitle} romaji`]) {
        const r = await fetchUrl(`https://genius.com/api/search/multi?per_page=8&q=${encodeURIComponent(q)}`);
        if (r.status !== 200) continue;
        const data = JSON.parse(r.body);
        const hits = data?.response?.sections?.find(s => s.type === 'song')?.hits || [];
        for (const h of hits.slice(0, 8)) {
          if (!h?.result?.url || seen.has(h.result.url)) continue;
          const st = (h.result.title || '').toLowerCase();
          const su = (h.result.primary_artist?.name || '').toLowerCase();
          const sw = (h.result.url || '').toLowerCase();
          if (!(st.includes('romanized') || st.includes('romaji') || su.includes('romaniz') || sw.includes('romaji'))) continue;
          seen.add(h.result.url);
          const lyr = await scrapeGeniusPage(h.result.url);
          if (lyr) romajiResults.push({ label: h.result.title || st, lyrics: lyr, synced: null, source: 'Genius Romanizations' });
        }
        if (romajiResults.length >= 3) break;
      }
      if (romajiResults.length > 0)
        return res.json({ found: true, multiple: romajiResults.length > 1, results: romajiResults, lyrics: romajiResults[0].lyrics, synced: null, source: romajiResults[0].source });
      return res.json({ found: false });
    }

    // NORMAL MODE — parallel fetch
    const allResults = [];
    const [lrcResult, gHits, azResult, ovhResult] = await Promise.allSettled([
      // 1) lrclib
      (async () => {
        const results = [];
        const r = await fetchUrl(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
        if (r.status === 200) {
          const list = JSON.parse(r.body);
          const seen = new Set();
          for (const item of list.slice(0, 5)) {
            const key = (item.trackName + '||' + item.artistName).toLowerCase().trim();
            if (seen.has(key)) continue;
            seen.add(key);
            if (item.syncedLyrics?.length > 20)
              results.push({ label: `${item.trackName} — ${item.artistName}`, lyrics: item.plainLyrics || item.syncedLyrics, synced: item.syncedLyrics, source: 'LRCLib (sync)' });
            else if (item.plainLyrics?.length > 20)
              results.push({ label: `${item.trackName} — ${item.artistName}`, lyrics: item.plainLyrics, synced: null, source: 'LRCLib' });
          }
        }
        return results;
      })(),
      // 2) Genius
      searchGeniusAll(`${cleanTitle} ${cleanArtist}`, 3),
      // 3) AZLyrics
      (async () => {
        const r = await fetchUrl(`https://search.azlyrics.com/search.php?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}&w=songs`);
        if (r.status === 200) {
          const linkMatch = r.body.match(/href="(https:\/\/www\.azlyrics\.com\/lyrics\/[^"]+\.html)"/);
          if (linkMatch) {
            const page = await fetchUrl(linkMatch[1]);
            if (page.status === 200) {
              const rm = page.body.match(/<!-- Usage of azlyrics[\s\S]*?-->([\s\S]*?)<!-- MxM banner/);
              if (rm) {
                let raw = rm[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
                if (raw.length > 20) return [{ label: `${cleanTitle} — AZLyrics`, lyrics: raw, synced: null, source: 'AZLyrics' }];
              }
            }
          }
        }
        return [];
      })(),
      // 4) lyrics.ovh
      (async () => {
        const r = await fetchUrl(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
        if (r.status === 200) {
          const data = JSON.parse(r.body);
          if (data.lyrics?.length > 20) return [{ label: `${cleanTitle} — lyrics.ovh`, lyrics: data.lyrics, synced: null, source: 'lyrics.ovh' }];
        }
        return [];
      })(),
    ]);

    if (lrcResult.status === 'fulfilled') allResults.push(...lrcResult.value);
    if (gHits.status === 'fulfilled') allResults.push(...gHits.value);
    if (azResult.status === 'fulfilled') allResults.push(...azResult.value);
    if (ovhResult.status === 'fulfilled') allResults.push(...ovhResult.value);

    if (!allResults.length) return res.json({ found: false });
    res.json({ found: true, multiple: allResults.length > 1, results: allResults, lyrics: allResults[0].lyrics, synced: allResults[0].synced || null, source: allResults[0].source });
  } catch (e) {
    console.error('[lyrics]', e);
    res.json({ found: false });
  }
});

// ──────────────────────────────────
// IMAGE PROXY
// ──────────────────────────────────

app.get('/api/image-proxy', (req, res) => {
  const url = req.query.url;
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://')))
    return res.status(400).json({ error: 'URL inválida' });

  const isYT = url.includes('ytimg.com') || url.includes('ggpht.com') || url.includes('googleusercontent.com');
  const client = url.startsWith('https') ? https : http;
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  if (isYT) {
    headers['Referer'] = 'https://www.youtube.com/';
    headers['Origin'] = 'https://www.youtube.com';
  }

  const doFetch = (targetUrl, depth = 0) => {
    if (depth > 5) return res.status(502).end();
    client.get(targetUrl, { timeout: 10000, headers }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        return doFetch(response.headers.location, depth + 1);
      }
      if (response.statusCode !== 200) {
        if (isYT && response.statusCode === 404 && targetUrl.includes('maxresdefault'))
          return doFetch(targetUrl.replace('maxresdefault', 'hqdefault'), depth + 1);
        return res.status(response.statusCode).end();
      }
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      response.pipe(res);
    }).on('error', () => res.status(502).end());
  };
  doFetch(url);
});

// ──────────────────────────────────
// AUDIO PROXY — tunnela el stream de googlevideo.com al browser
// Necesario porque esas URLs son IP-bound y no tienen CORS headers.
// ──────────────────────────────────
app.get('/api/audio-proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'url inválida.' });
  }

  const parsed = new URL(targetUrl);
  const isHttps = parsed.protocol === 'https:';
  const client  = isHttps ? https : http;
  const options = {
    hostname: parsed.hostname,
    port:     parsed.port || (isHttps ? 443 : 80),
    path:     parsed.pathname + parsed.search,
    method:   'GET',
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept':          '*/*',
      'Accept-Encoding': 'identity',
      'Referer':         'https://www.youtube.com/',
      'Origin':          'https://www.youtube.com',
      // Forward Range header for seek support
      ...(req.headers['range'] ? { 'Range': req.headers['range'] } : {}),
    },
  };

  const proxyReq = client.request(options, (proxyRes) => {
    // Forward status + audio headers to client
    res.writeHead(proxyRes.statusCode, {
      'Content-Type':   proxyRes.headers['content-type']  || 'audio/webm',
      'Content-Length': proxyRes.headers['content-length'] || '',
      'Accept-Ranges':  'bytes',
      'Cache-Control':  'no-store',
      'Access-Control-Allow-Origin': '*',
      ...(proxyRes.headers['content-range'] ? { 'Content-Range': proxyRes.headers['content-range'] } : {}),
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) res.status(502).json({ error: 'Error proxy: ' + err.message });
  });

  req.on('close', () => proxyReq.destroy());
  proxyReq.end();
});

// ──────────────────────────────────
// SPOTIFY PLAYLIST — usa spotify_scraper_helper.py (sin API key)
// ──────────────────────────────────
app.get('/api/spotify/playlist/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.json({ type: 'error', message: 'ID de playlist requerido.' });

  const playlistUrl = `https://open.spotify.com/playlist/${id}`;

  // Buscar el script helper junto al server.js
  const helperCandidates = [
    path.join(__dirname, 'spotify_scraper_helper.py'),
    path.join(process.resourcesPath || __dirname, 'spotify_scraper_helper.py'),
  ];
  const helperPath = helperCandidates.find(p => fs.existsSync(p));

  if (!helperPath) {
    return res.json({ type: 'error', message: 'spotify_scraper_helper.py no encontrado junto a server.js' });
  }

  const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
  let stdout = '', stderr = '';
  const proc = spawn(pythonBin, [helperPath, playlistUrl], { timeout: 60000 });
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());
  proc.on('close', code => {
    if (code !== 0) {
      const errMsg = stderr.includes('spotifyscraper no instalado')
        ? 'Instala spotifyscraper: pip install spotifyscraper'
        : `Error al leer playlist: ${stderr.slice(0, 200)}`;
      return res.json({ type: 'error', message: errMsg });
    }
    try {
      const data = JSON.parse(stdout.trim());
      if (data.error) return res.json({ type: 'error', message: data.error });
      return res.json({ type: 'success', playlistTitle: data.playlistTitle, tracks: data.tracks });
    } catch (e) {
      return res.json({ type: 'error', message: 'Respuesta inválida del scraper.' });
    }
  });
  proc.on('error', err => {
    const msg = err.code === 'ENOENT'
      ? `${pythonBin} no encontrado. Instala Python 3.`
      : `Error: ${err.message}`;
    if (!res.headersSent) res.json({ type: 'error', message: msg });
  });
});

// ──────────────────────────────────
// SPA FALLBACK — debe ir DESPUÉS de todas las rutas /api/*
// ──────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handler para body-parser y errores generales
// IMPORTANTE: debe estar DESPUÉS de todas las rutas para funcionar
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[JSON Parse Error]', err.message, 'Body:', err.body?.substring?.(0, 100));
    req.body = {};
    return next();
  }
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  const configPath = getConfigDir();
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  🎵 NOFUFAUDIO PWA                      ║`);
  console.log(`║  Servidor ejecutándose en:              ║`);
  console.log(`║  http://localhost:${PORT}${' '.repeat(Math.max(0, 16 - String(PORT).length))}║`);
  console.log(`║                                          ║`);
  console.log(`║  Config guardada en:                     ║`);
  // Truncar path si es muy largo
  if (configPath.length > 37) {
    console.log(`║  ...${configPath.slice(-33)}  ║`);
  } else {
    console.log(`║  ${configPath}${' '.repeat(Math.max(0, 37 - configPath.length))} ║`);
  }
  console.log(`╚════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM recibida, cerrando...');
  server.close(() => {
    console.log('[Server] Cerrado');
    process.exit(0);
  });
});

module.exports = app;