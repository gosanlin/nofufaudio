/* ═══════════════════════════════════════════════
   NOFUFAUDIO — i18n.js
   Motor de traducción ES/EN.
   - Traduce todos los elementos con data-i18n / data-i18n-title / data-i18n-placeholder
   - Reacciona a contenido inyectado dinámicamente (MutationObserver)
   - Expone window.i18n.t()/.T()/.setLanguage()/.getLanguage() para app.js
═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'nfa_settings'; // reutiliza el mismo storage que usa app.js
  var LANG_FALLBACK_KEY = 'nfa_lang';

  /* ── Diccionario de claves estáticas (data-i18n) ── */
  var DICTS = {
    es: {
      "color.amber": "Ámbar", "color.blue": "Azul", "color.cyan": "Cyan", "color.green": "Verde",
      "color.lime": "Lima", "color.orange": "Naranja", "color.pink": "Rosa", "color.purple": "Morado",
      "color.red": "Rojo", "color.themeAccent": "Acento del tema", "color.white": "Blanco",
      "common.artistField": "Artista", "common.back": "Volver", "common.cancel": "Cancelar",
      "common.choose": "Elegir…", "common.clear": "Limpiar", "common.clearAll": "Limpiar",
      "common.close": "Cerrar", "common.color": "Color", "common.create": "Crear",
      "common.deleteAll": "Borrar todo", "common.deleteSongs": "Borrar canciones",
      "common.download": "Descargar", "common.downloadAll": "Descargar todo",
      "common.exactVolume": "Volumen exacto", "common.favorite": "Favorito", "common.format": "Formato",
      "common.glowShadow": "Glow / sombra", "common.loading": "Cargando…", "common.next": "Siguiente",
      "common.notSet": "(no establecida)", "common.opacity": "Opacidad", "common.repeat": "Repetir",
      "common.reset": "Restablecer", "common.save": "Guardar", "common.saveChanges": "Guardar cambios",
      "common.seeAll": "Ver todo", "common.sensitivity": "Sensibilidad", "common.shuffle": "Aleatorio",
      "common.titleField": "Título",
      "ctx.addToPlaylist": "Añadir a playlist", "ctx.deleteTrack": "Eliminar canción",
      "ctx.editInfo": "Editar información", "ctx.playNext": "Reproducir siguiente",
      "ctx.saveToLibrary": "Guardar en biblioteca", "ctx.trackOptions": "Opciones de canción",
      "downloads.empty": "Sin descargas activas", "downloads.title": "Descargas",
      "eq.classical": "Clásica", "eq.enableDisable": "Activar/Desactivar ecualizador",
      "eq.flat": "Plano", "eq.myPresets": "Mis presets:", "eq.presetName": "Nombre del preset",
      "eq.presetNamePlaceholder": "Mi preset...", "eq.savePreset": "Guardar preset",
      "eq.savePresetTitle": "Guardar configuración actual como preset",
      "eq.selectedGain": "Ganancia selec.", "eq.title": "Ecualizador",
      "favorites.collection": "Colección", "favorites.download": "Descargar favoritos",
      "favorites.empty": "Sin favoritos aún",
      "favorites.emptyHint": "Pulsa el corazón en cualquier canción para guardarla aquí",
      "favorites.play": "Reproducir favoritos",
      "home.favoritesEmpty": "Marca canciones como favoritas", "home.greetingAfternoon": "Buenas tardes",
      "home.greetingMorning": "Buenos días", "home.greetingNight": "Buenas noches",
      "home.libraryEmpty": "Importa canciones para verlas aquí",
      "home.playlistsEmpty": "Importa una playlist para verla aquí",
      "home.recents": "Reproducido recientemente", "home.recentsEmpty": "Aún no has reproducido nada",
      "home.suggestions": "Sugerencias para ti",
      "home.suggestionsEmpty": "Escucha algunas canciones para recibir sugerencias",
      "home.yourLibrary": "Tu biblioteca", "home.yourPlaylists": "Tus playlists",
      "library.addFiles": "Añadir archivos", "library.empty": "Biblioteca vacía",
      "library.emptyHint": "Importa canciones para construir tu biblioteca",
      "lyrics.multipleResults": "Varios resultados:",
      "lyrics.placeholder": "Reproduce una canción para ver la letra", "lyrics.title": "Letra",
      "lyrics.toggle": "Mostrar/Ocultar letra", "lyrics.view": "Ver letra",
      "modal.addCover": "Añadir portada", "modal.editTrack": "Editar canción",
      "modal.newPlaylist": "Nueva playlist", "modal.playlistNamePlaceholder": "Nombre de la playlist",
      "nav.favorites": "Favoritos", "nav.home": "Inicio", "nav.library": "Biblioteca", "nav.queue": "Cola",
      "nc.active": "ACTIVO", "nc.enableDisable": "Activar/Desactivar Nightcore",
      "nc.finalSpeed": "Velocidad final:", "nc.pitch": "Pitch", "nc.slowed": "Slowed",
      "nc.speed": "Velocidad", "nc.speedUp": "Speed Up", "nc.title": "Nightcore / Velocidad / Pitch",
      "nc.title2": "Nightcore", "nc.trebleBoost": "Realce agudos", "nc.vaporwave": "Vaporwave",
      "playlist.addFromQueue": "+ Añadir cola actual", "playlist.changeCover": "Cambiar portada",
      "playlist.delete": "Eliminar playlist", "playlist.download": "Descargar playlist",
      "playlist.empty": "Playlist vacía",
      "playlist.emptyHint": "Añade canciones con el botón ··· en cualquier canción",
      "playlist.label": "Playlist", "queue.empty": "Tu cola está vacía",
      "queue.emptyHint": "Importa archivos o añade un enlace de YouTube",
      "queue.title": "Cola de reproducción",
      "search.spPlaceholder": "Busca canciones en el catálogo de Spotify",
      "search.ytPlaceholder": "Escribe para buscar canciones, vídeos y audios",
      "settings.accentColor": "Acento de color", "settings.accentColorHint": "Color principal de la interfaz",
      "settings.audioFormat": "Formato de audio", "settings.audioFormatHint": "Para descargas desde YouTube",
      "settings.autoLyrics": "Buscar letra automáticamente", "settings.autoLyricsHint": "Al reproducir una canción",
      "settings.autoplay": "Reproducción continua", "settings.autoplayHint": "Reproducir siguiente automáticamente",
      "settings.closeTray": "Cerrar al tray", "settings.closeTrayHint": "Al cerrar la ventana, la app sigue en tray",
      "settings.crossfade": "Fade entre canciones", "settings.crossfadeDuration": "Duración del fade",
      "settings.crossfadeHint": "Transición suave de audio", "settings.defaultVolume": "Volumen por defecto",
      "settings.defaultVolumeHint": "Volumen al iniciar la app", "settings.downloadFolder": "Carpeta de descarga",
      "settings.downloadsSection": "Descargas", "settings.exportBtn": "⤓ Exportar config",
      "settings.exportTitle": "Exportar toda la configuración a un archivo", "settings.folderBtn": "📁 Carpeta",
      "settings.hideWindowButtons": "Ocultar botones de ventana",
      "settings.hideWindowButtonsHint": "Oculta minimizar, maximizar y cerrar de la barra superior",
      "settings.importBtn": "⤒ Importar config", "settings.importTitle": "Importar configuración de un archivo",
      "settings.interface": "Interfaz", "settings.language": "Idioma",
      "settings.languageHint": "Cambia el idioma de la interfaz", "settings.lyricsSection": "Letra (Lyrics)",
      "settings.minimizeTray": "Minimizar al tray",
      "settings.minimizeTrayHint": "Ocultar en bandeja del sistema al minimizar",
      "settings.normalize": "Normalización de volumen", "settings.normalizeHint": "Iguala el volumen entre canciones",
      "settings.openFolderTitle": "Abrir carpeta nofufaudioConfigs",
      "settings.originalFormat": "Original (sin convertir)", "settings.playback": "Reproducción",
      "settings.showDuration": "Mostrar duración en lista", "settings.showDurationHint": "Ver tiempo en cada canción",
      "settings.showViz": "Mostrar visualizador",
      "settings.showVizHint": "Ondas de sonido sobre la barra del reproductor",
      "settings.spinArt": "Animación en la portada", "settings.spinArtHint": "Rotación suave del artwork",
      "settings.syncedLyrics": "Resaltado sincronizado",
      "settings.syncedLyricsHint": "Como Spotify (requiere lyrics sync)", "settings.system": "Sistema",
      "settings.vizColor": "Color del visualizador", "settings.vizSection": "Visualizador (NCS)",
      "settings.vizShadow": "Sombra / glow", "settings.vizShadowHint": "Efecto de brillo",
      "sidebar.audioFiles": "Archivos de audio", "sidebar.dropHere": "Suelta canciones aquí",
      "sidebar.fullFolder": "Carpeta completa", "sidebar.import": "Importar",
      "sidebar.newPlaylist": "Nueva playlist", "sidebar.playlists": "Playlists",
      "sidebar.spLinkPlaceholder": "Enlace de playlist de Spotify…",
      "sidebar.ytLinkPlaceholder": "Enlace de vídeo o playlist de YT…",
      "tbar.home": "Inicio", "tbar.reload": "Reiniciar app  (Ctrl+R / F5)",
      "tbar.searchModeToggle": "Cambiar modo de búsqueda", "tbar.searchYoutube": "Buscar en YouTube…",
      "tbar.settings": "⚙️ Configuración", "tbar.theme": "Personalizar tema",
      "tbar.toggleSidebar": "Mostrar/Ocultar panel lateral",
      "theme.accentColorLabel": "Color de acento", "theme.accentHint": "Play, activos, highlights",
      "theme.amoledBlack": "AMOLED negro puro", "theme.backgrounds": "Fondos", "theme.baseSize": "Tamaño base",
      "theme.baseSizeHint": "Font-size global", "theme.bgHoverCards": "Hover / cards",
      "theme.bgImage": "Imagen de fondo", "theme.bgMain": "Fondo principal",
      "theme.bgOpacity": "Opacidad del fondo", "theme.bgOpacityHint": "Transparencia sobre la imagen",
      "theme.bgSecondary": "Fondo secundario", "theme.bgTertiary": "Fondo terciario",
      "theme.blur": "Desenfoque (blur)", "theme.blurHint": "Suaviza el fondo",
      "theme.borderOpacity": "Opacidad de bordes", "theme.borderOpacityHint": "Visibilidad de separadores",
      "theme.borderRadius": "Radio de bordes", "theme.borderRadiusHint": "Redondez general (--r8, --r12)",
      "theme.bordersRadius": "Bordes y radios", "theme.brightness": "Brillo",
      "theme.brightnessHint": "Oscurecer o aclarar el fondo", "theme.chooseImage": "Elegir imagen",
      "theme.classicDark": "Oscuro clásico", "theme.coffeeBrown": "Marrón café",
      "theme.customize": "Personalizar", "theme.darkRose": "Rosa oscuro", "theme.discordBlue": "Discord Azul",
      "theme.exportTheme": "Exportar tema", "theme.fitContain": "Contain (encajar)",
      "theme.fitCover": "Cover (recortar)", "theme.fitFill": "Estirar", "theme.fitNone": "Sin ajuste",
      "theme.forestGreen": "Verde bosque", "theme.grayscale": "Escala de grises",
      "theme.grayscaleHint": "Quitar colores al fondo", "theme.imageFit": "Ajuste de imagen",
      "theme.importTheme": "Importar tema", "theme.lightMode": "Modo claro",
      "theme.lyricsFont": "Fuente de lyrics", "theme.lyricsFontHint": "Solo afecta al panel de letra",
      "theme.lyricsSize": "Tamaño de lyrics", "theme.lyricsSizeHint": "Tamaño de la letra en el panel",
      "theme.lyricsTypography": "Tipografía · Lyrics", "theme.mainFont": "Fuente principal",
      "theme.mainFontHint": "Font de toda la UI", "theme.midnightBlue": "Midnight azul",
      "theme.modalOpacity": "Opacidad de modales", "theme.modalOpacityHint": "Backdrop blur de ventanas",
      "theme.oceanBlue": "Azul océano", "theme.panelGap": "Gap entre paneles",
      "theme.panelGapHint": "Espacio entre sidebar/main/lyrics", "theme.playerBarHeight": "Barra del reproductor",
      "theme.playerBarHeightHint": "Altura del player inferior", "theme.playerBarVar": "Barra del jugador",
      "theme.playerBarVarHint": "Titlebar + player bar", "theme.presets": "Presets de tema",
      "theme.removeBg": "Quitar fondo", "theme.resetAll": "Restablecer todo",
      "theme.spotifyGreen": "Verde Spotify", "theme.text": "Texto", "theme.textMain": "Texto principal",
      "theme.textSecondary": "Texto secundario", "theme.textSubtle": "Texto sutil / hints",
      "theme.typography": "Tipografía", "theme.visualEffects": "Efectos visuales",
      "viz.bars": "Barras", "viz.circle": "Círculo", "viz.dots": "Puntos", "viz.enable": "Activar visualizador",
      "viz.line": "Línea", "viz.mirror": "Espejo",
      "viz.placeholder": "Reproduce una canción para ver el visualizador",
      "viz.settingsTitle": "Ajustes del visualizador", "viz.style": "Estilo", "viz.title": "Visualizador",
      "viz.wave": "Onda"
    },
    en: {
      "color.amber": "Amber", "color.blue": "Blue", "color.cyan": "Cyan", "color.green": "Green",
      "color.lime": "Lime", "color.orange": "Orange", "color.pink": "Pink", "color.purple": "Purple",
      "color.red": "Red", "color.themeAccent": "Theme accent", "color.white": "White",
      "common.artistField": "Artist", "common.back": "Back", "common.cancel": "Cancel",
      "common.choose": "Choose…", "common.clear": "Clear", "common.clearAll": "Clear",
      "common.close": "Close", "common.color": "Color", "common.create": "Create",
      "common.deleteAll": "Delete all", "common.deleteSongs": "Delete songs",
      "common.download": "Download", "common.downloadAll": "Download all",
      "common.exactVolume": "Exact volume", "common.favorite": "Favorite", "common.format": "Format",
      "common.glowShadow": "Glow / shadow", "common.loading": "Loading…", "common.next": "Next",
      "common.notSet": "(not set)", "common.opacity": "Opacity", "common.repeat": "Repeat",
      "common.reset": "Reset", "common.save": "Save", "common.saveChanges": "Save changes",
      "common.seeAll": "See all", "common.sensitivity": "Sensitivity", "common.shuffle": "Shuffle",
      "common.titleField": "Title",
      "ctx.addToPlaylist": "Add to playlist", "ctx.deleteTrack": "Delete song",
      "ctx.editInfo": "Edit info", "ctx.playNext": "Play next",
      "ctx.saveToLibrary": "Save to library", "ctx.trackOptions": "Song options",
      "downloads.empty": "No active downloads", "downloads.title": "Downloads",
      "eq.classical": "Classical", "eq.enableDisable": "Enable/Disable equalizer",
      "eq.flat": "Flat", "eq.myPresets": "My presets:", "eq.presetName": "Preset name",
      "eq.presetNamePlaceholder": "My preset...", "eq.savePreset": "Save preset",
      "eq.savePresetTitle": "Save current settings as a preset",
      "eq.selectedGain": "Selected gain", "eq.title": "Equalizer",
      "favorites.collection": "Collection", "favorites.download": "Download favorites",
      "favorites.empty": "No favorites yet",
      "favorites.emptyHint": "Tap the heart on any song to save it here",
      "favorites.play": "Play favorites",
      "home.favoritesEmpty": "Mark songs as favorites", "home.greetingAfternoon": "Good afternoon",
      "home.greetingMorning": "Good morning", "home.greetingNight": "Good evening",
      "home.libraryEmpty": "Import songs to see them here",
      "home.playlistsEmpty": "Import a playlist to see it here",
      "home.recents": "Recently played", "home.recentsEmpty": "You haven't played anything yet",
      "home.suggestions": "Suggestions for you",
      "home.suggestionsEmpty": "Listen to some songs to get suggestions",
      "home.yourLibrary": "Your library", "home.yourPlaylists": "Your playlists",
      "library.addFiles": "Add files", "library.empty": "Library empty",
      "library.emptyHint": "Import songs to build your library",
      "lyrics.multipleResults": "Multiple results:",
      "lyrics.placeholder": "Play a song to see the lyrics", "lyrics.title": "Lyrics",
      "lyrics.toggle": "Show/Hide lyrics", "lyrics.view": "View lyrics",
      "modal.addCover": "Add cover", "modal.editTrack": "Edit song",
      "modal.newPlaylist": "New playlist", "modal.playlistNamePlaceholder": "Playlist name",
      "nav.favorites": "Favorites", "nav.home": "Home", "nav.library": "Library", "nav.queue": "Queue",
      "nc.active": "ACTIVE", "nc.enableDisable": "Enable/Disable Nightcore",
      "nc.finalSpeed": "Final speed:", "nc.pitch": "Pitch", "nc.slowed": "Slowed",
      "nc.speed": "Speed", "nc.speedUp": "Speed Up", "nc.title": "Nightcore / Speed / Pitch",
      "nc.title2": "Nightcore", "nc.trebleBoost": "Treble boost", "nc.vaporwave": "Vaporwave",
      "playlist.addFromQueue": "+ Add current queue", "playlist.changeCover": "Change cover",
      "playlist.delete": "Delete playlist", "playlist.download": "Download playlist",
      "playlist.empty": "Playlist empty",
      "playlist.emptyHint": "Add songs with the ··· button on any song",
      "playlist.label": "Playlist", "queue.empty": "Your queue is empty",
      "queue.emptyHint": "Import files or add a YouTube link",
      "queue.title": "Playback queue",
      "search.spPlaceholder": "Search songs in the Spotify catalog",
      "search.ytPlaceholder": "Type to search for songs, videos and audio",
      "settings.accentColor": "Accent color", "settings.accentColorHint": "Main interface color",
      "settings.audioFormat": "Audio format", "settings.audioFormatHint": "For downloads from YouTube",
      "settings.autoLyrics": "Search lyrics automatically", "settings.autoLyricsHint": "When playing a song",
      "settings.autoplay": "Continuous playback", "settings.autoplayHint": "Automatically play the next song",
      "settings.closeTray": "Close to tray", "settings.closeTrayHint": "When closing the window, the app stays in the tray",
      "settings.crossfade": "Crossfade between songs", "settings.crossfadeDuration": "Fade duration",
      "settings.crossfadeHint": "Smooth audio transition", "settings.defaultVolume": "Default volume",
      "settings.defaultVolumeHint": "Volume when the app starts", "settings.downloadFolder": "Download folder",
      "settings.downloadsSection": "Downloads", "settings.exportBtn": "⤓ Export config",
      "settings.exportTitle": "Export all settings to a file", "settings.folderBtn": "📁 Folder",
      "settings.hideWindowButtons": "Hide window buttons",
      "settings.hideWindowButtonsHint": "Hides minimize, maximize and close from the top bar",
      "settings.importBtn": "⤒ Import config", "settings.importTitle": "Import settings from a file",
      "settings.interface": "Interface", "settings.language": "Language",
      "settings.languageHint": "Change the interface language", "settings.lyricsSection": "Lyrics",
      "settings.minimizeTray": "Minimize to tray",
      "settings.minimizeTrayHint": "Hide in the system tray when minimized",
      "settings.normalize": "Volume normalization", "settings.normalizeHint": "Evens out volume between songs",
      "settings.openFolderTitle": "Open nofufaudioConfigs folder",
      "settings.originalFormat": "Original (no conversion)", "settings.playback": "Playback",
      "settings.showDuration": "Show duration in list", "settings.showDurationHint": "See the time on each song",
      "settings.showViz": "Show visualizer",
      "settings.showVizHint": "Sound waves over the player bar",
      "settings.spinArt": "Cover art animation", "settings.spinArtHint": "Smooth artwork rotation",
      "settings.syncedLyrics": "Synced highlighting",
      "settings.syncedLyricsHint": "Like Spotify (requires lyrics sync)", "settings.system": "System",
      "settings.vizColor": "Visualizer color", "settings.vizSection": "Visualizer (NCS)",
      "settings.vizShadow": "Shadow / glow", "settings.vizShadowHint": "Glow effect",
      "sidebar.audioFiles": "Audio files", "sidebar.dropHere": "Drop songs here",
      "sidebar.fullFolder": "Full folder", "sidebar.import": "Import",
      "sidebar.newPlaylist": "New playlist", "sidebar.playlists": "Playlists",
      "sidebar.spLinkPlaceholder": "Spotify playlist link…",
      "sidebar.ytLinkPlaceholder": "YT video or playlist link…",
      "tbar.home": "Home", "tbar.reload": "Restart app  (Ctrl+R / F5)",
      "tbar.searchModeToggle": "Switch search mode", "tbar.searchYoutube": "Search on YouTube…",
      "tbar.settings": "⚙️ Settings", "tbar.theme": "Customize theme",
      "tbar.toggleSidebar": "Show/Hide side panel",
      "theme.accentColorLabel": "Accent color", "theme.accentHint": "Play, active, highlights",
      "theme.amoledBlack": "Pure AMOLED black", "theme.backgrounds": "Backgrounds", "theme.baseSize": "Base size",
      "theme.baseSizeHint": "Global font size", "theme.bgHoverCards": "Hover / cards",
      "theme.bgImage": "Background image", "theme.bgMain": "Main background",
      "theme.bgOpacity": "Background opacity", "theme.bgOpacityHint": "Transparency over the image",
      "theme.bgSecondary": "Secondary background", "theme.bgTertiary": "Tertiary background",
      "theme.blur": "Blur", "theme.blurHint": "Softens the background",
      "theme.borderOpacity": "Border opacity", "theme.borderOpacityHint": "Visibility of separators",
      "theme.borderRadius": "Border radius", "theme.borderRadiusHint": "General roundness (--r8, --r12)",
      "theme.bordersRadius": "Borders & radius", "theme.brightness": "Brightness",
      "theme.brightnessHint": "Darken or lighten the background", "theme.chooseImage": "Choose image",
      "theme.classicDark": "Classic dark", "theme.coffeeBrown": "Coffee brown",
      "theme.customize": "Customize", "theme.darkRose": "Dark rose", "theme.discordBlue": "Discord blue",
      "theme.exportTheme": "Export theme", "theme.fitContain": "Contain (fit)",
      "theme.fitCover": "Cover (crop)", "theme.fitFill": "Stretch", "theme.fitNone": "No fit",
      "theme.forestGreen": "Forest green", "theme.grayscale": "Grayscale",
      "theme.grayscaleHint": "Remove colors from the background", "theme.imageFit": "Image fit",
      "theme.importTheme": "Import theme", "theme.lightMode": "Light mode",
      "theme.lyricsFont": "Lyrics font", "theme.lyricsFontHint": "Only affects the lyrics panel",
      "theme.lyricsSize": "Lyrics size", "theme.lyricsSizeHint": "Text size in the lyrics panel",
      "theme.lyricsTypography": "Typography · Lyrics", "theme.mainFont": "Main font",
      "theme.mainFontHint": "Font for the whole UI", "theme.midnightBlue": "Midnight blue",
      "theme.modalOpacity": "Modal opacity", "theme.modalOpacityHint": "Window backdrop blur",
      "theme.oceanBlue": "Ocean blue", "theme.panelGap": "Gap between panels",
      "theme.panelGapHint": "Space between sidebar/main/lyrics", "theme.playerBarHeight": "Player bar",
      "theme.playerBarHeightHint": "Height of the bottom player", "theme.playerBarVar": "Player bar",
      "theme.playerBarVarHint": "Titlebar + player bar", "theme.presets": "Theme presets",
      "theme.removeBg": "Remove background", "theme.resetAll": "Reset all",
      "theme.spotifyGreen": "Spotify green", "theme.text": "Text", "theme.textMain": "Main text",
      "theme.textSecondary": "Secondary text", "theme.textSubtle": "Subtle text / hints",
      "theme.typography": "Typography", "theme.visualEffects": "Visual effects",
      "viz.bars": "Bars", "viz.circle": "Circle", "viz.dots": "Dots", "viz.enable": "Enable visualizer",
      "viz.line": "Line", "viz.mirror": "Mirror",
      "viz.placeholder": "Play a song to see the visualizer",
      "viz.settingsTitle": "Visualizer settings", "viz.style": "Style", "viz.title": "Visualizer",
      "viz.wave": "Wave"
    }
  };

  /* ── Traductor de frases dinámicas (toasts, confirm, errores, estados vacíos) ──
     Se aplica solo cuando el idioma activo es 'en'. Cada regla es [regex, reemplazo].
     El orden importa: las frases más específicas van primero. */
  var DYNAMIC_RULES = [
    // frases completas primero (más específicas)
    [/No se pudo reproducir\. Comprueba tu conexión\./g, "Couldn't play. Check your connection."],
    [/La biblioteca ya está vacía/g, "Library is already empty"],
    [/Biblioteca vaciada/g, "Library cleared"],
    [/Reintentando…/g, "Retrying…"],
    [/Cola limpiada/g, "Queue cleared"],
    [/La playlist ya está vacía/g, "The playlist is already empty"],
    [/Canciones eliminadas de la playlist/g, "Songs removed from the playlist"],
    [/Guardado en biblioteca/g, "Saved to library"],
    [/Reproduciendo siguiente/g, "Playing next"],
    [/Añadido a la cola/g, "Added to queue"],
    [/⚠ No se pudo importar la playlist/g, "⚠ Couldn't import the playlist"],
    [/⚠ Playlist vacía o privada/g, "⚠ Empty or private playlist"],
    [/Playlist vacía o privada/g, "Empty or private playlist"],
    [/No se encontraron vídeos en la playlist\./g, "No videos found in the playlist."],
    [/No encontrado en YouTube/g, "Not found on YouTube"],
    [/⚠ No encontrado: /g, "⚠ Not found: "],
    [/Error al resolver el stream: /g, "Error resolving stream: "],
    [/Error cargando el stream\./g, "Error loading stream."],
    [/Canción eliminada/g, "Song deleted"],
    [/Canción actualizada/g, "Song updated"],
    [/Eliminado de favoritos/g, "Removed from favorites"],
    [/Añadido a favoritos/g, "Added to favorites"],
    [/Configuración guardada/g, "Settings saved"],
    [/Configuración importada/g, "Settings imported"],
    [/Archivo de config inválido/g, "Invalid config file"],
    [/Config exportada: /g, "Config exported: "],
    [/Reproduciendo favoritos/g, "Playing favorites"],
    [/No hay favoritos para descargar/g, "No favorites to download"],
    [/Modal de descarga no disponible/g, "Download modal not available"],
    [/Favoritos eliminados/g, "Favorites deleted"],
    [/Ya está en la playlist/g, "Already in the playlist"],
    [/Descarga completa/g, "Download complete"],
    [/Elige carpeta de descarga en Configuración/g, "Choose a download folder in Settings"],
    [/No se puede descargar este audio/g, "This audio can't be downloaded"],
    [/Error en descarga: /g, "Download error: "],
    [/La playlist está vacía o no tiene canciones accesibles\./g, "The playlist is empty or has no accessible songs."],
    [/La playlist está vacía/g, "The playlist is empty"],
    [/No se pudo elegir carpeta/g, "Couldn't choose folder"],
    [/No se pudo determinar la carpeta de descarga/g, "Couldn't determine the download folder"],
    [/Elige una carpeta de descarga primero/g, "Choose a download folder first"],
    [/Descargando (\d+) canci[oó]n(es)?…/g, function (m, n, plural) { return 'Downloading ' + n + ' song' + (plural ? 's' : '') + '…'; }],
    [/Añadiendo a cola…/g, "Adding to queue…"],
    [/Cargando "(.+?)"…/g, "Loading \"$1\"…"],
    [/⚠ Error al cargar el vídeo/g, "⚠ Error loading the video"],
    [/✓ Añadido: /g, "✓ Added: "],
    [/🔍 Buscando "(.+?)"…/g, "🔍 Searching \"$1\"…"],
    [/⚠ Error buscando en YouTube/g, "⚠ Error searching on YouTube"],
    [/⚠ No se encontró en YouTube/g, "⚠ Not found on YouTube"],
    [/⬇ Descargando "(.+?)"…/g, "⬇ Downloading \"$1\"…"],
    [/✓ Descargado: /g, "✓ Downloaded: "],
    [/⚠ Error al descargar: /g, "⚠ Error downloading: "],
    [/desconocido/g, "unknown"],
    [/⚠ No se pudo obtener audio/g, "⚠ Couldn't get audio"],
    [/Tema restablecido/g, "Theme reset"],
    [/Tema exportado/g, "Theme exported"],
    [/Tema importado/g, "Theme imported"],
    [/Archivo inválido/g, "Invalid file"],
    [/Fondo aplicado/g, "Background applied"],
    [/Fondo eliminado/g, "Background removed"],
    [/Tema "(.+?)" aplicado/g, "Theme \"$1\" applied"],
    [/Ecualizador restablecido/g, "Equalizer reset"],
    [/Ecualizador activado/g, "Equalizer enabled"],
    [/Ecualizador desactivado/g, "Equalizer disabled"],
    [/Preset "(.+?)" guardado/g, "Preset \"$1\" saved"],
    [/Preset "(.+?)" eliminado/g, "Preset \"$1\" deleted"],
    [/Nightcore activado/g, "Nightcore enabled"],
    [/Nightcore desactivado/g, "Nightcore disabled"],
    [/Nightcore restablecido/g, "Nightcore reset"],
    [/Shuffle activado/g, "Shuffle enabled"],
    [/Shuffle desactivado/g, "Shuffle disabled"],
    [/Repetición activada/g, "Repeat enabled"],
    [/Repetición desactivada/g, "Repeat disabled"],
    [/Playlist eliminada/g, "Playlist deleted"],
    [/Playlist "(.+?)" creada/g, "Playlist \"$1\" created"],
    [/Añadido a "(.+?)"/g, "Added to \"$1\""],
    [/"(.+?)" importada · (\d+) canciones/g, "\"$1\" imported · $2 songs"],
    [/(\d+) canciones añadidas/g, "$1 songs added"],
    [/✓ (\d+) canciones (listas|importadas)/g, "✓ $1 songs $2"],
    [/listas/g, "ready"], [/importadas/g, "imported"],
    [/Error al importar: /g, "Error importing: "],
    [/Error: /g, "Error: "],
    [/No se pudo elegir/g, "Couldn't choose"],
    // main.js (backend) mensajes de resultado
    [/Vídeo no disponible\./g, "Video not available."],
    [/Vídeo privado\./g, "Private video."],
    [/Requiere inicio de sesión \/ edad\./g, "Requires login / age verification."],
    [/yt-dlp no encontrado\./g, "yt-dlp not found."],
    [/Respuesta yt-dlp incompleta\./g, "Incomplete yt-dlp response."],
    [/No se obtuvo URL de stream\./g, "Couldn't get stream URL."],
    [/Enlace inválido\./g, "Invalid link."],
    [/ID YouTube inválido\./g, "Invalid YouTube ID."],
    [/Playlist privada\./g, "Private playlist."],
    [/Búsqueda vacía\./g, "Empty search."],
    [/Demasiadas peticiones\. Espera un momento\./g, "Too many requests. Wait a moment."],
    [/Error de búsqueda \((\d+)\)\. Inténtalo de nuevo\./g, "Search error ($1). Try again."],
    [/Respuesta inválida del servidor\./g, "Invalid server response."],
    [/Error yt-dlp: /g, "yt-dlp error: "],
    // saludo dinámico (por si se genera fuera de getGreeting)
    [/Buenas noches/g, "Good evening"],
    [/Buenos días/g, "Good morning"],
    [/Buenas tardes/g, "Good afternoon"],
    // estados vacíos generados por JS
    [/Aún no has reproducido nada/g, "You haven't played anything yet"],
    [/Escucha algunas canciones para recibir sugerencias/g, "Listen to some songs to get suggestions"],
    [/Importa una playlist para verla aquí/g, "Import a playlist to see it here"],
    [/Importa canciones para verlas aquí/g, "Import songs to see them here"],
    [/Marca canciones como favoritas/g, "Mark songs as favorites"],
    [/Buscando letra…/g, "Searching for lyrics…"],
    [/No se encontró letra para esta canción\./g, "No lyrics found for this song."],
    [/Prueba a buscarla manualmente en Genius o AZLyrics\./g, "Try searching for it manually on Genius or AZLyrics."],
    [/Fuente: /g, "Source: "],
    [/Resultado (\d+)/g, "Result $1"],
    [/Abriendo stream…/g, "Opening stream…"],
    [/Procesando archivos…/g, "Processing files…"],
    [/Cargando archivos…/g, "Loading files…"],
    [/Cargando (\d+) canci[oó]n(es)?…/g, function (m, n, plural) { return 'Loading ' + n + ' song' + (plural ? 's' : '') + '…'; }],
    [/Importando playlist de Spotify…/g, "Importing Spotify playlist…"],
    [/Importando playlist de YouTube…/g, "Importing YouTube playlist…"],
    [/Tu reproductor híbrido/g, "Your hybrid player"],
    [/✓ completado/g, "✓ completed"],
    [/Se descargarán (\d+) canci[oó]n(es)? en la carpeta elegida\./g, function (m, n, plural) { return 'This will download ' + n + ' song' + (plural ? 's' : '') + ' to the chosen folder.'; }],
    // genéricos de baja prioridad (van al final)
    [/(\d+) canci[oó]n(es)?/g, function (m, n, plural) { return n + ' song' + (plural ? 's' : ''); }],
    [/canciones/g, "songs"], [/canción/g, "song"]
  ];

  function applyDynamicRules(str) {
    for (var i = 0; i < DYNAMIC_RULES.length; i++) {
      str = str.replace(DYNAMIC_RULES[i][0], DYNAMIC_RULES[i][1]);
    }
    return str;
  }

  /* ── Estado ── */
  function readStoredLanguage() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (raw && (raw.language === 'en' || raw.language === 'es')) return raw.language;
    } catch (e) {}
    try {
      var v = localStorage.getItem(LANG_FALLBACK_KEY);
      if (v === 'en' || v === 'es') return v;
    } catch (e) {}
    return 'es';
  }

  var currentLang = readStoredLanguage();

  function persistLanguage(lang) {
    try { localStorage.setItem(LANG_FALLBACK_KEY, lang); } catch (e) {}
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      raw.language = lang;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch (e) {}
    // Persistir también en disco (nofufaudioConfigs/settings.json) si el bridge existe
    try {
      if (window.nofuf && window.nofuf.configRead && window.nofuf.configWrite) {
        window.nofuf.configRead('settings.json').then(function (txt) {
          var cfg = {};
          try { cfg = JSON.parse(txt || '{}'); } catch (e) {}
          cfg.language = lang;
          window.nofuf.configWrite('settings.json', JSON.stringify(cfg, null, 2));
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function t(key) {
    var dict = DICTS[currentLang] || DICTS.es;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return DICTS.es[key] || key;
  }

  function T(str) {
    if (currentLang !== 'en' || typeof str !== 'string' || !str) return str;
    return applyDynamicRules(str);
  }

  function applyToNode(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 9) return;
    var els;

    els = root.querySelectorAll ? root.querySelectorAll('[data-i18n]') : [];
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = t(els[i].getAttribute('data-i18n'));
    }
    if (root.hasAttribute && root.hasAttribute('data-i18n')) {
      root.textContent = t(root.getAttribute('data-i18n'));
    }

    els = root.querySelectorAll ? root.querySelectorAll('[data-i18n-title]') : [];
    for (i = 0; i < els.length; i++) {
      els[i].setAttribute('title', t(els[i].getAttribute('data-i18n-title')));
    }
    if (root.hasAttribute && root.hasAttribute('data-i18n-title')) {
      root.setAttribute('title', t(root.getAttribute('data-i18n-title')));
    }

    els = root.querySelectorAll ? root.querySelectorAll('[data-i18n-placeholder]') : [];
    for (i = 0; i < els.length; i++) {
      els[i].setAttribute('placeholder', t(els[i].getAttribute('data-i18n-placeholder')));
    }
    if (root.hasAttribute && root.hasAttribute('data-i18n-placeholder')) {
      root.setAttribute('placeholder', t(root.getAttribute('data-i18n-placeholder')));
    }
  }

  function applyAll() {
    document.documentElement.setAttribute('lang', currentLang);
    applyToNode(document);
    // Sincroniza el <select> de idioma en Configuración > Sistema si existe
    var sel = document.getElementById('setting-language');
    if (sel && sel.value !== currentLang) sel.value = currentLang;
  }

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'es') return;
    currentLang = lang;
    persistLanguage(lang);
    applyAll();
    try {
      document.dispatchEvent(new CustomEvent('nfa-language-changed', { detail: { language: lang } }));
    } catch (e) {}
  }

  function getLanguage() { return currentLang; }

  /* ── Observador de contenido dinámico (listas renderizadas por app.js) ── */
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      for (var j = 0; j < m.addedNodes.length; j++) {
        var node = m.addedNodes[j];
        if (node.nodeType === 1) applyToNode(node);
      }
    }
  });

  function start() {
    applyAll();
    observer.observe(document.body, { childList: true, subtree: true });
    var sel = document.getElementById('setting-language');
    if (sel) {
      sel.value = currentLang;
      sel.addEventListener('change', function () { setLanguage(sel.value); });
    }
    // Por si el modal de configuración se abre después: re-sincroniza el select
    var btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', function () {
        var s = document.getElementById('setting-language');
        if (s) s.value = currentLang;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.i18n = { t: t, T: T, setLanguage: setLanguage, getLanguage: getLanguage, apply: applyAll };
})();
