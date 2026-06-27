FROM node:20-bullseye

# 1. Instalar dependencias del sistema, incluyendo Python, pip y ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar librerías de Python requeridas (sin la bandera break-system-packages)
RUN pip3 install --no-cache-dir requests beautifulsoup4

# 3. Establecer el directorio de trabajo
WORKDIR /app

# 4. Copiar tu binario local al sistema del contenedor y darle permisos de ejecución
# Asegúrate de que el archivo 'yt-dlp_linux' esté en la misma carpeta que este Dockerfile
COPY yt-dlp_linux /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# 5. Copiar los archivos de configuración de Node.js e instalar dependencias
COPY package*.json ./
RUN npm install

# 6. Copiar el resto del código de la aplicación
COPY . .

# 7. Exponer el puerto (ajusta el 7860 si tu app usa otro puerto por defecto en HF)
EXPOSE 7860

# 8. Comando de inicio de la aplicación
CMD ["npm", "start"]