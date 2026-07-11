#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  NofufAudio — Instalador (estilo AUR)
#  Instala el build ya compilado (linux-unpacked/tar.gz de electron-builder)
#  en ~/.local/share/nofufaudio  (sin sudo)
#  Uso:
#    bash install.sh            → instalar / actualizar
#    bash install.sh --remove   → desinstalar
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Rutas ────────────────────────────────────────────────────────────────
INSTALL_DIR="$HOME/.local/share/nofufaudio"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor"
LAUNCHER="$BIN_DIR/nofufaudio"
DESKTOP_FILE="$DESKTOP_DIR/nofufaudio.desktop"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_VERSION="1.2.2"

# ── Colores (idénticos a los de yay/paru) ────────────────────────────────
BOLD=$'\e[1m'; DIM=$'\e[2m'; RESET=$'\e[0m'
CYAN=$'\e[36m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'
RED=$'\e[31m'; BLUE=$'\e[34m'; MAGENTA=$'\e[35m'
WHITE=$'\e[97m'

h1()      { echo -e "${BOLD}${BLUE}::${RESET}${BOLD} $*${RESET}"; }
h2()      { echo -e "${BOLD}${GREEN}::${RESET}${BOLD} $*${RESET}"; }
ok()      { echo -e " ${GREEN}✓${RESET}  $*"; }
warn()    { echo -e " ${YELLOW}!${RESET}  $*"; }
err()     { echo -e " ${RED}✗${RESET}  $*"; }
step()    { echo -e "  ${CYAN}→${RESET}  $*"; }
arrow()   { echo -e "${BOLD}${BLUE}==>${RESET}${BOLD} $*${RESET}"; }

# ── Cabecera ─────────────────────────────────────────────────────────────
echo
echo -e "${BOLD}${MAGENTA}  ███╗   ██╗ ██████╗ ███████╗██╗   ██╗███████╗${RESET}"
echo -e "${BOLD}${MAGENTA}  ████╗  ██║██╔═══██╗██╔════╝██║   ██║██╔════╝${RESET}"
echo -e "${BOLD}${MAGENTA}  ██╔██╗ ██║██║   ██║█████╗  ██║   ██║█████╗  ${RESET}"
echo -e "${BOLD}${MAGENTA}  ██║╚██╗██║██║   ██║██╔══╝  ██║   ██║██╔══╝  ${RESET}"
echo -e "${BOLD}${MAGENTA}  ██║ ╚████║╚██████╔╝██║     ╚██████╔╝██║     ${RESET}"
echo -e "${BOLD}${MAGENTA}  ╚═╝  ╚═══╝ ╚═════╝ ╚═╝      ╚═════╝ ╚═╝     ${RESET}"
echo -e "  ${DIM}Audio player — v${PKG_VERSION}${RESET}"
echo

# ═════════════════════════════════════════════════════════════════════════
#  DESINSTALAR
# ═════════════════════════════════════════════════════════════════════════
if [[ "${1:-}" == "--remove" ]]; then
  h1 "Desinstalando nofufaudio..."
  echo
  echo -e " ${BOLD}Los siguientes archivos serán eliminados:${RESET}"
  echo -e "   ${DIM}$INSTALL_DIR${RESET}"
  echo -e "   ${DIM}$LAUNCHER${RESET}"
  echo -e "   ${DIM}$DESKTOP_FILE${RESET}"
  echo -e "   ${DIM}$ICON_DIR/1024x1024/apps/nofufaudio.png${RESET}"
  echo
  read -r -p "$(echo -e "${BOLD}${BLUE}::${RESET}${BOLD} ¿Continuar con la desinstalación? [s/N] ${RESET}")" CONFIRM
  [[ "${CONFIRM,,}" =~ ^(s|si|y|yes)$ ]] || { echo -e "\n Cancelado."; exit 0; }
  echo
  rm -rf  "$INSTALL_DIR"                                       && ok "Directorio de instalación eliminado"
  rm -f   "$LAUNCHER"                                          && ok "Lanzador eliminado"
  rm -f   "$DESKTOP_FILE"                                      && ok "Entrada .desktop eliminada"
  rm -f   "$ICON_DIR/1024x1024/apps/nofufaudio.png"
  rm -f   "$ICON_DIR/22x22/apps/nofufaudio.png"
  command -v update-desktop-database &>/dev/null && update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
  command -v gtk-update-icon-cache &>/dev/null   && gtk-update-icon-cache -f "$ICON_DIR" 2>/dev/null   || true
  echo
  ok "Nofufaudio desinstalado correctamente."
  exit 0
