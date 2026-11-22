import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

interface Room {
  id: string
  name: string
  rows: number
  columns: number
  usableSeatCount: number
}

interface Promo {
  id: number
  name: string
}

interface StudentPromo {
  promo: Promo | null
}

function RoomPage() {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const dialogConfirm = useRef<HTMLDialogElement>(null)
  const dialogBuildClassPlan = useRef<HTMLDialogElement>(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [planX, setPlanX] = useState('')
  const [planY, setPlanY] = useState("")
  const [planName, setPlanName] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [placementName, setPlacementName] = useState('')
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [planError, setPlanError] = useState('')
  const [planConfirmation, setPlanConfirmation] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const totalPlaces = Number(planX) * Number(planY)
  const [rooms, setRooms] = useState<Room[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})
  const [selectedPromoId, setSelectedPromoId] = useState('')
  const [promosLoading, setPromosLoading] = useState(true)
  const [promosError, setPromosError] = useState('')
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const availableSeats = selectedRoom?.usableSeatCount ?? 0

  function openPlanDialog(room: Room) {
    setSelectedRoom(room)
    setSelectedPromoId('')
    setPlacementName('')
    setPlanError('')
    setPlanConfirmation('')
    dialogBuildClassPlan.current?.showModal()
  }

  async function createPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (creatingPlan || !selectedRoom || !selectedPromoId) return

    const promo = promos.find(item => item.id === Number(selectedPromoId))
    if (!promo) return

    const payload = {
      name: placementName.trim() || `${promo.name}-${selectedRoom.name}`,
      roomId: selectedRoom.id,
      promoId: promo.id,
    }

    setPlanError('')
    setCreatingPlan(true)
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || `Création du placement impossible (HTTP ${response.status}).`)
      }
      setPlanConfirmation(`Placement « ${payload.name} » créé.`)
      dialogBuildClassPlan.current?.close()
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Création du placement impossible.')
    } finally { 
      setCreatingPlan(false)
    }
  }

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

  async function deleteRoom() {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/rooms/${deletingId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchRooms()
      }
    } catch (err) {
      console.error('Erreur lors de la suppression : ', err)
    } finally {
      setDeletingId(null)
      dialogConfirm.current?.close()
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function fetchPromos() {
      try {
        const [res, studentsRes] = await Promise.all([
          fetch('/api/promos', { signal: controller.signal }),
          fetch('/api/students', { signal: controller.signal }),
        ])
        if (!res.ok) throw new Error(`Chargement des promotions impossible (HTTP ${res.status}).`)
        if (!studentsRes.ok) throw new Error(`Chargement des effectifs impossible (HTTP ${studentsRes.status}).`)
        const data: Promo[] = await res.json()
        const students: StudentPromo[] = await studentsRes.json()
        const counts: Record<number, number> = {}
        for (const promo of data) counts[promo.id] = 0
        for (const student of students) {
          if (student.promo) {
            const promoId = student.promo.id
            counts[promoId] = (counts[promoId] ?? 0) + 1
          }
        }
        setStudentCounts(counts)
        setPromos(data)
      } catch (err) {
        if (!controller.signal.aborted) {
          setPromosError(err instanceof Error ? err.message : 'Erreur de chargement des promotions.')
        }
      } finally {
        if (!controller.signal.aborted) setPromosLoading(false)
      }
    }
    void fetchPromos()
    return () => controller.abort()
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
    if (planName.trim() === "") {
      setError("Le nom de la salle est vide.")
      return
    } else if (Number(planX) <= 0) {
      setError("Le nombre de lignes n'est pas correct.")
      return
    } else if (Number(planY) <= 0) {
      setError("Le nombre de colonnes n'est pas correct.")
      return
    } else if (Number(planY) > 100) {
      setError("Le nombre de colonnes maximum est de 100.")
      return
    } else if (Number(planX) > 100) {
      setError("Le nombre de lignes maximum est de 100.")
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
        <h1 className='text-4xl text-center pt-5 text-[#4D4D4D]'>Gestionnaire des salles</h1>
        {planConfirmation && <p role="status" className="text-center">{planConfirmation}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 2xl:gap-10 px-4 sm:px-6 lg:px-10 2xl:px-20 py-10">
          <div onClick={openCreate} className="cursor-pointer flex items-center justify-center aspect-[4/3] min-w-0 overflow-hidden p-4 rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
          </div>
          {rooms.map((room) => (
            <div onClick={() => {console.log("Salle ", room.name, " selectionnée"); setSelectedRoom(room)}} key={room.id} className="cursor-pointer group flex items-center justify-center aspect-[4/3] min-w-0 overflow-hidden p-4 rounded-4xl bg-gray-200 hover:bg-gray-300">
              <div className="w-full min-w-0">
                <p title={room.name} className="text-2xl 2xl:text-4xl truncate text-center text-[#4D4D4D] select-none">{room.name}</p>
                <p className="text-sm 2xl:text-base truncate text-center text-[#4D4D4D] select-none">Places disponibles : {room.usableSeatCount}</p>
                <div className="flex justify-center mt-3 2xl:mt-6 gap-2 visible md:invisible md:group-hover:visible md:group-focus-within:visible">
                  <img onClick={(e) => { e.stopPropagation(); openEdit(room) }} src="/pen.svg" alt="Modifier" title="Modifier" className="w-12 h-12 2xl:w-15 2xl:h-15 shrink-0 object-contain bg-gray-400 p-2 2xl:p-3 rounded-md hover:bg-gray-500"/>
                  <img onClick={(e) => { e.stopPropagation(); openPlanDialog(room) }} src="/grid.svg" alt="Générer un placement" title="Générer un placement" className="w-12 h-12 2xl:w-15 2xl:h-15 shrink-0 object-contain bg-gray-400 p-2 2xl:p-3 rounded-md hover:bg-gray-500"/>
                  <img onClick={(e) => { e.stopPropagation(); setDeletingId(room.id); dialogConfirm.current?.showModal() }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-12 h-12 2xl:w-15 2xl:h-15 shrink-0 object-contain bg-gray-400 p-2 2xl:p-3 rounded-md hover:bg-gray-500'/>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Dialog creation de la salle */}
        <form onSubmit={sendRoom} className='flex h-full flex-col'>
          <dialog ref={dialogRef} onClose={resetDialog} className="m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
            <div className='flex flex-col w-full h-full bg-gray-500 text-white p-5 rounded-3xl border-2 border-gray-700'>
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
                        <input value={planName} onChange={(e) => setPlanName(e.target.value)} type="text" name="name" id="name" className='hover:bg-[#707F8C] border-1 border-gray-300 rounded-md mx-3 px-2' maxLength={30} placeholder='R50'/><br />
                      </div>

                      <div>
                        <label htmlFor="columns">Nombre de colonnes : </label>
                        <input value={planY} onChange={(e) => setPlanY(e.target.value)} type="number" name="columns" id="columns" className='hover:bg-[#707F8C] border-1 border-gray-300 rounded-md mx-3 w-15 px-2' max={100} placeholder='7' required/><br />
                      </div>

                      <div>
                        <label htmlFor="rows">Nombre de lignes : </label>
                        <input value={planX} onChange={(e) => setPlanX(e.target.value)} type="number" name="rows" id="rows" className='hover:bg-[#707F8C] border-1 border-gray-300 rounded-md mx-3 w-15 px-2' max={100} placeholder='5' required/><br />
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
                    <button onClick={handleContinue} type="button" disabled={loading} className='hover:bg-[#707F8C] border-1 border-gray-300 rounded-md px-10 py-1 w-75'>Continuer</button>
                  </div>
                </div>

                <div className='flex flex-2 flex-col min-w-0 min-h-0 border-1 border-gray-300 rounded-md pt-3'>
                  <h2 className='shrink-0 text-center text-2xl'>Aperçu du plan de classe <br /><span className='text-lg'>(les modifications se font à l'étape suivante)</span></h2>
                  <div className='flex-1 min-h-0 overflow-auto'>
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
            </div>
          </dialog>
          
          {/* Dialog confirm delete room */}
          <dialog ref={dialogConfirm} onClose={resetDialog} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
            <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
              <div className='flex justify-between'>
                <div>
                  <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cette salle ?</h1>
                  <h2>Cette action est définitive.</h2>
                  <div className='pt-5 flex gap-5'>
                    <button type="button" onClick={deleteRoom} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#707F8C]'>Supprimer</button>
                    <button type="button" onClick={() => dialogConfirm.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#707F8C]'>Annuler</button>
                  </div>
                </div>
                <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
              </div>
            </div>
          </dialog>
        </form>
        

        {/* Dialog creation du plan de classe */}
        <dialog ref={dialogBuildClassPlan} onCancel={event => { if (creatingPlan) event.preventDefault() }} className="m-auto w-[40%] rounded-md bg-transparent backdrop:bg-black/50">
          <div className='flex flex-col w-full h-full bg-gray-500 text-white p-5 rounded-3xl border-2 border-gray-700'>

            <div className='flex justify-between'>
                <h1 className='text-2xl'>Création d'un plan de classe en {selectedRoom?.name}</h1>
                <button type="button" disabled={creatingPlan} onClick={() => dialogBuildClassPlan.current?.close()} aria-label="Fermer"><img src="/x-circle-fill.svg" alt="" className='block w-7 h-auto invert'/></button>
            </div>
            
            <form onSubmit={createPlan} className="flex flex-col">
              <table className="w-full mt-15 border-separate border-spacing-y-3">
                <tbody>
                  <tr>
                    <th scope="row" className="text-left font-normal align-middle pr-4">
                      <label htmlFor="placement-name">Nom du placement de classe <span className='text-gray-400'>(optionnel)</span> :</label>
                    </th>
                    <td className="align-middle">
                      <input value={placementName} onChange={(e) => setPlacementName(e.target.value)} disabled={creatingPlan} type="text" name="placementName" id="placement-name" className='hover:bg-[#707F8C] border-1 border-gray-300 rounded-md w-full px-2' maxLength={30} placeholder='BUT2-R47'/>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-left font-normal align-middle pr-4">
                      <label htmlFor="placement-promo">Promotion à placer :</label>
                    </th>
                    <td className="align-middle">
                      <select id="placement-promo" name="promoId" required value={selectedPromoId} onChange={(event) => setSelectedPromoId(event.target.value)} disabled={creatingPlan || promosLoading || promos.length === 0} className="border border-gray-300 rounded-md w-full px-2 h-[25px]">
                        <option value="" disabled className='bg-[#791111]'>{promosLoading ? 'Chargement…' : promos.length === 0 ? 'Aucune promotion disponible' : 'Choisir une promotion'}</option>
                        {promos.map((promo) => <option key={promo.id} value={promo.id} className='bg-[#791111]' disabled={studentCounts[promo.id] > availableSeats || studentCounts[promo.id] === 0}>{promo.name} ({studentCounts[promo.id]} étudiants)</option>)}
                      </select>
                      {promosError && <p role="alert" className="text-red-200">{promosError}</p>}
                    </td>
                  </tr>
                </tbody>
              </table>
              {planError && <p role="alert" className="text-red-200">{planError}</p>}
              <button type="submit" disabled={creatingPlan || !selectedPromoId} className='border-2 border-gray-400 py-2 rounded-md hover:bg-[#707F8C] mt-5 disabled:opacity-50'>{creatingPlan ? 'Génération en cours…' : 'Générer le plan'}</button>
            </form>
          </div>
        </dialog>
      </div>
  )
}

export default RoomPage
