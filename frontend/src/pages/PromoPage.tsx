import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

interface Promo {
  id: number
  name: string
}

interface Student {
  id: number
  firstName: string
  lastName: string
  groupName: string
  needsPowerOutlet: boolean
  promo: Promo | null
}

function PromoPage() {
  const navigate = useNavigate()
  const [promos, setPromos] = useState<Promo[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null)
  const [groupsOfPromo, setGroupsOfPromo] = useState<string[]>([])
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dialogConfirmPromo = useRef<HTMLDialogElement>(null)
  const dialogConfirmStudent = useRef<HTMLDialogElement>(null)
  const dialogChargement = useRef<HTMLDialogElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openingForm, setOpeningForm] = useState(false)

  function openPromoDialog(promo: Promo | null) {
    if (dialogChargement.current?.open || dialogRef.current?.open) return
    dialogChargement.current?.showModal()

    // Laisser le navigateur peindre le chargement avant de construire les lignes.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSelectedPromo(promo)
        setGroupsOfPromo(promo ? showGroups(promo) : [])
        setEditingId(promo !== null)
        setOpeningForm(true)
      })
    })
  }

  useEffect(() => {
    if (!openingForm) return

    // React a inséré les lignes dans le DOM : afficher le formulaire,
    // puis retirer le chargement, sans délai artificiel.
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.showModal()
      dialogChargement.current?.close()
      setOpeningForm(false)
    })
    return () => cancelAnimationFrame(frame)
  }, [openingForm])


  function showGroups(promo: Promo) {
    const groups: string[] = []
    for (const student of students) {
      if (student.promo?.id !== promo.id) continue
      if (!groups.includes(student.groupName)) {
        groups.push(student.groupName)
      }
    }
    const sortedGroups = groups.sort()
    console.log(sortedGroups)
    return sortedGroups
  }

  function resetDialog() {
    setMessage('')
    setError('')
    setLoading(false)
  }


  async function fetchPromos() {
    try {
      const res = await fetch('/api/promos')
      if (res.ok) {
        const data: Promo[] = await res.json()
        setPromos(data)
        console.log(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des promotions : ', err)
    }
  }

  async function fetchStudentCounts() {
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data: Student[] = await res.json()
        setStudents(data)
        const counts: Record<number, number> = {}
        for (const student of data) {
          if (student.promo) {
            counts[student.promo.id] = (counts[student.promo.id] ?? 0) + 1
          }
        }
        setStudentCounts(counts)
      }
    } catch (err) {
      console.error("Erreur lors du chargement des étudiants : ", err)
    }
  }

  useEffect(() => {
    fetchPromos()
    fetchStudentCounts()
  }, [])

  async function deletePromo() {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/promo/${deletingId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchPromos()
      }
    } catch (err) {
      console.error('Erreur lors de la suppression : ', err)
    } finally {
      setDeletingId(null)
      dialogConfirmPromo.current?.close()
    }
  }

  return (
  <div>
    {/* Page */}
    <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Gestion des promotions</h1>
    <div className="grid grid-cols-5 gap-10 px-20 pb-10">
        <div onClick={() => openPromoDialog(null)} className="cursor-pointer flex items-center justify-center aspect-[4/3] rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {promos.map((promo) => (
            <div key={promo.id} className="cursor-pointer group flex items-center justify-center aspect-[4/3] rounded-4xl bg-gray-200 hover:bg-gray-300">
                <div>
                    <p className="text-4xl text-center text-[#4D4D4D] select-none">{promo.name}</p>
                    <p className="text-l text-center text-[#4D4D4D] select-none">Nombre d'étudiants : {studentCounts[promo.id] ?? 0}</p>
                    <div className="flex justify-center mt-6 invisible group-hover:visible gap-2">
                        <img onClick={(event) => {
                          // Le clic sur le stylo ne doit pas déclencher celui de la carte.
                          event.stopPropagation()
                          openPromoDialog(promo)
                        }} src="/pen.svg" alt="Modifier" title="Modifier" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400"/>
                        <img onClick={(e) => { e.stopPropagation(); setDeletingId(promo.name); dialogConfirmPromo.current?.showModal() }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400'/>
                    </div>
                </div>
            </div>
        ))}
    </div>
    
    {/* Dialog modif promo */}
    <dialog ref={dialogRef} onClose={resetDialog} className="m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        <div className='flex justify-between mb-5'>
          <h2 className='justify-self-center text-center text-4xl whitespace-nowrap'>{editingId ? 'Modification de la promotion' : 'Outil de création de la promotion'}</h2>
          <img onClick={() => dialogRef.current?.close()} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto invert cursor-pointer'/>
        </div>
        <div className='flex justify-between'>
          <div>
            {/* Les classes file: personnalisent le bouton natif du sélecteur. */}
            <input type="file" id="import-fichier" accept=".csv" aria-label="Importer un CSV" disabled={loading} className='text-sm file:cursor-pointer file:rounded-md file:border file:border-gray-300 file:bg-transparent file:px-10 file:py-1 file:text-white file:mr-3 hover:file:bg-[#7A1B1B] disabled:opacity-50'
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) console.log('CSV sélectionné :', file)
              }}
            />
          </div>
          <button type="button" disabled={loading} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1 w-75'>Enregistrer la promotion</button>
        </div>
        <div className='flex flex-1 min-h-0 gap-2 mt-2'>
          <div className='flex-1 border-1 border-gray-300 p-2 rounded-md overflow-y-auto'>
            <h2 className='text-center text-2xl font-bold'>Groupes</h2>
            <div className='flex gap-0 flex-col mt-10'>
              {groupsOfPromo.map((thisGroup) => (
                <div className='flex gap-5 p-2' key={thisGroup}><button className='border-1 border-gray-300 hover:bg-[#7A1B1B] rounded-md w-full'>{thisGroup}</button></div>
              ))}
              <div className='p-2'><button className='flex justify-between hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-5 font-bold'><p>+</p><p>Ajouter un groupe</p><p>+</p></button></div>
            </div>
          </div>
          <div className='flex-4 border-1 border-gray-300 p-2 rounded-md overflow-y-auto'>
            <h2 className='text-center text-2xl font-bold mb-7'>Eleves</h2>

            {groupsOfPromo.map((thisGroup) => (
              <div key={thisGroup} className='mb-12'>
                <h3 className='text-center text-xl'>{thisGroup}</h3>
                <table className='w-full border-separate border-spacing-y-3'>
                  <thead>
                    <tr>
                      <th className='text-center px-2'>Prénom</th>
                      <th className='text-center px-2'>Nom</th>
                      <th className='text-center px-2'>Groupe</th>
                      <th className='text-center px-2'>Aménagements</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter((student) =>
                        student.promo?.id === selectedPromo?.id &&
                        student.groupName === thisGroup
                      )
                      .map((student) => (
                        <tr key={student.id}>
                          <td className='px-2'>
                            <input type="text" defaultValue={student.firstName} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-2' />
                          </td>
                          <td className='px-2'>
                            <input type="text" defaultValue={student.lastName} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-2' />
                          </td>
                          <td className='px-2'>
                            <select defaultValue={student.groupName} aria-label={`Groupe de ${student.firstName} ${student.lastName}`} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-3'>
                              {groupsOfPromo.map((thisGroup) => (
                                <option key={thisGroup} value={thisGroup}>{thisGroup}</option>
                              ))}
                            </select>
                          </td>
                          <td className='px-2'>
                            <smart-drop-down-list selection-mode="checkBox" placeholder="Aménagements" aria-label={`Aménagements de ${student.firstName} ${student.lastName}`} className="amenities-dropdown max-w-full">
                              <smart-list-item value="1">Tiers Temps</smart-list-item>
                              <smart-list-item value="2" selected={student.needsPowerOutlet}>Prise Electrique</smart-list-item>
                              <smart-list-item value="3">Autre</smart-list-item>
                            </smart-drop-down-list>
                          </td>
                          <td>
                            <div className='flex items-center justify-center px-2 py-1 border-1 border-gray-300 rounded-md hover:bg-[#7A1B1B]'><img src="/trash.svg" onClick={() => dialogConfirmStudent.current?.showModal()} alt="Supprimer un élève" className='invert-[90%]'/></div>
                          </td>
                        </tr>
                      ))}
                    <tr>
                      <td colSpan={5} className='px-2'>
                        <button type="button" className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full cursor-pointer'>+</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>

    {/* Dialog confirm del promo*/}
    <dialog ref={dialogConfirmPromo} onClose={resetDialog} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        <div className='flex justify-between'>
          <div>
            <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cette promotion ?</h1>
            <h2>Cette action est définitive.</h2>
            <div className='pt-5 flex gap-5'>
              <button type="button" onClick={deletePromo} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Supprimer</button>
              <button type="button" onClick={() => dialogConfirmPromo.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
            </div>
          </div>
          <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
        </div>
      </div>
    </dialog>

    {/* Dialog confirm del */}
    <dialog ref={dialogConfirmStudent} onClose={resetDialog} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        <div className='flex justify-between'>
          <div>
            <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cet étudiant ?</h1>
            <h2>Cette action est définitive.</h2>
            <div className='pt-5 flex gap-5'>
              <button type="button" className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Supprimer</button>
              <button type="button" onClick={() => dialogConfirmStudent.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
            </div>
          </div>
          <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
        </div>
      </div>
    </dialog>

    {/* Dialog chargement */}
    <dialog ref={dialogChargement} onClose={resetDialog} className="m-auto w-[20%] h-[15%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col justify-center w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        <div className='flex items-center justify-between'>
          <h1 className='text-4xl'>Chargement</h1>
          <img src="/loading.gif" alt="" className='w-17 h-auto invert mix-blend-screen'/>
        </div>
      </div>
    </dialog>
  </div>
  )
}

export default PromoPage