fi

# ═════════════════════════════════════════════════════════════════════════
#  COMPROBAR DEPENDENCIAS
#  Nota: este build ya trae Electron + Chromium empaquetados dentro del
#  binario "nofufaudio" — NO se necesita Node.js/npm para ejecutarlo.
#  Solo hacen falta: Python (importación de Spotify) y curl/wget (yt-dlp).
# ═════════════════════════════════════════════════════════════════════════
h1 "Comprobando dependencias del sistema..."
echo
MISSING_DEPS=()

# Python 3
PYTHON_BIN=""
for py in python3 python; do
  if command -v "$py" &>/dev/null && "$py" -c "import sys; sys.exit(0 if sys.version_info >= (3,7) else 1)" 2>/dev/null; then
    PYTHON_BIN="$py"
    ok "python ($("$py" --version))"
    break
  fi
done
[[ -z "$PYTHON_BIN" ]] && { err "python3 no encontrado"; MISSING_DEPS+=("python"); }

# pip
PIP_BIN=""
for pip in pip3 pip; do
  command -v "$pip" &>/dev/null && { PIP_BIN="$pip"; ok "pip ($("$pip" --version | cut -d' ' -f1-2))"; break; }
done
[[ -z "$PIP_BIN" ]] && warn "pip no encontrado — la importación de playlists de Spotify no estará disponible"

# curl o wget (para descargar yt-dlp)
if command -v curl &>/dev/null; then
  ok "curl $(curl --version | head -1 | awk '{print $2}')"
elif command -v wget &>/dev/null; then
  ok "wget $(wget --version 2>&1 | head -1 | awk '{print $3}')"
else
  err "curl/wget no encontrado"
  MISSING_DEPS+=("curl")
fi

# ── Abortar si faltan deps críticas ──────────────────────────────────────
if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
  echo
  err "Faltan dependencias: ${MISSING_DEPS[*]}"
  echo
  echo -e "  Instálalas con:"
  echo -e "  ${BOLD}sudo pacman -S python python-pip curl${RESET}   ${DIM}(Arch/CachyOS)${RESET}"
  echo -e "  ${BOLD}sudo apt install python3 python3-pip curl${RESET}  ${DIM}(Debian/Ubuntu)${RESET}"
  exit 1
fi

# ═════════════════════════════════════════════════════════════════════════
#  RESUMEN + CONFIRMACIÓN (estilo yay/paru)
# ═════════════════════════════════════════════════════════════════════════
SRC_SIZE=$(du -sh "$SRC_DIR" 2>/dev/null | cut -f1)

echo
h1 "Resumen de instalación"
echo
printf "  ${BOLD}%-26s${RESET} %s\n" "Paquete:"      "nofufaudio-${PKG_VERSION}"
printf "  ${BOLD}%-26s${RESET} %s\n" "Destino:"      "$INSTALL_DIR"
printf "  ${BOLD}%-26s${RESET} %s\n" "Lanzador:"     "$LAUNCHER"
printf "  ${BOLD}%-26s${RESET} %s\n" "Entrada .desktop:" "$DESKTOP_FILE"
printf "  ${BOLD}%-26s${RESET} %s\n" "Tamaño fuente:" "$SRC_SIZE"
echo

