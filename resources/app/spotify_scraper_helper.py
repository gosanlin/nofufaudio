
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

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

logging.basicConfig(stream=sys.stderr, level=logging.WARNING)

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

        try:
            client = SpotifyClient(log_level='ERROR')
        except TypeError:

            client = SpotifyClient()

        if hasattr(client, 'get_playlist_info'):
            playlist_raw = client.get_playlist_info(playlist_url)
        else:

            try:
                playlist_raw = client.get_playlist(playlist_url, max_tracks=None)
            except TypeError:

                playlist_raw = client.get_playlist(playlist_url)

        playlist = playlist_raw.to_dict() if hasattr(playlist_raw, 'to_dict') else playlist_raw

        try:
            client.close()
        except (AttributeError, Exception):
            pass
    except Exception as e:
        sys.stderr.write(json.dumps({"error": str(e)}) + "\n")
        sys.exit(1)

    playlist_title = playlist.get('name', 'Playlist de Spotify')
    raw_tracks = playlist.get('tracks', [])

    tracks = []
    for entry in raw_tracks:
        try:
            if not entry:
                continue

            t = entry.get('track') if isinstance(entry.get('track'), dict) else entry
            if not t or not t.get('name'):
                continue
            artists = t.get('artists', []) or []
            artist_str = ', '.join(
                a.get('name', '') for a in artists if isinstance(a, dict) and a.get('name')
            )
            album_info = t.get('album', {}) or {}
            images = album_info.get('images', []) if isinstance(album_info, dict) else []
            cover = ''
            if images:
                # Spotify devuelve images ordenadas por tamaño desc.; preferimos la mediana.
                # Acceso defensivo: una entrada malformada no debe tumbar toda la importación.
                for img in (images[1:2] + images[0:1] + images[2:]):
                    if isinstance(img, dict) and img.get('url'):
                        cover = img['url']
                        break

            duration_ms = t.get('duration_ms', 0) or 0
            tracks.append({
                'id':       t.get('id') or t.get('name', ''),
                'title':    t.get('name', ''),
                'artist':   artist_str,
                'album':    album_info.get('name', '') if isinstance(album_info, dict) else '',
                'cover':    cover,
                'duration': int(duration_ms / 1000),
            })
        except Exception:
            # Una pista rota no debe impedir importar el resto de la playlist
            continue

    result = {
        'playlistTitle': playlist_title,
        'tracks': tracks,
    }

    sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
