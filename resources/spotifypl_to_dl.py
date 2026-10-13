from spotdl import Spotdl

def download_playlist(spotify_url):

    spotdl = Spotdl(client_id=None, client_secret=None)

    print(f"\nAnalizando la playlist: {spotify_url}...")
    try:

        songs = spotdl.search([spotify_url])
        print(f"Se encontraron {len(songs)} canciones. Iniciando descarga...\n")

        spotdl.download_songs(songs)

        print("\n¡Proceso terminado! Tus canciones se han guardado en esta carpeta.")

    except Exception as e:
        print(f"\nOcurrió un error durante el proceso: {e}")

if __name__ == "__main__":
    print("--- DESCARGADOR DE PLAYLISTS DE SPOTIFY ---")
    url = input("Pega la URL de la playlist de Spotify: ")

    if url.strip():
        download_playlist(url)
    else:
        print("No ingresaste ninguna URL válida.")