╔══════════════════════════════════════════════════════════════╗
║                     NOFUFAUDIO — INICIO                     ║
╚══════════════════════════════════════════════════════════════╝

 ¿Cómo arrancar NofufAudio?
 ──────────────────────────

 WINDOWS:
   1. Asegúrate de tener Node.js instalado → https://nodejs.org
   2. Doble clic en:  start.bat
      (la primera vez instalará dependencias automáticamente)

 LINUX (CachyOS, Arch, Ubuntu, Fedora...):
   1. Asegúrate de tener Node.js instalado
         Arch/CachyOS:  sudo pacman -S nodejs npm
         Ubuntu/Debian: sudo apt install nodejs npm
         Fedora:        sudo dnf install nodejs
   2. Abre una terminal en esta carpeta y ejecuta:
         chmod +x start.sh && ./start.sh
      (la primera vez descargará yt-dlp y las dependencias automáticamente)

 Nota sobre yt-dlp
 ─────────────────
 - Windows:  usa yt-dlp.exe (incluido)
 - Linux:    usa yt-dlp (binario ELF nativo)
   El script start.sh lo descarga automáticamente de GitHub
   si no existe. Solo necesita internet la primera vez.

 Si ya tienes yt-dlp instalado en el sistema Linux, también
 se usará como respaldo automáticamente.

 Compilar como ejecutable nativo (opcional)
 ──────────────────────────────────────────
   npm run build:win    → instalador .exe + portable (Windows)
   npm run build:linux  → AppImage + tar.gz (Linux)
   npm run build:all    → ambos a la vez

   Antes de compilar para Linux: pon el binario yt-dlp (sin .exe)
   en la raíz del proyecto. El script start.sh lo descarga por ti.

╔══════════════════════════════════════════════════════════════╗
║  ¿Problemas? Asegúrate de que Node.js >= 18 está instalado. ║
╚══════════════════════════════════════════════════════════════╝
