#!/bin/bash
# ═══════════════════════════════════════════════
# NofufAudio PWA - Setup Script (macOS/Linux)
# ═══════════════════════════════════════════════

clear

echo ""
echo "  ╔════════════════════════════════════════════╗"
echo "  ║    🎵 NofufAudio PWA - Setup                ║"
echo "  ╚════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado"
    echo "   Descargalo en: https://nodejs.org/"
    exit 1
else
    NODE_VER=$(node --version)
    echo "✅ Node.js $NODE_VER encontrado"
fi

echo ""
echo "[2/5] Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm no encontrado"
    exit 1
else
    NPM_VER=$(npm --version)
    echo "✅ npm $NPM_VER encontrado"
fi

echo ""
echo "[3/5] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
else
    echo "✅ Dependencias instaladas"
fi

echo ""
echo "[4/5] Verificando estructura..."
[ -f "package.json" ] && echo "✅ package.json encontrado" || echo "❌ package.json no encontrado"
[ -f "server.js" ] && echo "✅ server.js encontrado" || echo "❌ server.js no encontrado"
[ -f "manifest.json" ] && echo "✅ manifest.json encontrado" || echo "❌ manifest.json no encontrado"
[ -f "public/sw.js" ] && echo "✅ public/sw.js encontrado" || echo "❌ public/sw.js no encontrado"
[ -f "src/index.html" ] && echo "✅ src/index.html encontrado" || echo "❌ src/index.html no encontrado"
[ -f "src/app.js" ] && echo "✅ src/app.js encontrado" || echo "❌ src/app.js no encontrado"

echo ""
echo "[5/5] Creando variables de ambiente..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
EOF
    echo "✅ .env creado"
else
    echo "✅ .env ya existe"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ Setup Completado                       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo "  1. Terminal aquí"
echo "  2. Ejecuta: npm run dev"
echo "  3. Abre: http://localhost:3000"
echo ""
echo "Documentación:"
echo "  - README_PWA.md"
echo "  - QUICKSTART.md"
echo "  - PWA_README.md"
echo ""
