import { useEffect, useRef, useState } from 'react'

interface Promo {
  id: number
  name: string
  groups?: string[]
}

interface Student {
  id: number
  firstName: string
  lastName: string
  groupName: string
  extraTime?: boolean
  otherAccommodation?: boolean
  needsPowerOutlet: boolean
  promo: Promo | null
}

function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null)
  const [groupsOfPromo, setGroupsOfPromo] = useState<string[]>([])
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dialogConfirmGroup = useRef<HTMLDialogElement>(null)
  const dialogConfirmPromo = useRef<HTMLDialogElement>(null)
  const dialogConfirmStudent = useRef<HTMLDialogElement>(null)
  const dialogChargement = useRef<HTMLDialogElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [editingId, setEditingId] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null)
  const [groupDeleteError, setGroupDeleteError] = useState('')
  const groupDeleteInProgress = useRef(false)
  const [openingForm, setOpeningForm] = useState(false)
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [studentDrafts, setStudentDrafts] = useState<{ id: string; groupName: string }[]>([])
  const [promoName, setPromoName] = useState('')
  const [formVersion, setFormVersion] = useState(0)
  const savingPromo = useRef(false)

  function cancelAddingGroup() {
    setNewGroupName('')
    setAddingGroup(false)
  }

  function validateNewGroup() {
    const name = newGroupName.trim()
    if (!name) return

    setGroupsOfPromo((groups) => groups.includes(name) ? groups : [...groups, name])
    cancelAddingGroup()
  }

  function openPromoDialog(promo: Promo | null) {
    if (dialogChargement.current?.open || dialogRef.current?.open) return
    cancelAddingGroup()
    setPromoName(promo?.name ?? '')
    setError('')
    setMessage('')
    setStudentDrafts([])
    dialogChargement.current?.showModal()

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFormVersion((version) => version + 1)
        setSelectedPromo(promo)
        setGroupsOfPromo(promo ? showGroups(promo) : [])
        setEditingId(promo !== null)
        setOpeningForm(true)
      })
    })
  }

  useEffect(() => {
    if (!openingForm) return

    const frame = requestAnimationFrame(() => {
      dialogRef.current?.showModal()
      dialogChargement.current?.close()
      setOpeningForm(false)
    })
    return () => cancelAnimationFrame(frame)
  }, [openingForm])


  function showGroups(promo: Promo) {
    const groups: string[] = [...(promo.groups ?? [])]
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

  async function savePromo() {
    if (savingPromo.current || deletingGroup !== null || deletingStudent) return
    savingPromo.current = true
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (!promoName.trim()) throw new Error('Renseignez le nom de la promotion.')
      if (addingGroup && newGroupName.trim()) throw new Error('Validez le nouveau groupe avant de sauvegarder.')

      const rows = Array.from(dialogRef.current!.querySelectorAll<HTMLTableRowElement>('tr[data-student-row]'))
      const editedStudents = rows.map((row) => {
        const input = (name: string) => row.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!.value.trim()
        const menu = row.querySelector('smart-drop-down-list') as HTMLElement & { selectedValues?: string[] }
        const amenities = menu.selectedValues ?? []
        const firstName = input('firstName')
        const lastName = input('lastName')
        if (!firstName || !lastName) throw new Error('Chaque ligne doit avoir un prénom et un nom. Supprimez les lignes vides inutilisées.')
        return {
          id: row.dataset.studentId ? Number(row.dataset.studentId) : null,
          firstName, lastName, groupName: input('groupName'),
          needsPowerOutlet: amenities.includes('2'),
          extraTime: amenities.includes('1'),
          otherAccommodation: amenities.includes('3'),
        }
      })
      const res = await fetch(selectedPromo ? `/api/promos/${selectedPromo.id}` : '/api/promos', {
        method: selectedPromo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: promoName.trim(), groups: groupsOfPromo, students: editedStudents }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.message ?? `Enregistrement impossible (HTTP ${res.status}).`)
      const saved = body as { promo: Promo; students: Student[] }
      setSelectedPromo(saved.promo)
      setEditingId(true)
      setPromos((current) => [...current.filter((promo) => promo.id !== saved.promo.id), saved.promo].sort((a, b) => a.id - b.id))
      setStudents((current) => [...current.filter((student) => student.promo?.id !== saved.promo.id), ...saved.students])
      setStudentCounts((counts) => ({ ...counts, [saved.promo.id]: saved.students.length }))
      setStudentDrafts([])
      setMessage('Promotion enregistrée.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      savingPromo.current = false
      setLoading(false)
    }
  }

  async function deleteStudents() {
    if (deletingStudentId === null || deletingStudent) return
    const student = students.find((item) => item.id === deletingStudentId)
    setDeletingStudent(true)
    setError('')

    try {
      const res = await fetch(`/api/students/${deletingStudentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Suppression impossible (HTTP ${res.status}).`)

      setStudents((current) => current.filter((item) => item.id !== deletingStudentId))
      if (student?.promo) {
        const promoId = student.promo.id
        setStudentCounts((counts) => ({
          ...counts,
          [promoId]: Math.max(0, (counts[promoId] ?? 0) - 1),
        }))
      }
      dialogConfirmStudent.current?.close()
      setDeletingStudentId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    } finally {
      setDeletingStudent(false)
    }
  }

  async function deleteGroup(groupName: string) {
    if (groupDeleteInProgress.current || deletingStudent) return
    groupDeleteInProgress.current = true
    setDeletingGroup(groupName)
    setGroupDeleteError('')

    const promoId = selectedPromo?.id
    const groupStudents = students.filter((student) =>
      promoId !== undefined && student.promo?.id === promoId && student.groupName === groupName
    )
    const deletedIds = new Set<number>()

    try {
      for (const student of groupStudents) {
        const res = await fetch(`/api/students/${student.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`Suppression impossible (HTTP ${res.status}).`)
        deletedIds.add(student.id)
      }

      setGroupsOfPromo((groups) => groups.filter((group) => group !== groupName))
      setStudentDrafts((drafts) => drafts.filter((draft) => draft.groupName !== groupName))
      dialogConfirmGroup.current?.close()
    } catch (err) {
      setGroupDeleteError(
        `${deletedIds.size}/${groupStudents.length} élèves supprimés. ` +
        (err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      )
    } finally {
      setStudents((current) => current.filter((student) => !deletedIds.has(student.id)))
      if (promoId !== undefined && deletedIds.size > 0) {
        setStudentCounts((counts) => ({
          ...counts,
          [promoId]: Math.max(0, (counts[promoId] ?? 0) - deletedIds.size),
        }))
      }
      setDeletingGroup(null)
      groupDeleteInProgress.current = false
    }
  }

  async function deletePromo() {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/promos/${deletingId}?withStudents=true`, {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 2xl:gap-10 px-4 sm:px-6 lg:px-10 2xl:px-20 pb-10">
        <div onClick={() => openPromoDialog(null)} className="cursor-pointer flex items-center justify-center aspect-[4/3] min-w-0 overflow-hidden p-4 rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {promos.map((promo) => (
            <div key={promo.id} className="cursor-pointer group flex items-center justify-center aspect-[4/3] min-w-0 overflow-hidden p-4 rounded-4xl bg-gray-200 hover:bg-gray-300">
                <div className="w-full min-w-0">
                    <p title={promo.name} className="text-2xl 2xl:text-4xl truncate text-center text-[#4D4D4D] select-none">{promo.name}</p>
                    <p className="text-sm 2xl:text-base truncate text-center text-[#4D4D4D] select-none">Nombre d'étudiants : {studentCounts[promo.id] ?? 0}</p>
                    <div className="flex justify-center mt-3 2xl:mt-6 gap-2 visible md:invisible md:group-hover:visible md:group-focus-within:visible">
                        <img onClick={(event) => {
                          event.stopPropagation()
                          openPromoDialog(promo)
                        }} src="/pen.svg" alt="Modifier" title="Modifier" className="w-10 h-10 2xl:w-12 2xl:h-12 shrink-0 object-contain bg-gray-400 p-2 2xl:p-3 rounded-md hover:bg-gray-500"/>
                        <img onClick={(e) => { e.stopPropagation(); setDeletingId(promo.id); dialogConfirmPromo.current?.showModal() }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-10 h-10 2xl:w-12 2xl:h-12 shrink-0 object-contain bg-gray-400 p-2 2xl:p-3 rounded-md hover:bg-gray-500'/>
                    </div>
                </div>
            </div>
        ))}
    </div>
    
    {/* Dialog modif promo */}
    <dialog ref={dialogRef} onCancel={(event) => { if (savingPromo.current) event.preventDefault() }} onClose={resetDialog} className="text-white m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
      <fieldset key={formVersion} disabled={loading} className='flex flex-col min-w-0 w-full h-full bg-gray-500 p-5 rounded-3xl border-2 border-gray-700'>
        <div className='flex justify-between mb-5'>
          <div className='flex justify-left gap-5'>
            <h2 className='justify-self-center text-center text-4xl whitespace-nowrap'>{editingId ? 'Modification de la promotion' : 'Outil de création de la promotion'}</h2>
            <input aria-label="Nom de la promotion" value={promoName} onChange={(event) => setPromoName(event.target.value)} className="text-center text-2xl border border-gray-300 rounded-md px-2 w-[20%]" />
          </div>
          <img onClick={() => { if (!savingPromo.current) dialogRef.current?.close() }} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto invert cursor-pointer'/>
        </div>
        {error && <p role="alert" className="mb-3 text-red-200">{error}</p>}
        {message && <p role="status" className="mb-3">{message}</p>}
        <div className='flex justify-between'>
          <div>
            <input type="file" id="import-fichier" accept=".csv" aria-label="Importer un CSV" disabled={loading} className='text-sm file:cursor-pointer file:rounded-md file:border file:border-gray-900 file:bg-transparent file:px-10 file:py-1 file:text-white file:mr-3 hover:file:bg-[#707F8C] disabled:opacity-50'
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) console.log('CSV sélectionné :', file)
              }}
            />
          </div>
          <button type="button" onClick={savePromo} disabled={loading || deletingGroup !== null || deletingStudent} className='hover:bg-[#707F8C] border-1 border-gray-900 rounded-md px-10 py-1 w-75'>{loading ? 'Enregistrement…' : 'Enregistrer la promotion'}</button>
        </div>
        <div className='flex flex-1 min-h-0 gap-2 mt-2'>
          <div className='flex-1 bg-gray-400 border-gray-900 p-2 rounded-md overflow-y-auto'>
            <h2 className='text-center text-2xl font-bold'>Groupes</h2>
            {groupDeleteError && <p role="alert" className="mt-3 text-red-200">{groupDeleteError}</p>}
            {deletingGroup !== null && <p role="status">Suppression du groupe {deletingGroup}…</p>}
            <div className='flex justify-between gap-0 flex-col mt-10'>
              {groupsOfPromo.map((thisGroup) => (
                <div className='flex justify-between gap-2 p-2' key={thisGroup}>
                  <button className='border-1 border-gray-900 hover:bg-[#9FACB2] rounded-md w-full h-[25px]'>{thisGroup}</button>
                  <button type="button" onClick={() => {
                    setGroupToDelete(thisGroup)
                    setGroupDeleteError('')
                    dialogConfirmGroup.current?.showModal()
                  }} disabled={deletingGroup !== null || deletingStudent} aria-label={`Supprimer le groupe ${thisGroup}`} className='flex items-center justify-center px-2 py-1 h-[25px] border-1 border-gray-900 rounded-md hover:bg-[#9FACB2] disabled:opacity-50'>
                    <img className='w-4 h-4 invert-[90%]' src="/trash.svg" alt="" />
                  </button>
                </div>
              ))}
              {addingGroup && (
                <div className="flex justify-between gap-2 p-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nom du groupe"
                    aria-label="Nom du nouveau groupe"
                    value={newGroupName}
                    onChange={(event) => setNewGroupName(event.target.value)}
                    className="border-1 border-gray-900 rounded-md w-full px-2 h-[30px]"
                  />
                  <button type="button" onClick={validateNewGroup} aria-label="Valider le nouveau groupe" className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md px-2 py-1 w-10 h-[30px]'><img src="/valid.png" alt="" className='invert-[90%]'/></button>
                  <button type="button" onClick={cancelAddingGroup} aria-label="Annuler l’ajout du groupe" className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md px-2 py-1 w-10 h-[30px]'><img src="/cross.png" alt="" className='invert-[90%]'/></button>
                </div>
              )}
              <div className='p-2'><button onClick={() => setAddingGroup(true)} className='flex justify-between hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full px-5 font-bold'><p>+</p><p>Ajouter un groupe</p><p>+</p></button></div>
            </div>
          </div>
          <div className='flex-4 bg-gray-400 border-gray-900 p-2 rounded-md overflow-y-auto'>
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
                        <tr key={student.id} data-student-row data-student-id={student.id}>
                          <td className='px-2'>
                            <input type="text" name="firstName" defaultValue={student.firstName} className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full px-2 h-[25px]' />
                          </td>
                          <td className='px-2'>
                            <input type="text" name="lastName" defaultValue={student.lastName} className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full px-2 h-[25px]' />
                          </td>
                          <td className='px-2'>
                            <select name="groupName" defaultValue={student.groupName} aria-label="Groupe de l’élève" className="border border-gray-900 rounded-md w-full px-2 h-[25px] hover:bg-[#9FACB2]">
                              {groupsOfPromo.map((group) => <option key={group} value={group}>{group}</option>)}
                            </select>
                          </td>
                          <td className='px-2'>
                            <smart-drop-down-list selection-mode="checkBox" placeholder="Aménagements" aria-label={`Aménagements de ${student.firstName} ${student.lastName}`} className="amenities-dropdown max-w-full">
                              <smart-list-item value="1" selected={student.needsPowerOutlet}>Prise Electrique</smart-list-item>
                              <smart-list-item value="2" selected={student.extraTime ?? false}>PMR</smart-list-item>
                              <smart-list-item value="3" selected={student.extraTime ?? false}>Tiers-Temps</smart-list-item>
                            </smart-drop-down-list>
                          </td>
                          <td>
                            <div onClick={() => {setDeletingStudentId(student.id), setError(''), dialogConfirmStudent.current?.showModal()}} className='flex items-center justify-center px-2 py-1 border-1 border-gray-900 rounded-md hover:bg-[#9FACB2]'>
                              <img src="/trash.svg" alt="Supprimer un élève" className='invert-[90%]'/>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {studentDrafts.filter((draft) => draft.groupName === thisGroup).map((draft) => (
                      <tr key={draft.id} data-student-row>
                        <td className='px-2'>
                          <input name="firstName" type="text" className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full px-2 h-[25px]' />
                        </td>
                        <td className='px-2'>
                          <input name="lastName" type="text" className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full px-2 h-[25px]' />
                        </td>
                        <td className='px-2'>
                          <select name="groupName" defaultValue={thisGroup} aria-label={`Groupe`} className='hover:bg-[#9FACB2] border-1 border-gray-900  rounded-md w-full px-3 h-[25px]'>
                            {groupsOfPromo.map((thisGroup) => (
                              <option key={thisGroup} value={thisGroup}>{thisGroup}</option>
                            ))}
                          </select>
                        </td>
                        <td className='px-2'>
                          <smart-drop-down-list selection-mode="checkBox" placeholder="Aménagements" aria-label={`Aménagements`} className="amenities-dropdown max-w-full">
                            <smart-list-item value="1">PMR</smart-list-item>
                            <smart-list-item value="2">Prise Electrique</smart-list-item>
                            <smart-list-item value="3">Tiers-Temps</smart-list-item>
                          </smart-drop-down-list>
                        </td>
                        <td>
                          <div className='flex items-center justify-center px-2 py-1 border-1 border-gray-900 rounded-md hover:bg-[#9FACB2]'><img src="/trash.svg" onClick={() => setStudentDrafts((drafts) => drafts.filter((item) => item.id !== draft.id))} alt="Supprimer un élève" className='invert-[90%]'/></div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={5} className='px-2'>
                        <button onClick={() => {
                          const draft = { id: crypto.randomUUID(), groupName: thisGroup }
                          setStudentDrafts((drafts) => [...drafts, draft])
                        }} type="button" className='hover:bg-[#9FACB2] border-1 border-gray-900 rounded-md w-full cursor-pointer'>+</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </fieldset>
    </dialog>

    {/* Dialog confirm del promo*/}
    <dialog ref={dialogConfirmPromo} onClose={resetDialog} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-900'>
        <div className='flex justify-between'>
          <div>
            <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cette promotion ?</h1>
            <h2>Cette action est définitive.</h2>
            <div className='pt-5 flex gap-5'>
              <button type="button" onClick={deletePromo} className='border-2 border-gray-300 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Supprimer</button>
              <button type="button" onClick={() => dialogConfirmPromo.current?.close()} className='border-2 border-gray-300 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
            </div>
          </div>
          <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
        </div>
      </div>
    </dialog>

    {/* Dialog confirm del etudiant*/}
    <dialog ref={dialogConfirmStudent} onCancel={(event) => { if (deletingStudent) event.preventDefault() }} onClose={() => { setDeletingStudentId(null); resetDialog() }} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-900'>
        <div className='flex justify-between'>
          <div>
            <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cet étudiant ?</h1>
            <h2>Cette action est définitive.</h2>
            {error && <p role="alert" className="mt-3 text-red-200">{error}</p>}
            <div className='pt-5 flex gap-5'>
              <button type="button" onClick={deleteStudents} disabled={deletingStudent || deletingStudentId === null} className='border-2 border-gray-900 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>{deletingStudent ? 'Suppression…' : 'Supprimer'}</button>
              <button type="button" disabled={deletingStudent} onClick={() => dialogConfirmStudent.current?.close()} className='border-2 border-gray-900 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
            </div>
          </div>
          <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
        </div>
      </div>
    </dialog>

    {/* Dialog confirm del groupes*/}
    <dialog ref={dialogConfirmGroup} onCancel={(event) => { if (groupDeleteInProgress.current) event.preventDefault() }} onClose={() => { setGroupToDelete(null); setGroupDeleteError('') }} className="m-auto w-[45%] h-[25%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        <div className='flex justify-between'>
          <div>
            <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer le groupe « {groupToDelete} » ? Tous les étudiants de ce groupe seront également supprimés.</h1>
            <h2>Cette action est définitive.</h2>
            {groupDeleteError && <p role="alert" className="mt-3 text-red-200">{groupDeleteError}</p>}
            <div className='pt-5 flex gap-5'>
              <button type="button" onClick={() => { if (groupToDelete !== null) void deleteGroup(groupToDelete) }} disabled={deletingGroup !== null || groupToDelete === null} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>{deletingGroup !== null ? 'Suppression…' : 'Supprimer'}</button>
              <button type="button" disabled={deletingGroup !== null} onClick={() => dialogConfirmGroup.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
            </div>
          </div>
          <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
        </div>
      </div>
    </dialog>

    {/* Dialog chargement */}
    <dialog ref={dialogChargement} onClose={resetDialog} className="m-auto w-[20%] h-[15%] rounded-md bg-transparent backdrop:bg-black/50">
      <div className='flex flex-col justify-center w-full h-full bg-gray-500 text-white p-5 rounded-3xl border-2 border-gray-700'>
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
