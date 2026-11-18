import { useEffect, useState } from 'react'

interface ChannelVideo {
  id: string
  title: string
}

async function getLastFantaVid(signal: AbortSignal): Promise<ChannelVideo> {
  // Vite relaie cette URL vers la chaîne pour éviter le blocage CORS du navigateur.
  let response: Response | undefined
  // Le relais peut recevoir une erreur temporaire de YouTube : réessayer deux fois.
  for (let attempt = 0; attempt < 3; attempt++) {
    signal.throwIfAborted()
    response = await fetch('/youtube-channel-videos', { signal })
    if (![502, 503, 504].includes(response.status) || attempt === 2) break
    await response.body?.cancel()
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
  }
  if (!response?.ok) {
    throw new Error(`Le relais vers YouTube est indisponible (HTTP ${response?.status}). Réessayez dans quelques instants.`)
  }
  // Le flux Atom fournit les publications sans charger la page de consentement.
  const xml = await response.text()
  const feed = new DOMParser().parseFromString(xml, 'application/xml')
  if (feed.querySelector('parsererror')) throw new Error('Le flux YouTube reçu est invalide.')
  const entries = Array.from(feed.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry'))
  entries.sort((a, b) => {
    const date = (entry: Element) => Date.parse(entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'published')[0]?.textContent ?? '') || 0
    return date(b) - date(a)
  })
  const entry = entries[0]
  const id = entry?.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId')[0]?.textContent
  if (!id) throw new Error('Aucune vidéo trouvée dans le flux de la chaîne.')
  return {
    id,
    title: entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'title')[0]?.textContent || 'Dernière vidéo AlphaTeam',
  }
}

function ProfilePage() {
  const [video, setVideo] = useState<ChannelVideo | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getLastFantaVid(controller.signal)
      .then((result) => { if (!controller.signal.aborted) setVideo(result) })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Erreur de chargement de la vidéo.')
      })
    return () => controller.abort()
  }, [])

  return (
    <div>
      <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Profil</h1>
      {error && <p role="alert" className="text-center text-red-600">{error}</p>}
      {!video && !error && <p role="status" className="text-center">Chargement de la dernière vidéo…</p>}
      {video && (
        <iframe
          className="w-full aspect-video rounded-md"
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}

export default ProfilePage
