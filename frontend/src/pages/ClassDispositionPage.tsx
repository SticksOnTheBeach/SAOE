import { useLocation } from 'react-router'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { intToExcelCol } from 'excel-column-name'

interface SeatData {
  row: number
  column: number
  type: 'AVAILABLE' | 'FORBIDDEN'
  equipment: string[]
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
  prise: 'bg-[#AAD690]',
  couloir: 'bg-[#FCFCFC] border-2 border-[#F0F0F0]',
}

function ClassDispositionPage() {
  const navigate = useNavigate()
  const dialogRefHelp = useRef<HTMLDialogElement>(null)
  const dialogChoicePlacementSingle = useRef<HTMLDialogElement>(null)
  const dialogChoicePlacementSingleArangement = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  const data = location.state as RoomState | null
  const [isMultiple, setIsMultiple] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ row: number; column: number } | null>(null)
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [cellStatuses, setCellStatuses] = useState<Record<string, CellStatus>>({})
  // Le statut et les équipements sont indépendants ; une place peut cumuler PMR et prise.
  const [cellEquipment, setCellEquipment] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!data?.id) return
    fetch(`/api/rooms/${data.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((room: RoomState | null) => {
        if (!room?.seats) return
        const initialStatuses: Record<string, CellStatus> = {}
        const seatMap = new Map<string, SeatData>()
        const initialEquipment: Record<string, string[]> = {}
        for (const s of room.seats) {
          seatMap.set(`${s.row}-${s.column}`, s)
        }
        for (let r = 0; r < Number(data.rows); r++) {
          for (let c = 0; c < Number(data.columns); c++) {
            const key = `${r}-${c}`
            const seat = seatMap.get(key)
            const seatType = seat?.type
            initialEquipment[key] = (seat?.equipment ?? []).filter((item) => item === 'PRM' || item === 'POWER_OUTLET')
            if (!seatType) {
              if (r < room.rows && c < room.columns) {
                initialStatuses[key] = 'couloir'
              } else {
                initialStatuses[key] = 'disponible'
              }
            } else if (seatType === 'FORBIDDEN') {
              initialStatuses[key] = 'interdite'
            } else if (seat?.equipment?.includes('POWER_OUTLET')) {
              initialStatuses[key] = 'prise'
            } else {
              initialStatuses[key] = 'disponible'
            }
          }
        }
        setCellStatuses(initialStatuses)
        setCellEquipment(initialEquipment)
      })
      .catch((err) => console.error('Erreur chargement salle :', err))
  }, [data?.id, data?.rows, data?.columns])
  
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMultiple(e.target.checked)
    setSelectedCells([])
  }

  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>, row: number, column: number) => {
    if (!isMultiple) {
      setSelectedCell({ row, column })
      setMenuPos({ x: e.clientX, y: e.clientY })
      dialogChoicePlacementSingle.current?.showModal()
    } else {
      const key = `${row}-${column}`
      setSelectedCells((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      )
    }
  }

  const handleSelectStatus = (status: CellStatus) => {
    if (selectedCell) {
      const key = `${selectedCell.row}-${selectedCell.column}`
      setCellEquipment((prev) => ({ ...prev, [key]: [] }))
      setCellStatuses((prev) => ({
        ...prev,
        [key]: status,
      }))
    }
    dialogChoicePlacementSingle.current?.close()
  }

  function toggleEquipment(equipment: 'PRM' | 'POWER_OUTLET') {
    if (!selectedCell) return
    const key = `${selectedCell.row}-${selectedCell.column}`
    const current = cellEquipment[key] ?? []
    const next = current.includes(equipment)
      ? current.filter((item) => item !== equipment)
      : [...current, equipment]
    setCellEquipment((prev) => ({ ...prev, [key]: next }))
    // Choisir un équipement sur un couloir crée une place disponible.
    setCellStatuses((prev) => ({ ...prev, [key]: next.includes('POWER_OUTLET') ? 'prise' : 'disponible' }))
  }

  const handleMultipleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (selectedCells.length === 0) return
    if (value === 'PRM' || value === 'POWER_OUTLET') {
      // Ajouter sans doublons ni perte des autres aménagements.
      setCellEquipment((prev) => {
        const updated = { ...prev }
        for (const key of selectedCells) {
          updated[key] = [...new Set([...(prev[key] ?? []), value])]
        }
        return updated
      })
      setCellStatuses((prev) => {
        const updated = { ...prev }
        for (const key of selectedCells) {
          updated[key] = value === 'POWER_OUTLET' || prev[key] === 'prise' ? 'prise' : 'disponible'
        }
        return updated
      })
      // Conserver la sélection pour pouvoir ajouter plusieurs aménagements de suite.
      e.target.value = ''
      return
    }
    const status = e.target.value as CellStatus
    if (!status || selectedCells.length === 0) return

    setCellStatuses((prev) => {
      const updated = { ...prev }
      for (const key of selectedCells) {
        updated[key] = status
      }
      return updated
    })
    setCellEquipment((prev) => {
      const updated = { ...prev }
      for (const key of selectedCells) {
        updated[key] = status === 'prise'
          ? [...new Set([...(prev[key] ?? []), 'POWER_OUTLET'])]
          : []
      }
      return updated
    })
    setSelectedCells([])
    e.target.value = ''
  }

  const handleRowClick = (row: number) => {
    if (!data) return
    setIsMultiple(true)
    const rowKeys = Array.from({ length: Number(data.columns) }, (_, col) => `${row}-${col}`)

    setSelectedCells((prev) => {
      const allSelected = rowKeys.every((key) => prev.includes(key))
      if (allSelected) {
        return prev.filter((key) => !rowKeys.includes(key))
      }
      const missingKeys = rowKeys.filter((key) => !prev.includes(key))
      return [...prev, ...missingKeys]
    })
  }

  const handleColumnClick = (column: number) => {
    if (!data) return
    setIsMultiple(true)

    const colKeys = Array.from({ length: Number(data.rows) }, (_, r) => `${r}-${column}`)

    setSelectedCells((prev) => {
      const allSelected = colKeys.every((key) => prev.includes(key))
      if (allSelected) {
        return prev.filter((key) => !colKeys.includes(key))
      }
      const missingKeys = colKeys.filter((key) => !prev.includes(key))
      return [...prev, ...missingKeys]
    })
  }

  async function saveRoom() {
    if (!data) return
    setError('')
    setLoading(true)

    const seats: SeatData[] = []

    for (let r = 0; r < Number(data.rows); r++) {
      for (let c = 0; c < Number(data.columns); c++) {
        const status = cellStatuses[`${r}-${c}`] ?? 'disponible'
        if (status === 'couloir') continue

        // Les équipements ne sont plus envoyés comme un type de place.
        const type: SeatData['type'] = status === 'interdite' ? 'FORBIDDEN' : 'AVAILABLE'
        const equipment = (cellEquipment[`${r}-${c}`] ?? []).filter((item) => item === 'PRM' || item === 'POWER_OUTLET')
        if (status === 'prise' && !equipment.includes('POWER_OUTLET')) equipment.push('POWER_OUTLET')
        seats.push({ row: r, column: c, type, equipment })
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
    <div className='flex flex-between h-[calc(100vh-130px)] overflow-hidden'>
      {/* Partie gauche : Parametres */}
      <div className='flex-1 grid grid-rows-3 items-start bg-gray-200 p-10 rounded-r-2xl'>
        <div className='flex flex-col items-center justify-self-center self-center text-center'>
          <div className='pb-3'><h1 className='text-4xl'>Configuration des placements</h1></div>
          <h2 className='text-xl'>Salle {data.name}</h2>
          <p className='flex gap-2 text-l cursor-pointer mt-3 hover:font-bold' onClick={() => dialogRefHelp.current?.showModal()}><img src="/question-circle.svg" alt="" className='w-5 h-auto'/>Help</p>
        </div>
        <div className='justify-self-center flex flex-col items-center mt-10'>
          <h2 className='text-center text-xl pb-2'>Type de sélection</h2>
          <div className='flex gap-5 p-2 rounded-md'>
            <h3 className={`pt-1 text-l ${isMultiple ? 'font-normal' : 'font-bold'}`}>Simple</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={isMultiple} onChange={handleSwitch} type="checkbox" className="sr-only peer" />
              <div className="group peer bg-white rounded-full duration-300 w-16 h-8 ring-2 after:duration-300 after:bg-gray-400 peer-checked:after:bg-gray-400 after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-8 peer-hover:after:scale-95"></div>
            </label>
            <h3 className={`pt-1 text-l ${isMultiple ? 'font-bold' : 'font-normal'}`} id='multiple'>Multiple</h3>
          </div>
          {isMultiple && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <select
                defaultValue=""
                onChange={handleMultipleStatusChange}
                disabled={selectedCells.length === 0}
                className="border-2 border-gray-400 rounded-md px-3 py-1 bg-white disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  {selectedCells.length === 0
                    ? 'Sélectionnez des cases...'
                    : `Appliquer aux ${selectedCells.length} emplacement(s)`}
                </option>
                <optgroup label="Statut">
                  <option value="disponible">Place disponible</option>
                  <option value="interdite">Place interdite</option>
                  <option value="couloir">Couloir</option>
                </optgroup>
                <optgroup label="Ajouter un aménagement">
                  <option value="POWER_OUTLET">Prise électrique</option>
                  <option value="PRM">Accès PMR</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>
        <div className='flex justify-around gap-10 justify-self-center'>
          <div>
            <div className='flex gap-1'>
              <div className='w-5 h-5 bg-[#AAD690] rounded-md'></div>
              <p>Place disponible</p>
            </div>
            <div className='flex gap-1'>
              <div className='w-5 h-5 bg-[#A84747] rounded-md'></div>
              <p>Place interdite</p>
            </div>
            <div className='flex gap-1'>
              <div className='w-5 h-5 bg-[#FCFCFC] border-2 border-[#F0F0F0] rounded-md'></div>
              <p>Couloir</p>
            </div>
          </div>
          <div>
            <div className='flex gap-1'>
              <img src="/light.svg" alt="" />
              <p>Prise Electrique</p>
            </div>
            <div className='flex gap-1'>
              <img src="/person-wheelchair.svg" alt="" />
              <p>Accès PMR</p>
            </div>
          </div>
        </div>
        <div className='flex justify-center mt-5'>
          <button onClick={saveRoom} disabled={loading} className='cursor-pointer text-center text-white border-2 border-gray-900 px-10 py-2 rounded-md bg-[#B51621] hover:bg-[#D43B46] hover:border-gray-700'>
            {loading ? 'Sauvegarde en cours…' : `Sauvegarder`}
          </button>
        </div>
      </div>
      {/* Partie droite : Plan */}
      <div className='flex flex-3 flex-col min-w-0 min-h-0 p-5'>
        <div className='bg-gray-100 flex justify-center p-3 mx-[45%] mb-10 mb-2 rounded-md'>
          <h2>Bureau</h2>
        </div>
        <div role="region" aria-label="Grille des places" tabIndex={0} className='flex flex-1 min-h-0 w-full overflow-auto'>
          <div
            className='grid w-max h-max shrink-0 gap-2 m-auto pr-10'
            style={{
              '--cell-size': `clamp(1.5rem, min(4rem, calc((100vh - 340px) / ${Number(data.rows)}), calc((100vw - 160px) / ${Number(data.columns)})), 4rem)`,
              gridTemplateColumns: `2rem repeat(${Number(data.columns)}, var(--cell-size))`,
              gridTemplateRows: `2rem repeat(${Number(data.rows)}, var(--cell-size))`,
            } as React.CSSProperties}
          >
            <div />
            {Array.from({ length: Number(data.columns) }, (_, column) => (
              <p key={`col-${column}`} onClick={() => handleColumnClick(column)} className='cursor-pointer select-none hover:font-bold hover:bg-gray-200 rounded-md flex items-center justify-center'>
                {intToExcelCol(column + 1)}
              </p>
            ))}
            {Array.from({ length: Number(data.rows) }, (_, row) => (
              <Fragment key={`row-${row}`}>
                <p onClick={() => handleRowClick(row)} className='cursor-pointer select-none hover:font-bold hover:bg-gray-200 rounded-md flex items-center justify-center'>
                  {row + 1}
                </p>
                {Array.from({ length: Number(data.columns) }, (_, column) => {
                  const key = `${row}-${column}`
                  const status = cellStatuses[key]
                  // Les équipements sont indiqués par les icônes, sans changer le fond disponible.
                  const colorClass = STATUS_COLORS[status ?? 'disponible']
                  const isSelected = isMultiple && selectedCells.includes(key)

                  return (
                    <div
                      key={key}
                      onClick={(e) => handleCellClick(e, row, column)}
                      className={`flex flex-col gap-1 p-1 cursor-pointer rounded-md ${colorClass} ${isSelected ? 'ring-3 ring-blue-500' : ''}`}
                      title={(cellEquipment[key] ?? []).join(', ')}
                    >{cellEquipment[key]?.includes('PRM') && <span><img src="/person-wheelchair.svg" alt="" /></span>}{cellEquipment[key]?.includes('POWER_OUTLET') && <span><img src="/light.svg" alt="" /></span>}</div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
        {error && (
          <p className="text-center text-red-600 font-bold pb-3">{error}</p>
        )}
      </div>
      
      
      {/* Aide */}
      <dialog ref={dialogRefHelp} className="m-auto w-3/4 h-fit rounded-xl bg-transparent backdrop:bg-black/50">
        <div className='bg-gray-200/95 p-5'>
          <div className='flex justify-between'>
            <h1 className='text-3xl text-center pb-5'>Comment utiliser ce configurateur ?</h1>
            <img onClick={() => dialogRefHelp.current?.close()} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto cursor-pointer'/>
          </div>
          <h2 className='pt-5 font-bold text-xl pb-2'>Status des emplacements</h2>
          <p className=''>Chaquns de ces carrés représente un emplacement. Il peut être : </p>
          <p className='pl-5'>  
            - Une place disponible : Une place qui sera attribuée à un élève sans condition particulière
            <br /> - Une place interdite : Une place qui sera pas attribuée pour x raisons
            <br /> - Un couloir : Une place qui ne peux donc pas être attribuée à un éleve
          </p>
          <p>Si un emplacement est une place disponible, il est possible de lui attribuer des options : </p>
          <p className='pl-5'>
             - PMR : Une place prioritaire pour les personnes à mobilité réduites
            <br /> - Prise électrique : Une place prioritaire pour les personnes nécéssitant une prise électrique (ordinateur, appareil médical, ...)
          </p>
          <h2 className='pt-10 font-bold text-xl pb-2'>Mode de sélection</h2>
          <p className='pb-2'>2 modes de sélection sont possibles grace au switch en haut de la page:</p> 
          <p>
            <div className='pb-2'>
              <span className='font-bold'>Selection unique</span>
              <br />Vous cliquez sur l'emplacement désiré, un menu s'ouvre et vous choisissez le status de cet emplacement. <br /> Si vous souhaitez ajouter un aménagement, cliquez sur aménagement et une deuxième fenêtre apparaitra avec les aménagements possible. Cliquez sur retour pour revenir au menu d'avant.
            </div>
            <div>
              <span className='font-bold'>Selection multiple</span>
              <br />Vous sélectionnez un ou plusieurs emplacements réprésentés par un contour bleu en cliquant sur l'emplacement désiré. Il est également possible de sélectionner une ligne / colonne d'emplacements en cliquant sur son numéro.
              <br />Une fois la sélection faite, vous choisissez dans le menu déroulant en haut de la page le status de l'emplacement qui s'appliquera à la sélection.
            </div>
          </p>
          <br />
          <h2 className='pt-10 font-bold text-xl pb-2'>Une fois le plan de classe terminé, cliquez sur le bouton "Sauvegarder la salle" en bas de la page pour sauvegarder la salle.</h2>
        </div>
      </dialog>
      
      {/* Dialog placement */}
      <dialog ref={dialogChoicePlacementSingle} onClick={(e) => { if (e.target === dialogChoicePlacementSingle.current) dialogChoicePlacementSingle.current?.close() }} style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }} className="m-0 fixed w-50 h-min rounded-md bg-transparent backdrop:bg-black/50">
        <div className='p-2 bg-gray-600/75'>
          <p className='text-center pt-2 pb-4 text-xl text-white'>Statut du placement</p>
          <div className='rounded-md cursor-pointer'>
            <div className='flex gap-2 bg-[#AAD690] hover:bg-[#BFE3A8] p-2'><img src="/valid.png" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p onClick={() => handleSelectStatus('disponible')}>Disponible</p></div>
            <div className='flex gap-2 bg-[#A84747] hover:bg-[#B56060] p-2'><img src="/cross.png" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p onClick={() => handleSelectStatus('interdite')}>Interdite</p></div>
            <div className='flex gap-2 bg-[#EBEBEB] hover:bg-[#F5F5F5] p-2'><img src="/empty.png" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p onClick={() => handleSelectStatus('couloir')}>Couloir</p></div>
            <div onClick={() => {dialogChoicePlacementSingle.current?.close(); dialogChoicePlacementSingleArangement.current?.showModal()}} className='flex gap-2 bg-[#8F72B0] hover:bg-[#A08ABA] p-2'><img src="/chair.png" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p>Aménagement(s)</p></div>
          </div>
        </div>
      </dialog>
      
      {/* Dialog placement dispo */}
      <dialog ref={dialogChoicePlacementSingleArangement} onClick={(e) => { if (e.target === dialogChoicePlacementSingleArangement.current) dialogChoicePlacementSingleArangement.current?.close() }} style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }} className="m-0 fixed w-50 h-min rounded-md bg-transparent backdrop:bg-black/50">
        <div className='p-2 bg-gray-600/75'>
          <p className='text-center pt-2 pb-4 text-xl text-white'>Type d'aménagement</p>
          <div className='rounded-md cursor-pointer'>
            <div onClick={() => toggleEquipment('POWER_OUTLET')} className='flex gap-2 bg-[#A1A1A1] hover:bg-[#BFBFBF] p-2'><img src="/light.svg" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p className='text-gray-700'>Prise électrique {selectedCell && cellEquipment[`${selectedCell.row}-${selectedCell.column}`]?.includes('POWER_OUTLET') ? '✓' : ''}</p></div>
            <div onClick={() => toggleEquipment('PRM')} className='flex gap-2 bg-[#D4D4D4] hover:bg-[#E3E3E3] p-2'><img src="/person-wheelchair.svg" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p className='text-gray-700'>Accès PMR {selectedCell && cellEquipment[`${selectedCell.row}-${selectedCell.column}`]?.includes('PRM') ? '✓' : ''}</p></div>
            <div onClick={() => {dialogChoicePlacementSingleArangement.current?.close(); dialogChoicePlacementSingle.current?.showModal()}} className='flex justify-center gap-2 bg-[#A1A1A1] hover:bg-[#BFBFBF] p-2'><img src="/exit.svg" className='w-5 h-auto border-0 border-gray-900 rounded-md invert-[25%]' alt="" /><p className='text-gray-700'>Retour</p></div>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ClassDispositionPage
