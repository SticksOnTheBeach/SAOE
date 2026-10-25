import { useLocation } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

interface SeatData {
  row: number
  column: number
  type: 'AVAILABLE' | 'FORBIDDEN' | 'POWER_OUTLET'
}

interface RoomState {
  id?: string
  name: string
  rows: number
  columns: number
  seats?: SeatData[]
}

type CellStatus = 'disponible' | 'interdite' | 'prise' | 'couloir'
const STATUS_COLORS: Record<CellStatus, string> = {
  disponible: 'bg-[#AAD690]',
  interdite: 'bg-[#A84747]',
  prise: 'bg-[#EDEB87]',
  couloir: 'bg-[#FCFCFC] border-2 border-[#F0F0F0]',
}

function ClassDispositionPage() {
  const navigate = useNavigate()
  const dialogRefHelp = useRef<HTMLDialogElement>(null)
  const dialogChoicePlacementSingle = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  const data = location.state as RoomState | null
  const [isMultiple, setIsMultiple] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [selectedCell, setSelectedCell] = useState<{ row: number; column: number } | null>(null)

  const [cellStatuses, setCellStatuses] = useState<Record<string, CellStatus>>({})

  // Si on ouvre une salle existante (qui a un id), on récupère son plan existant depuis le backend
  useEffect(() => {
    if (!data?.id) return
    fetch(`/api/rooms/${data.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((room: RoomState | null) => {
        if (!room?.seats) return
        const initialStatuses: Record<string, CellStatus> = {}
        const seatMap = new Map<string, SeatData['type']>()
        for (const s of room.seats) {
          seatMap.set(`${s.row}-${s.column}`, s.type)
        }
        for (let r = 0; r < Number(data.rows); r++) {
          for (let c = 0; c < Number(data.columns); c++) {
            const key = `${r}-${c}`
            const seatType = seatMap.get(key)
            if (!seatType) {
              // Si la case était dans l'ancienne grille mais absente de seats => c'était un couloir
              if (r < room.rows && c < room.columns) {
                initialStatuses[key] = 'couloir'
              } else {
                initialStatuses[key] = 'disponible'
              }
            } else if (seatType === 'FORBIDDEN') {
              initialStatuses[key] = 'interdite'
            } else if (seatType === 'POWER_OUTLET') {
              initialStatuses[key] = 'prise'
            } else {
              initialStatuses[key] = 'disponible'
            }
          }
        }
        setCellStatuses(initialStatuses)
      })
      .catch((err) => console.error('Erreur chargement salle :', err))
  }, [data?.id, data?.rows, data?.columns])
  
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMultiple(e.target.checked)
  }

  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>, row: number, column: number) => {
    if (!isMultiple) {
      setSelectedCell({ row, column })
      setMenuPos({ x: e.clientX, y: e.clientY })
      dialogChoicePlacementSingle.current?.showModal()
    } else {
      setSelectedCell({ row, column })
    }
  }

  const handleSelectStatus = (status: CellStatus) => {
    if (selectedCell) {
      const key = `${selectedCell.row}-${selectedCell.column}`
      setCellStatuses((prev) => ({
        ...prev,
        [key]: status,
      }))
    }
    dialogChoicePlacementSingle.current?.close()
  }

  async function saveRoom() {
    if (!data) return
    setError('')
    setLoading(true)

    const seats: SeatData[] = []

    // On parcourt toutes les cases de la grille (lignes × colonnes)
    for (let r = 0; r < Number(data.rows); r++) {
      for (let c = 0; c < Number(data.columns); c++) {
        // Par défaut, une case non modifiée est 'disponible'
        const status = cellStatuses[`${r}-${c}`] ?? 'disponible'

        // Un couloir n'est pas envoyé dans "seats" (c'est un trou dans la grille pour le backend)
        if (status === 'couloir') continue

        const type: SeatData['type'] =
          status === 'interdite'
            ? 'FORBIDDEN'
            : status === 'prise'
              ? 'POWER_OUTLET'
              : 'AVAILABLE'

        seats.push({ row: r, column: c, type })
      }
    }

    const isEdit = Boolean(data.id)
    try {
      const res = await fetch(isEdit ? `/api/rooms/${data.id}` : '/api/rooms', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          rows: Number(data.rows),
          columns: Number(data.columns),
          seats,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erreur ' + res.status)
      }

      navigate('/Room')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }


  if (!data) {
    return (
      <div className="p-5">
        <h2>Aucune salle sélectionnée</h2>
      </div>
    )
  }

  return (
    <div className='p-5'>
      <div className='flex justify-between'>
        <div>
          <div className='flex gap-4'><h1 className='text-4xl'>Configuration des placements</h1><img onClick={() => dialogRefHelp.current?.showModal()} src="/question-circle.svg" alt="" className='w-5 h-auto'/></div>
          <h2>Salle {data.name}</h2>
        </div>
        <div>
          <h2 className='text-center text-xl pb-2'>Type de sélection</h2>
          <div className='flex gap-5 p-2 rounded-md'>
            <h3 className={`pt-1 text-l ${isMultiple ? 'font-normal' : 'font-bold'}`}>Simple</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={isMultiple} onChange={handleSwitch} type="checkbox" className="sr-only peer" />
              <div className="group peer bg-white rounded-full duration-300 w-16 h-8 ring-2 after:duration-300 after:bg-gray-400 peer-checked:after:bg-gray-400 after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-8 peer-hover:after:scale-95"></div>
            </label>
            <h3 className={`pt-1 text-l ${isMultiple ? 'font-bold' : 'font-normal'}`} id='multiple'>Multiple</h3>
          </div>
        </div>
        <div className='flex gap-5'>
          <div className='flex gap-1'>
            <div className='w-5 h-5 bg-[#AAD690] rounded-md'></div>
            <p>Place disponible</p>
          </div>
          <div className='flex gap-1'>
            <div className='w-5 h-5 bg-[#A84747] rounded-md'></div>
            <p>Place interdite</p>
          </div>
          <div className='flex gap-1'>
            <div className='w-5 h-5 bg-[#EDEB87] rounded-md'></div>
            <p>Place avec une prise</p>
          </div>
          <div className='flex gap-1'>
            <div className='w-5 h-5 bg-[#FCFCFC] border-2 border-[#F0F0F0] rounded-md'></div>
            <p>Couloir</p>
          </div>
        </div>
      </div>
      <div className='flex gap-2 px-20 pt-5'>
        <div className='w-8'></div>
        {Array.from({ length: Number(data.columns)}, (_,column) => (
          <p key={column} className='flex-1 flex items-center justify-center'>{column+1}</p>
        ))}
      </div>
      <div className='flex flex-col gap-2 px-20 pb-10'>
        {Array.from({ length: Number(data.rows) }, (_, row) => (
          <div key={row} className='flex gap-2'>
            <p className='w-8 flex items-center justify-center'>{row+1}</p>
            {Array.from({ length: Number(data.columns) }, (_, column) => {
              // On récupère le statut de la case "row-column" (ou gris par défaut si pas encore modifiée)
              const status = cellStatuses[`${row}-${column}`]
              const colorClass = status ? STATUS_COLORS[status] : 'bg-gray-200'

              return (
                <div
                  key={column}
                  onClick={(e) => handleCellClick(e, row, column)}
                  className={`cursor-pointer flex-1 flex items-center justify-center aspect-square rounded-md ${colorClass}`}
                ></div>
              )
            })}
          </div>
        ))}
      </div>
      {error && (
        <p className="text-center text-red-600 font-bold pb-3">{error}</p>
      )}
      <div className='flex justify-center'>
        <button
          onClick={saveRoom}
          disabled={loading}
          className='cursor-pointer text-center text-white border-2 border-gray-900 px-10 py-2 rounded-md bg-[#B51621] hover:bg-[#D43B46] hover:border-gray-700'
        >
          {loading ? 'Sauvegarde en cours…' : `Sauvegarder la salle ${data.name}`}
        </button>
      </div>

      <dialog ref={dialogRefHelp} className="m-auto w-3/4 h-fit rounded-md bg-transparent backdrop:bg-black/50">
        <div className='bg-gray-200 p-5'>
          <div className='flex justify-between'>
            <h1 className='text-3xl text-center pb-5'>Comment utiliser ce configurateur ?</h1>
            <img onClick={() => dialogRefHelp.current?.close()} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto cursor-pointer'/>
          </div>
          <h2 className='pt-5 font-bold text-xl pb-2'>Status des emplacements</h2>
          <p>Chaquns de ces carrés représente un emplacement. Il peut être : 
            <br /> - Une place disponible : Une place qui sera attribuée à un élève sans condition particulière
            <br /> - Une place avec une prise disponible : Une place qui sera attribuée à un élève qui à besoin d'avoir accès à un ordinateur
            <br /> - Une place interdite : Une place qui sera pas attribuée pour x raisons
            <br /> - Un couloir : Une place qui ne peux donc pas être attribuée à un éleve
            <br /><span className='font-bold'>En cliquant sur une case, vous pourrez changer le status d'un emplacement avec les choix ci-dessus.</span>
          </p>
          <h2 className='pt-10 font-bold text-xl pb-2'>Mode de sélection</h2>
          <p>2 modes de sélection sont possibles grace au switch en haut de la page: 
            <br /><span className='font-bold'>Selection unique</span>
            <br />Vous cliquez sur l'emplacement désiré, un menu s'ouvre et vous choisissez le status de cet emplacement.
            <br /><span className='font-bold '>Selection multiple</span>
            <br />Vous sélectionnez un ou plusieurs emplacements puis une fois la sélection faite, vous choisissez dans le menu déroulant en haut de la page le status de l'emplacement.
          </p>
          <br />
          <h2 className='pt-10 font-bold text-xl pb-2'>Une fois le plan de classe terminé, cliquez sur le bouton "Sauvgarder la salle" en bas de la page pour sauvegarder la salle.</h2>
        </div>
      </dialog>

      <dialog
        ref={dialogChoicePlacementSingle}
        onClick={(e) => { if (e.target === dialogChoicePlacementSingle.current) dialogChoicePlacementSingle.current?.close() }}
        style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }}
        className="m-0 fixed w-50 h-min rounded-md bg-transparent backdrop:bg-black/50"
      >
        <div className='p-2 bg-gray-600/75'>
          <p className='text-center pt-2 pb-4 text-xl text-white'>Statut du placement</p>
          <div className='rounded-md cursor-pointer'>
            <p onClick={() => handleSelectStatus('disponible')} className='bg-[#AAD690] hover:bg-[#BFE3A8] p-2'>Disponible</p>
            <p onClick={() => handleSelectStatus('interdite')} className='bg-[#A84747] hover:bg-[#B56060] p-2 text-white'>Interdite</p>
            <p onClick={() => handleSelectStatus('prise')} className='bg-[#EDEB87] hover:bg-[#FAF8B1] p-2'>Avec Prise</p>
            <p onClick={() => handleSelectStatus('couloir')} className='bg-[#EBEBEB] hover:bg-[#F5F5F5] p-2'>Couloir</p>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ClassDispositionPage
