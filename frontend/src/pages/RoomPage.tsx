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
        <div className='w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
          <form onSubmit={send}>
            <img onClick={() => dialogRef.current?.close()} src="/x-circle-fill.svg" alt="" className='ml-auto w-7 h-auto invert'/>
            <h2 className='text-center text-4xl'>Outil de création de salle</h2>
            <div className='flex gap-2 px-3 pt-10'>
              <div>
                <div className='flex-1 border-1 border-gray-300 rounded-md h-full w-full p-5'>
                  <h2 className='text-center text-2xl'>Caractéristiques de la classe</h2>
                  <div className='flex flex-col pt-15 gap-5'>
                    <div>
                      <label htmlFor="">Nom de la classe : </label>
                      <input type="text" name="" id="" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3' maxLength={30}/><br />
                    </div>
                    
                    <div>
                      <label htmlFor="">Nombre de colonnes : </label>
                      <input type="number" name="" id="" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15' max={100}/><br />
                    </div>

                    <div>
                      <label htmlFor="">Nombre de lignes : </label>
                      <input type="number" name="" id="" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15' max={100}/><br />
                    </div>
                    <p>Nombre de place total : <span className="mx-3">50</span></p>
                  </div>
                </div>
                <div className='flex justify-center gap-15 pt-10'>
                  <button className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1'>Aperçu</button>
                  <button type="submit" disabled={loading} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1'>{loading ? 'Envoi…' : 'Valider'}</button>
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

                </div>
              </div>
              <div className='flex-2 border-1 border-gray-300 rounded-md h-full w-full p-3'>
                <h2 className='text-center text-2xl'>Plan de classe</h2>
                <img src="" alt="" />
              </div>
            </div>
          </form>
        </div>
      </dialog>

    </div>
  )
}

export default RoomPage