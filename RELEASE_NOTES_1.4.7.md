# NofufAudio 1.4.7 — Release Notes

## Summary
Version 1.4.7 unifies the playlist importers into a single input and adds full
Deezer playlist support, while refreshing a few UI icons and labels.

## Changes vs. 1.4.6

### Unified playlist importer
- The YouTube, Spotify and Deezer importers are now merged into one input box
  (the former YouTube importer). The app auto-detects the source from the
  pasted URL and routes it to the correct importer.
- The standalone Spotify importer panel/elements were removed to avoid
  duplication.
- `handleYouTubeAdd()` now detects Spotify and Deezer playlist URLs in
  addition to YouTube playlists/single videos.

### Deezer playlist import (new)
- Added backend IPC handler `import-deezer-playlist` (main.js) that fetches
  a Deezer playlist through the public Deezer API.
- Full pagination is implemented (follows `next` links and falls back to
  index-based paging using `nb_tracks`), so playlists with 400+ tracks are
  imported completely without dropping any songs.
- Track metadata (title, artist, album, cover, duration) is preserved.
- Added `importDeezerPlaylist` to the preload bridge.
- Frontend `handleDeezerPlaylistImport()` creates lazy YouTube-resolvable
  tracks and reuses the existing pre-resolve pipeline, matching Spotify
  behavior.

### UI / icons
- Importer group title changed to "Importar playlist".
- Importer group icon changed from the YouTube logo to a download/import icon.
- "Personalizar" (theme) button icon changed to a color-palette icon.
- Placeholder text changed to "Paste your playlist link" (updated in all
  i18n language entries).
- Icons keep the same stroke style (width 13/15, round caps/joins, opacity)
  as the rest of the sidebar/toolbar icons.

## Files touched
- `resources/app/main.js` — new `import-deezer-playlist` IPC handler.
- `resources/app/preload.js` — exposed `importDeezerPlaylist`.
- `resources/app/src/app.js` — unified importer logic, Deezer detection/import,
  removed separate Spotify UI bindings.
- `resources/app/src/index.html` — unified importer UI, new icons, placeholder.
- `resources/app/src/i18n.js` — placeholder text updated for all languages.