if [[ -d "$INSTALL_DIR" ]]; then
  warn "Ya existe una instalación en $INSTALL_DIR — será reemplazada."
  echo
fi

read -r -p "$(echo -e "${BOLD}${BLUE}::${RESET}${BOLD} ¿Proceder con la instalación? [S/n] ${RESET}")" CONFIRM
[[ "${CONFIRM,,}" =~ ^(n|no)$ ]] && { echo -e "\n Cancelado."; exit 0; }
echo

# ═════════════════════════════════════════════════════════════════════════
#  INSTALACIÓN
# ═════════════════════════════════════════════════════════════════════════
arrow "Instalando nofufaudio..."
echo

# ── Crear directorios ─────────────────────────────────────────────────────
step "Creando directorios..."
mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$DESKTOP_DIR" \
         "$ICON_DIR/1024x1024/apps" \
         "$ICON_DIR/22x22/apps"

# ── Copiar el build ya compilado ──────────────────────────────────────────
step "Copiando archivos del programa..."
rsync -a --delete --exclude='install.sh' "$SRC_DIR/" "$INSTALL_DIR/" 2>/dev/null \
|| cp -r "$SRC_DIR/." "$INSTALL_DIR/"
rm -f "$INSTALL_DIR/install.sh"

# El binario principal y los helpers de sandbox de Chromium necesitan
# permiso de ejecución (rsync/cp a veces no lo preserva desde un .zip).
chmod +x "$INSTALL_DIR/nofufaudio" 2>/dev/null || true
chmod +x "$INSTALL_DIR/chrome-sandbox" 2>/dev/null || true
chmod +x "$INSTALL_DIR/chrome_crashpad_handler" 2>/dev/null || true
ok "Archivos copiados → $INSTALL_DIR"

# ── yt-dlp ────────────────────────────────────────────────────────────────
# Se coloca en resources/, que es exactamente donde main.js lo busca primero
# (process.resourcesPath) — si se deja en la raíz, la app no lo encuentra
# y depende de que exista un yt-dlp en el PATH del sistema.
YTDLP_BIN="$INSTALL_DIR/resources/yt-dlp"
mkdir -p "$INSTALL_DIR/resources"
if [[ ! -f "$YTDLP_BIN" ]]; then
  step "Descargando yt-dlp..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)        YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux" ;;
    aarch64|arm64) YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_aarch64" ;;
    armv7l)        YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_armv7l" ;;
    *)             YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux" ;;
  esac
  if command -v curl &>/dev/null; then
    curl -L --silent --show-error --progress-bar "$YTDLP_URL" -o "$YTDLP_BIN"
  else
    wget -q --show-progress "$YTDLP_URL" -O "$YTDLP_BIN"
  fi
  chmod +x "$YTDLP_BIN"
  ok "yt-dlp descargado ($("$YTDLP_BIN" --version 2>/dev/null || echo 'ok'))"
else
  chmod +x "$YTDLP_BIN"
  ok "yt-dlp ya presente ($("$YTDLP_BIN" --version 2>/dev/null || echo 'ok'))"
fi

# ── spotifyscraper ────────────────────────────────────────────────────────
if [[ -n "$PIP_BIN" ]]; then
  step "Instalando spotifyscraper..."
  "$PIP_BIN" install --quiet --break-system-packages spotifyscraper 2>/dev/null \
    || "$PIP_BIN" install --quiet spotifyscraper 2>/dev/null \
    && ok "spotifyscraper instalado" \
    || warn "spotifyscraper no se pudo instalar (importación de Spotify no disponible)"
fi

# ── Iconos ────────────────────────────────────────────────────────────────
# Ojo: en este build los iconos viven bajo resources/app/build/icons/,
# no en build/icons/ como en una copia de código fuente.
step "Registrando iconos..."
[[ -f "$INSTALL_DIR/resources/app/build/icons/logonofufaudio.png" ]] && \
  cp "$INSTALL_DIR/resources/app/build/icons/logonofufaudio.png" "$ICON_DIR/1024x1024/apps/nofufaudio.png"
