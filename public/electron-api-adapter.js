/* ===================================================
   NOFUFAUDIO - Universal API Adapter
   Funciona tanto en PWA como en Electron
   Incluye stubs para todas las APIs de preload.js
=================================================== */

(function() {
  'use strict';

  var isPWA = !window.require && !window.electronAPI;
  var platform = navigator.platform.indexOf('Win') !== -1 ? 'win32' :
                 navigator.platform.indexOf('Mac') !== -1 ? 'darwin' : 'linux';

  console.log('[API] Inicializando en modo:', isPWA ? 'PWA' : 'Electron', '| Platform:', platform);

  var universalAPI = {
    isPWA: isPWA,
    platform: platform,

    // WINDOW OPERATIONS
    minimize: function() {
      console.warn('[PWA] minimize() no soportado');
    },

    maximize: function() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function() {});
      }
    },

    close: function() {
      console.warn('[PWA] close() no soportado');
    },

    quit: function() {
      window.close();
    },

    show: function() {
      // No-op en PWA
    },

    reload: function() {
      window.location.reload();
    },

    // FILE & DIALOGS — en PWA devolvemos objetos especiales { name, _fileRef }
    // para que processFilePaths pueda crear blob URLs
    openFileDialog: function() {
      return new Promise(function(resolve) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = true;
        input.onchange = function(e) {
          var files = Array.from(e.target.files);
          resolve(files.map(function(f) {
            return { name: f.webkitRelativePath || f.name, _fileRef: f };
          }));
        };
        input.click();
      });
    },

    openFolderDialog: function() {
      return new Promise(function(resolve) {
        var input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.mozdirectory = true;
        input.onchange = function(e) {
          var files = Array.from(e.target.files);
          resolve(files.map(function(f) {
            return { name: f.webkitRelativePath || f.name, _fileRef: f };
          }));
        };
        input.click();
      });
    },

    openImageDialog: function() {
      return new Promise(function(resolve) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
          var file = e.target.files[0];
          if (!file) { resolve(null); return; }
          var reader = new FileReader();
          reader.onload = function(event) { resolve(event.target.result); };
          reader.readAsDataURL(file);
        };
        input.click();
      });
    },

    // FILE METADATA — lee ID3 tags desde el File object en PWA
    readFileMetadata: function(pathOrObj) {
      var file = (pathOrObj && pathOrObj._fileRef) ? pathOrObj._fileRef : null;
      if (!file) {
        return Promise.resolve({ title: pathOrObj && pathOrObj.name ? pathOrObj.name.replace(/\.[^.]+$/, '') : 'Archivo Local', artist: 'Desconocido', duration: 0, cover: null });
      }

      return new Promise(function(resolve) {
        var title = file.name.replace(/\.[^.]+$/, '');
        var artist = 'Desconocido';

        function finish(cover) {
          // Obtener duración via AudioContext
          var reader = new FileReader();
          reader.onload = function(e) {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            ctx.decodeAudioData(e.target.result, function(buffer) {
              ctx.close();
              resolve({ title: title, artist: artist, duration: buffer.duration, cover: cover });
            }, function() {
              ctx.close();
              resolve({ title: title, artist: artist, duration: 0, cover: cover });
            });
          };
          reader.onerror = function() {
            resolve({ title: title, artist: artist, duration: 0, cover: cover });
          };
          reader.readAsArrayBuffer(file);
        }

        // Leer tags ID3
        if (window.jsmediatags) {
          window.jsmediatags.read(file, {
            onSuccess: function(tag) {
              var tags = tag.tags || {};
              if (tags.title) title = tags.title;
              if (tags.artist) artist = tags.artist;
              var cover = null;
              if (tags.picture) {
                try {
                  var pic = tags.picture;
                  var blob = new Blob([new Uint8Array(pic.data)], { type: pic.format || 'image/jpeg' });
                  cover = { data: Array.from(new Uint8Array(pic.data)), mime: pic.format || 'image/jpeg' };
                } catch(e) { cover = null; }
              }
              finish(cover);
            },
            onError: function() { finish(null); }
          });
        } else {
          finish(null);
        }
      });
    },

    // SYSTEM FONTS — API returns { fonts: [...] }, we normalize to a plain array
    getSystemFonts: function() {
      return fetch('/api/system-fonts')
        .then(function(response) {
          if (response.ok) {
            return response.json().then(function(data) {
              if (Array.isArray(data)) return data;
              if (data && Array.isArray(data.fonts)) return data.fonts;
              return ['DM Sans', 'Arial', 'Courier New', 'Georgia', 'Verdana'];
            });
          }
          return ['DM Sans', 'Arial', 'Courier New', 'Georgia', 'Verdana'];
        })
        .catch(function(e) {
          console.warn('[System Fonts Error]', e);
          return ['DM Sans', 'Arial', 'Courier New', 'Georgia', 'Verdana', 'Times New Roman'];
        });
    },

    // CONFIG OPERATIONS
    configRead: function(name) {
      return fetch('/api/config/read/' + encodeURIComponent(name))
        .then(function(response) {
          if (response.ok) {
            return response.json().then(function(data) { return data.content; });
          }
          return null;
        })
        .catch(function(e) {
          console.error('[Config Read Error]', e);
          return null;
        });
    },

    configWrite: function(name, content) {
      return fetch('/api/config/write/' + encodeURIComponent(name), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      })
        .then(function(response) { return response.ok; })
        .catch(function(e) {
          console.error('[Config Write Error]', e);
          return false;
        });
    },

    configDir: function() {
      return fetch('/api/config/dir')
        .then(function(response) {
          if (response.ok) {
            return response.json().then(function(data) { return data.dir; });
          }
          return '';
        })
        .catch(function(e) {
          console.error('[Config Dir Error]', e);
          return '';
        });
    },

    // SPOTIFY
    searchSpotify: function(query) {
      console.warn('[PWA] searchSpotify() requiere backend implementado');
      return Promise.resolve({ type: 'success', results: [] });
    },

    importSpotifyPlaylist: function(id) {
      return fetch('/api/spotify/playlist/' + encodeURIComponent(id))
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[importSpotifyPlaylist]', e);
          return { type: 'error', message: e.message };
        });
    },

    resolveSpotifyToYouTube: function(title, artist) {
      return fetch('/api/yt/resolve-spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, artist: artist })
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[resolveSpotifyToYouTube]', e);
          return null;
        });
    },

    // YOUTUBE
    resolveYouTube: function(url) {
      return fetch('/api/yt/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[resolveYouTube]', e);
          return { type: 'error', message: e.message };
        });
    },

    resolveYouTubeForce: function(url) {
      return fetch('/api/yt/resolve-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[resolveYouTubeForce]', e);
          return { type: 'error', message: e.message };
        });
    },

    resolveYouTubePlaylist: function(url) {
      return fetch('/api/yt/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[resolveYouTubePlaylist]', e);
          return { type: 'success', items: [] };
        });
    },

    searchYouTube: function(query) {
      return fetch('/api/yt/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[searchYouTube]', e);
          return { type: 'success', results: [] };
        });
    },

    // LYRICS
    fetchLyricsMain: function(opts) {
      return fetch('/api/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts)
      })
        .then(function(r) { return r.json(); })
        .catch(function(e) {
          console.error('[fetchLyricsMain]', e);
          return { found: false };
        });
    },

    // IMAGE OPERATIONS
    fetchImageBase64: function(url) {
      if (!url) return Promise.resolve(null);
      return fetch(url)
        .then(function(response) {
          if (response.ok) {
            return response.blob().then(function(blob) {
              return { fallbackUrl: URL.createObjectURL(blob), mime: blob.type };
            });
          }
          return null;
        })
        .catch(function(e) {
          console.warn('[Image Fetch]', e);
          return null;
        });
    },

    fetchImageUrl: function(url) {
      if (!url) return Promise.resolve(null);
      return fetch(url)
        .then(function(response) {
          if (response.ok) {
            return response.blob().then(function(blob) {
              return URL.createObjectURL(blob);
            });
          }
          return null;
        })
        .catch(function(e) {
          console.warn('[Image Fetch]', e);
          return null;
        });
    },

    // DOWNLOAD OPERATIONS
    downloadYouTube: function(url, outputPath) {
      console.warn('[PWA] downloadYouTube() requiere backend implementado');
      return Promise.resolve({ type: 'error', message: 'YouTube download requiere backend implementado' });
    },

    downloadLocalFile: function(filePath) {
      console.warn('[PWA] downloadLocalFile() requiere backend implementado');
      return Promise.resolve({ type: 'error', message: 'Local download requiere backend implementado' });
    },

    stopDownload: function() {
      console.warn('[PWA] stopDownload() no soportado');
      return Promise.resolve(true);
    },

    // EVENT LISTENERS
    onDownloadProgress: function(callback) {
      return function() {};
    },

    onSaveBeforeHide: function(callback) {
      return function() {};
    },

    onMiniPlayerCmd: function(callback) {
      return function() {};
    },

    // WINDOW STATE
    minimizeToTray: function() {
      console.warn('[PWA] minimizeToTray() no soportado');
    },

    miniPlayerShow: function() {
      console.warn('[PWA] miniPlayerShow() no soportado');
    },

    miniPlayerToggle: function(show) {
      console.warn('[PWA] miniPlayerToggle() no soportado');
    },

    playerStateUpdate: function(state) {
      // No-op en PWA
    },

    thumbarSetEnabled: function(enabled) {
      // No-op en PWA
    },

    // UTILITIES
    download: function(url, filename) {
      try {
        var element = document.createElement('a');
        element.href = url;
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        return Promise.resolve(true);
      } catch (e) {
        console.error('[Download Error]', e);
        return Promise.resolve(false);
      }
    },

    notify: function(title, options) {
      options = options || {};
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, Object.assign({ icon: '/logonofufaudio.ico' }, options));
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') {
            new Notification(title, Object.assign({ icon: '/logonofufaudio.ico' }, options));
          }
        });
      }
    },

    pathToFileUrl: function(p) {
      if (platform === 'win32') return 'file:///' + p.replace(/\\/g, '/');
      return 'file://' + p;
    },

    getOS: function() {
      return platform;
    }
  };

  // Exponer globalmente como window.nofuf (compatible con app.js)
  if (!window.nofuf) {
    window.nofuf = universalAPI;
    console.log('[API] window.nofuf inicializado correctamente');
  }
})();
