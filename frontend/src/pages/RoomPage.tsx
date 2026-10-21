import { useRef, useState } from 'react'
import { Link } from 'react-router'

function RoomPage() {
  const room_name = 200
  const room_places = 30
  const x = 13
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Vide les messages (appelé à chaque fermeture de la pop-up, croix ou Échap)
  function resetDialog() {
    setMessage('')
    setError('')
    setLoading(false)
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        body: new URLSearchParams({ name: input.value }),
      })
      if (!res.ok) throw new Error('Erreur ' + res.status)
      const data = await res.json()
      setMessage(`${data.name} : ${data.rows} lignes × ${data.columns} colonnes, ${data.seats.length} places`)
    } catch (err) {
      console.error(err)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-10 px-20 py-10">
        <div onClick={() => dialogRef.current?.showModal()} className="flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
          <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {Array.from({ length: x }, (_, i) => ( // Création des divs
          <div onClick={() => console.log("Salle ", i, " selectionnée")} key={i} className="group flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <div>
              <p className="text-4xl text-center text-[#4D4D4D] select-none">{room_name+i}</p>
              <p className="text-l text-center text-[#4D4D4D] select-none">Places disponible : {room_places}</p>
              <div className="flex justify-between mt-20 invisible group-hover:visible">
                <img onClick={() => dialogRef.current?.showModal()} src="/pen.svg" alt="" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md"/>
                <Link to="/ClassDisposition"><img src="/file-earmark-text.svg" alt="" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md"/></Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <dialog ref={dialogRef} onClose={resetDialog} className="m-auto w-3/4 h-3/4 rounded-md bg-transparent backdrop:bg-black/50">
        <div className='w-full h-full bg-[#380404] text-white p-5 rounded-md'>
            <img onClick={() => dialogRef.current?.close()} src="/x-circle-fill.svg" alt="" className='ml-auto w-7 h-auto invert'/>
            <h2 className='text-center text-2xl'>Outil de création de salle</h2>
            <div className='flex gap-2 px-3 py-3'>
              <div className='flex-2 border-1 border-white-900 h-full w-full'>
                <form onSubmit={send} className="flex flex-col gap-4 p-6">
                  <label htmlFor="name" className="text-lg">Nom de la salle</label>
                  <input
                    type="text" id="name" name="name" required
                    className="rounded-md bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/60"
                  />
                  <button
                    type="submit" disabled={loading}
                    className="rounded-md bg-white text-[#380404] font-semibold py-2 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {loading ? 'Envoi…' : 'Envoyer'}
                  </button>

                  {message && (
                    <p className="rounded-md py-3 text-center text-xl">
                      {message}
                    </p>
                  )}
                  {error && (
                    <p className="">
                      {error}
                    </p>
                  )}
                </form>
              </div>
              <div className='flex-1 border-1 border-white-900 h-full w-full'>
                <p>Part 2</p>
              </div>
            </div>
        </div>
      </dialog>

    </div>
  )
}

export default RoomPage