#!/usr/bin/env python3
"""
spotify_scraper_helper.py
Extrae datos de una playlist de Spotify usando SpotifyScraper (sin API key).
Uso: python3 spotify_scraper_helper.py <playlist_url>
Salida: JSON por stdout. SOLO JSON, nada más.
"""

import sys
import io
import json
import logging

# Forzar stdout a UTF-8 en Windows (evita UnicodeEncodeError con cp1252)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Redirigir TODOS los logs (SpotifyScraper, requests, etc.) a stderr
# para que stdout sea JSON puro
logging.basicConfig(stream=sys.stderr, level=logging.WARNING)

# Silenciar librerías que loguean a stdout o al root logger
for name in ('spotify_scraper', 'urllib3', 'requests', 'selenium'):
    logging.getLogger(name).setLevel(logging.ERROR)


def main():
    if len(sys.argv) < 2:
        sys.stderr.write(json.dumps({"error": "Falta URL de playlist"}) + "\n")
        sys.exit(1)

    playlist_url = sys.argv[1]

    try:
        from spotify_scraper import SpotifyClient
    except ImportError:
        sys.stderr.write(json.dumps({"error": "spotifyscraper no instalado. Ejecuta: pip install spotifyscraper"}) + "\n")
        sys.exit(1)

    try:
        # La librería "spotifyscraper" tuvo una reescritura mayor entre v2.x y
        # v3.x que rompe compatibilidad (nuevo API, sin fijar versión en el
        # pip install, cualquier usuario puede acabar con una u otra según
        # cuándo instale). Nos adaptamos a la que haya, en vez de asumir una:
        #
        #   v2.x: SpotifyClient(log_level=...) → dict con .get_playlist_info()
        #   v3.x: SpotifyClient()              → typed model con .get_playlist()
        #         y expone .to_dict() para volver a algo indexable con .get()
        try:
            client = SpotifyClient(log_level='ERROR')
        except TypeError:
            # v3.x ya no acepta log_level en el constructor
            client = SpotifyClient()

        if hasattr(client, 'get_playlist_info'):
            playlist_raw = client.get_playlist_info(playlist_url)
        else:
            # v3.x pagina internamente pero por defecto limita a 100 canciones
            # (parámetro max_tracks=100 por defecto). Pasamos None para traerlas
            # todas, sea cual sea el tamaño de la playlist.
            try:
                playlist_raw = client.get_playlist(playlist_url, max_tracks=None)
            except TypeError:
                # Por si acaso una versión de la librería no acepta el kwarg
                playlist_raw = client.get_playlist(playlist_url)

        # Normaliza a dict si es un modelo tipado (v3) en vez de un dict (v2)
        playlist = playlist_raw.to_dict() if hasattr(playlist_raw, 'to_dict') else playlist_raw

        try:
            client.close()
        except (AttributeError, Exception):
            pass  # v3 se puede usar como context manager y no siempre expone close()
    except Exception as e:
        sys.stderr.write(json.dumps({"error": str(e)}) + "\n")
        sys.exit(1)

    playlist_title = playlist.get('name', 'Playlist de Spotify')
    raw_tracks = playlist.get('tracks', [])

    tracks = []
    for entry in raw_tracks:
        if not entry:
            continue
        # v3: cada elemento es un wrapper {"track": {...}, "added_at": ..., "added_by": ...}
        # v2: cada elemento YA es la canción directamente ({"name": ..., "artists": ...})
        # Desenrollamos el wrapper si existe; si no, usamos el elemento tal cual.
        t = entry.get('track') if isinstance(entry.get('track'), dict) else entry
        if not t or not t.get('name'):
            continue
        artists = t.get('artists', [])
        artist_str = ', '.join(
            a['name'] for a in artists if isinstance(a, dict) and a.get('name')
        )
        album_info = t.get('album', {}) or {}
        images = album_info.get('images', []) if isinstance(album_info, dict) else []
        cover = ''
        if images:
            cover = images[1]['url'] if len(images) > 1 else images[0].get('url', '')

        duration_ms = t.get('duration_ms', 0) or 0
        tracks.append({
            'id':       t.get('id') or t.get('name', ''),
            'title':    t.get('name', ''),
            'artist':   artist_str,
            'album':    album_info.get('name', '') if isinstance(album_info, dict) else '',
            'cover':    cover,
            'duration': int(duration_ms / 1000),
        })

    result = {
        'playlistTitle': playlist_title,
        'tracks': tracks,
    }

    # Única escritura en stdout: el JSON limpio
    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    sys.stdout.flush()


if __name__ == '__main__':
    main()
