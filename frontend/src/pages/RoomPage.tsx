import { useRef, useState } from 'react'
import { Link } from 'react-router'

function RoomPage() {
  const room_name = 200
  const room_places = 30
  const x = 13
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Valeurs du formulaire de création de salle
  const [name, setName] = useState('')
  const [columns, setColumns] = useState(6)
  const [rows, setRows] = useState(5)

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
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        body: new URLSearchParams({ name, rows: String(rows), columns: String(columns) }),
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

  interface GenererCasesParams {
    rows: number;
    columns: number;
  }

  function genererTableauCases({ rows, columns }: GenererCasesParams): React.ReactNode[] {
    const cases: React.ReactNode[] = [];
    const total = rows * columns;

    // Remplissage du tableau avec la boucle for
    for (let i = 0; i < total; i++) {
      cases.push(
        <div 
          key={i} 
          className="aspect-square bg-gray-300 hover:bg-gray-400 transition-colors rounded-sm" 
        />
      );
    }

    return cases;
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
                      <label htmlFor="room-name">Nom de la classe : </label>
                      <input
                        type="text" id="room-name" value={name} required maxLength={30}
                        onChange={e => setName(e.target.value)}
                        className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3'
                      /><br />
                    </div>

                    <div>
                      <label htmlFor="room-columns">Nombre de colonnes : </label>
                      <input
                        type="number" id="room-columns" value={columns} min={1} max={100}
                        onChange={e => setColumns(Number(e.target.value))}
                        className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15'
                      /><br />
                    </div>

                    <div>
                      <label htmlFor="room-rows">Nombre de lignes : </label>
                      <input
                        type="number" id="room-rows" value={rows} min={1} max={100}
                        onChange={e => setRows(Number(e.target.value))}
                        className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15'
                      /><br />
                    </div>
                    <p>Nombre de place total : <span className="mx-3">{rows * columns}</span></p>
                  </div>
                </div>
                <div className='flex justify-center gap-15 pt-10'>
                  <button type="button" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1'>Aperçu</button>
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

                {/*  
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array.from({ length: rows * columns }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-300" />
                  ))}
                </div>*/}

                <div className="grid gap-1 p-2 bg-gray-100 rounded" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {genererTableauCases({ rows, columns })}
                  
                </div>
              </div>
            </div>
          </form>
        </div>
      </dialog>

    </div>
  )
}

export default RoomPage