[[ -f "$INSTALL_DIR/resources/app/build/icons/traynofufaudio.png" ]] && \
  cp "$INSTALL_DIR/resources/app/build/icons/traynofufaudio.png" "$ICON_DIR/22x22/apps/nofufaudio.png"
command -v gtk-update-icon-cache &>/dev/null && \
  gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true
ok "Iconos registrados en $ICON_DIR"

# ── Script lanzador en ~/.local/bin ───────────────────────────────────────
# --no-sandbox: el binario chrome-sandbox necesita SUID root para el
# sandbox de Chromium; un instalador sin sudo no puede otorgar ese
# permiso, así que se desactiva el sandbox (práctica estándar para
# builds portables de Electron instalados sin privilegios).
step "Creando lanzador en $LAUNCHER..."
cat > "$LAUNCHER" << LAUNCHER_SCRIPT
#!/usr/bin/env bash
# Lanzador de NofufAudio — generado por install.sh
exec "$INSTALL_DIR/nofufaudio" --no-sandbox "\$@"
LAUNCHER_SCRIPT
chmod +x "$LAUNCHER"
ok "Lanzador creado: $LAUNCHER"

# ── Asegurarse de que ~/.local/bin está en PATH ───────────────────────────
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  warn "$BIN_DIR no está en tu PATH."
  SHELL_RC=""
  [[ -f "$HOME/.bashrc" ]]  && SHELL_RC="$HOME/.bashrc"
  [[ -f "$HOME/.zshrc" ]]   && SHELL_RC="$HOME/.zshrc"
  [[ -f "$HOME/.config/fish/config.fish" ]] && SHELL_RC="$HOME/.config/fish/config.fish"
  if [[ -n "$SHELL_RC" ]]; then
    step "Añadiendo $BIN_DIR al PATH en $SHELL_RC..."
    echo -e '\n# NofufAudio\nexport PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    ok "PATH actualizado. Recarga el shell: source $SHELL_RC"
  else
    warn "Añade manualmente a tu shell: export PATH=\"\$HOME/.local/bin:\$PATH\""
  fi
fi

# ── Entrada .desktop ──────────────────────────────────────────────────────
step "Creando entrada en el menú de aplicaciones..."
cat > "$DESKTOP_FILE" << DESKTOP
[Desktop Entry]
Type=Application
Name=NofufAudio
GenericName=Reproductor de música
Comment=Tu reproductor híbrido de audio
Exec=$LAUNCHER %u
Icon=nofufaudio
Terminal=false
Categories=Audio;Music;Player;
MimeType=audio/mpeg;audio/flac;audio/ogg;audio/wav;audio/x-m4a;audio/opus;
Keywords=música;music;youtube;spotify;audio;
StartupWMClass=nofufaudio
X-GNOME-UsesNotifications=false
DESKTOP
command -v update-desktop-database &>/dev/null && \
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
ok ".desktop creado → $DESKTOP_FILE"

# ═════════════════════════════════════════════════════════════════════════
#  FIN
# ═════════════════════════════════════════════════════════════════════════
echo
echo -e "${BOLD}${GREEN}  (✓) nofufaudio-${PKG_VERSION} instalado correctamente.${RESET}"
echo
echo -e "  Para lanzar la app:"
echo -e "    ${BOLD}nofufaudio${RESET}           ${DIM}# desde la terminal${RESET}"
echo -e "    ${BOLD}[menú de apps]${RESET}        ${DIM}# busca 'NofufAudio'${RESET}"
echo
echo -e "  Para desinstalar:"
echo -e "    ${BOLD}bash $INSTALL_DIR/install.sh --remove${RESET}"
echo -e "    ${DIM}(o guarda una copia de este install.sh para desinstalar más tarde)${RESET}"
echo
