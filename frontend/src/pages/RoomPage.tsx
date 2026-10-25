import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

interface Room {
  id: string
  name: string
  rows: number
  columns: number
  usableSeatCount: number
}

function RoomPage() {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [planX, setPlanX] = useState('')
  const [planY, setPlanY] = useState("")
  const [planName, setPlanName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const totalPlaces = Number(planX) * Number(planY)
  const [rooms, setRooms] = useState<Room[]>([])

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms")
      if (res.ok) {
        const data: Room[] = await res.json()
        setRooms(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des salles : ', err)
    }
  }

  async function sendRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const isEdit = editingId !== null

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch(isEdit ? `/api/rooms/${editingId}` : '/api/rooms', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: planName,
          columns: Number(planY),
          rows: Number(planX),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erreur ' + res.status)
      }
      const saved: Room = await res.json()
      await fetchRooms()

      setMessage(
          isEdit
              ? `Salle ${saved.name} modifiée : ${saved.usableSeatCount} places disponibles`
              : `Création de la salle ${saved.name} avec ${saved.usableSeatCount} places`
      )
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function deleteRoom(id: string) {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchRooms()
      }
    } catch (err) {
      console.error('Erreur lors de la suppression : ', err)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  function openCreate() {
    setEditingId(null)
    setPlanName('')
    setPlanX('')
    setPlanY('')
    resetDialog()
    dialogRef.current?.showModal()
  }

  function openEdit(room: Room) {
    setEditingId(room.id)
    setPlanName(room.name)
    setPlanX(String(room.rows))
    setPlanY(String(room.columns))
    resetDialog()
    dialogRef.current?.showModal()
  }

  function resetDialog() {
    setMessage('')
    setError('')
    setLoading(false)
  }

  function handleContinue() {
    if (planName.trim() === "" || Number(planX) <= 0 || Number(planY) <= 0) {
      setError("Le formulaire n'est pas correctement rempli")
      return
    }
    dialogRef.current?.close()
    navigate('/ClassDisposition', {
      state: {
        id: editingId ?? undefined,
        name: planName.trim(),
        rows: Number(planX),
        columns: Number(planY),
      },
    })
  }

  return (
      <div>
        <div className="grid grid-cols-5 gap-10 px-20 py-10">
          <div onClick={openCreate} className="cursor-pointer flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
          </div>
          {rooms.map((room) => (
              <div onClick={() => console.log("Salle ", room.name, " selectionnée")} key={room.id} className="cursor-pointer group flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
                <div>
                  <p className="text-4xl text-center text-[#4D4D4D] select-none">{room.name}</p>
                  <p className="text-l text-center text-[#4D4D4D] select-none">Places disponibles : {room.usableSeatCount}</p>
                  <div className="flex justify-between mt-20 invisible group-hover:visible gap-2">
                    <img onClick={(e) => { e.stopPropagation(); openEdit(room) }} src="/pen.svg" alt="" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400"/>
                    <Link to="/ClassDisposition" state={room}><img src="/file-earmark-text.svg" alt="" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400"/></Link>
                    <img onClick={(e) => { e.stopPropagation(); deleteRoom(room.id) }} src="/trash.svg" alt="" className='w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400'/>
                  </div>
                </div>
              </div>
          ))}
        </div>

        <form onSubmit={sendRoom} className='flex h-full flex-col'>
          <dialog ref={dialogRef} onClose={resetDialog} className="m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
            <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
              <div className='grid grid-cols-3 items-center'>
                <div></div>
                <h2 className='justify-self-center text-center text-4xl whitespace-nowrap'>{editingId ? 'Modification de la salle' : 'Outil de création de salle'}</h2>
                <img onClick={() => dialogRef.current?.close()} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto invert cursor-pointer'/>
              </div>

              <div className='flex flex-1 min-h-0 gap-2 px-3 pt-10 w-full'>
                <div className='flex flex-col'>
                  <div className='flex-1 border-1 border-gray-300 rounded-md p-5'>
                    <h2 className='text-center text-2xl'>Caractéristiques de la classe</h2>
                    <div className='flex flex-col pt-15 gap-5'>
                      <div>
                        <label htmlFor="name">Nom de la classe : </label>
                        <input value={planName} onChange={(e) => setPlanName(e.target.value)} type="text" name="name" id="name" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 px-2' maxLength={30} placeholder='R50'/><br />
                      </div>

                      <div>
                        <label htmlFor="columns">Nombre de colonnes : </label>
                        <input value={planY} onChange={(e) => setPlanY(e.target.value)} type="number" name="columns" id="columns" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15 px-2' max={100} placeholder='7' required/><br />
                      </div>

                      <div>
                        <label htmlFor="rows">Nombre de lignes : </label>
                        <input value={planX} onChange={(e) => setPlanX(e.target.value)} type="number" name="rows" id="rows" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md mx-3 w-15 px-2' max={100} placeholder='5' required/><br />
                      </div>

                      <p>Nombre de place total :
                        <span className="mx-3">{totalPlaces}</span>
                      </p>

                      {error && (
                        <p className="text-red-300 font-bold">{error}</p>
                      )}
                    </div>
                  </div>
                  <div className='flex justify-center gap-15 pt-10'>
                    <button onClick={handleContinue} type="button" disabled={loading} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1 w-75'>Continuer</button>
                  </div>
                </div>

                <div className='flex-2 border-1 border-gray-300 rounded-md pt-3 overflow-auto'>
                  <h2 className='text-center text-2xl'>Apperçu du plan de classe <br /><span className='text-lg'>(les modifications se font à l'étape suivante)</span></h2>
                  <div className='flex flex-col gap-2 p-10 w-max mx-auto'>
                    {Array.from({ length: Math.max(0, Number(planX)) }, (_, column) => (
                        <div key={column} className='flex gap-2'>
                          {Array.from({ length: Math.max(0, Number(planY)) }, (_, row) => (
                              <div key={row} className="shrink-0 w-10 h-10 group flex items-center justify-center rounded-md bg-gray-200"></div>
                          ))}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        </form>
      </div>
  )
}

export default RoomPage