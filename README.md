<div align="center">

<img src="logonofufaudio.png" width="128" alt="NofufAudio logo" />

# NofufAudio

**Reproductor de música híbrido y de código abierto para YouTube, Spotify y archivos locales**

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20Linux-blue.svg)]()
[![Built with Electron](https://img.shields.io/badge/Hecho%20con-Electron-47848f.svg)](https://www.electronjs.org/)

</div>

---

NofufAudio es un reproductor de música de escritorio que combina streaming de YouTube, importación de playlists de Spotify y reproducción de archivos locales en una sola interfaz limpia. Sin suscripciones. Sin anuncios. Todo se queda en local.

---

## 📸 Capturas

<div align="center">
  <img src="screenshots/nofufaudio-preview1.png" width="48%" />
  <img src="screenshots/nofufaudio-preview2.png" width="48%" />
  <img src="screenshots/nofufaudio-preview3.png" width="48%" />
  <img src="screenshots/nofufaudio-preview4.png" width="48%" />
</div>

## ✨ Funcionalidades

### 🎵 Reproducción
- Reproduce audio de **YouTube** (vídeos y playlists) directamente — sin vídeo, solo audio
- Reproduce **archivos locales**: MP3, FLAC, OGG, WAV, M4A, OPUS y más
- **Cola persistente** con shuffle y repeat (canción / todo)
- **Crossfade** entre canciones (configurable de 1 a 10 segundos)
- **Normalización de volumen** para igualar canciones más altas y más bajas
- Integración con **teclas multimedia** y la sesión de medios del sistema operativo (controles en pantalla de bloqueo, portada del álbum)

### 📥 Importar
| Origen | Qué puedes importar |
|---|---|
| **Archivos locales** | Archivos sueltos o carpetas enteras — metadata y portada se leen automáticamente |
| **URL de YouTube** | Pega cualquier URL de vídeo para añadirlo a tu biblioteca al instante |
| **Playlist de YouTube** | Pega una URL de playlist — todas las canciones se importan con miniaturas |
| **Playlist de Spotify** | Pega una URL de playlist de Spotify — NofufAudio busca automáticamente el audio de YouTube correspondiente a cada canción |

### 🔍 Búsqueda
- **Buscador de YouTube** integrado — encuentra cualquier canción o vídeo sin salir de la app
- **Búsqueda en el catálogo de Spotify** — busca canciones por nombre y añádelas a tu biblioteca

### 💾 Descargar
- Descarga cualquier **canción individual** (de YouTube o local) a tu disco en MP3, M4A, OPUS o WEBM
- Descarga una **playlist entera** de una vez — retoma donde lo dejaste si cancelas
- **Carpeta de salida** y **formato** configurables por sesión
- Panel de **progreso de descarga** en tiempo real con estado por canción

### 📋 Biblioteca y Playlists
- Vista de **biblioteca** completa con búsqueda y orden
- **Playlists personalizadas** ilimitadas — nombre, portada y orden de canciones configurables
- Sistema de **favoritos** (botón de corazón en cualquier canción)
- Estante de **reproducidas recientemente** en la pantalla de inicio
- **Menú contextual** (clic derecho) en cualquier canción: editar información, añadir a playlist, reproducir siguiente, descargar, marcar favorito

### 🎛️ Efectos de audio — Panel Nightcore
Panel de efectos dedicado con cuatro presets y control manual completo:

| Control | Rango | Qué hace |
|---|---|---|
| **Velocidad** | 0.1× – 2.0× | Cambia la velocidad de reproducción sin afectar al tono |
| **Pitch** | −12 a +12 st | Sube o baja el tono de forma independiente a la velocidad |
| **Realce de agudos** | ajustable | Añade el brillo característico del nightcore |

Presets incluidos: **Nightcore**, **Slowed**, **Vaporwave**, **Speed Up**

### 🎚️ Ecualizador
- EQ paramétrico de 10 bandas
- Presets integrados: Plano, Bass Boost, Treble Boost, Vocal, Electrónica, Acústica…
- Guarda y nombra tus propios **presets personalizados** (se conservan entre sesiones)
- Activable/desactivable sin perder la configuración

### 📊 Visualizador
- Visualizador de audio a pantalla completa (barras, onda, círculo)
- Color, sensibilidad, sombra y estilo configurables
- Se abre con un clic, se cierra con el logo o el botón de atrás

### 🎤 Letras
- Obtención automática de **letras sincronizadas** (estilo karaoke, resaltado palabra a palabra)
- Fallback a letras no sincronizadas
- Modo **Romaji** para canciones en japonés
- Panel de letras redimensionable, fuente y tamaño configurables

### 🎨 Personalización
Cada aspecto visual es ajustable desde el panel de temas:
- **Tema de color** — 8 presets integrados (Dark, AMOLED, Midnight, Forest, Ocean, Rose, Light, Coffee) más selector de color completo para cada elemento de la interfaz
- **Color de acento** — selección rápida o hex personalizado
- **Familia de fuente** — elige entre las fuentes de la app o cualquier fuente instalada en tu sistema
- **Tamaño de fuente**, **radio de bordes**, **opacidad de bordes**
- **Separación entre paneles**, **altura del reproductor**, **opacidad del fondo de modales**
- Exporta e importa temas en JSON para compartirlos

### 🖥️ Integración con el sistema
- **Minimizar a la bandeja** y **cerrar a la bandeja** (configurable)
- Icono en la bandeja del sistema con menú contextual (Play/Pausa, Siguiente, Mostrar, Salir)
- Soporte para **imagen de fondo** en el reproductor
- Ventana sin marco con barra de título personalizada

---

## 🚀 Instalación

### Linux (Arch / CachyOS / Ubuntu / Fedora)

```bash
# 1. Descarga y extrae el zip
unzip nofufaudio.zip
cd nofufaudio

# 2. Ejecuta el instalador (no necesita sudo — instala en ~/.local)
chmod +x install.sh
bash install.sh
```

El instalador se encarga de:
- Comprobar Node.js, Python y pip
- Ejecutar `npm install` automáticamente
- Descargar el binario de `yt-dlp` más reciente para tu arquitectura
- Instalar `spotifyscraper` (necesario para importar playlists de Spotify)
- Crear el comando `nofufaudio` en `~/.local/bin`
- Registrar la app en el menú de aplicaciones del escritorio

Para desinstalar:
```bash
bash ~/.local/share/nofufaudio/install.sh --remove
```

### Windows

Ejecuta **NofufAudio Setup 1.0.0.exe** o lanza **NofufAudio.exe** desde la versión portable.

---

## 📦 Dependencias

| Dependencia | Necesaria para |
|---|---|
| **Node.js ≥ 18** | Ejecutar la app |
| **yt-dlp** | Streaming y descarga de YouTube (el instalador lo descarga automáticamente) |
| **Python 3** | Importar playlists de Spotify |
| **spotifyscraper** (pip) | Importar playlists de Spotify |
| **music-metadata** (npm) | Leer metadata de archivos de audio locales |

---

## 🛠️ Ejecutar desde el código fuente

```bash
git clone https://github.com/gosanlin/nofufaudio
cd nofufaudio
npm install
npm install music-metadata
pip install spotifyscraper
# Descarga yt-dlp y colócalo en la raíz del proyecto como ./yt-dlp (Linux) o yt-dlp.exe (Windows)
npx electron .
```

---

