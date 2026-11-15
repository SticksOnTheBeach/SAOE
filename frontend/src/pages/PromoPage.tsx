import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { readError } from '../api/http'

interface Promo {
  id: number
  name: string
}

// A group and the promotion it belongs to (GET /api/groups): G1A..G3B = BUT1, G4A..G6B = BUT2, G7A..G8B = BUT3
interface GroupInfo {
  code: string
  promo: string
}

// A particularity of a student (mobilité réduite, ordinateur, tiers temps...).
// The list comes from the backend (GET /api/particularities): adding one never requires a change here.
interface Particularity {
  id: string
  label: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  groupName: string
  particularities: Particularity[]
  promo: Promo | null
}


// What the user typed for one student, not saved yet
interface Draft {
  firstName: string
  lastName: string
  groupName: string
  particularityIds: string[]
}

const sameIds = (a: string[], b: string[]) => [...a].sort().join() === [...b].sort().join()

const PromoPage = () => {
  const navigate = useNavigate()
  const [promos, setPromos] = useState<Promo[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [particularities, setParticularities] = useState<Particularity[]>([])
  const [allGroups, setAllGroups] = useState<GroupInfo[]>([])
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
  const [openingForm, setOpeningForm] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const dialogConfirmEmpty = useRef<HTMLDialogElement>(null)
  const [newPromoName, setNewPromoName] = useState('')
  // unsaved changes, by student id (only the students the user touched)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})

  function baseDraft(student: Student): Draft {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      groupName: student.groupName,
      particularityIds: (student.particularities ?? []).map((p) => p.id),
    }
  }

  function draftOf(student: Student): Draft {
    return drafts[student.id] ?? baseDraft(student)
  }

  function updateDraft(student: Student, change: (d: Draft) => Draft) {
    setDrafts((prev) => ({ ...prev, [student.id]: change(prev[student.id] ?? baseDraft(student)) }))
  }

  function isDirty(student: Student) {
    const d = drafts[student.id]
    return !!d && (
        d.firstName !== student.firstName ||
        d.lastName !== student.lastName ||
        d.groupName !== student.groupName ||
        !sameIds(d.particularityIds, (student.particularities ?? []).map((p) => p.id))
    )
  }

  const dirtyStudents = students.filter(isDirty)

  function bindParticularities(student: Student) {
    return (el: Element | null) => {
      if (!el) return
      const box = el as HTMLElement & { selectedValues?: string[]; __onParticularities?: EventListener }
      if (box.__onParticularities) box.removeEventListener('change', box.__onParticularities)
      box.__onParticularities = (ev: Event) => {
        if (!(ev as CustomEvent).detail) return   // native change events bubbling from inside the component
        const selected = box.selectedValues
        if (!Array.isArray(selected)) return
        updateDraft(student, (d) => ({ ...d, particularityIds: selected.map(String) }))
      }
      box.addEventListener('change', box.__onParticularities)
    }
  }

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

  function showGroups(promo: Promo, list: Student[] = students) {
    const groups: string[] = []
    for (const student of list) {
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
    setNewPromoName('')
  }

  // closing the edit dialog throws the unsaved changes away
  function closeEditDialog() {
    resetDialog()
    setDrafts({})
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

  async function fetchParticularities() {
    try {
      const res = await fetch('/api/particularities')
      if (res.ok) {
        setParticularities(await res.json())
      }
    } catch (err) {
      console.error('Erreur lors du chargement des particularités : ', err)
    }
  }

  async function fetchGroups() {
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        setAllGroups(await res.json())
      }
    } catch (err) {
      console.error('Erreur lors du chargement des groupes : ', err)
    }
  }

  async function fetchStudentCounts(): Promise<Student[] | null> {
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
        return data
      }
    } catch (err) {
      console.error("Erreur lors du chargement des étudiants : ", err)
    }
    return null
  }

  useEffect(() => {
    fetchPromos()
    fetchStudentCounts()
    fetchParticularities()
    fetchGroups()
  }, [])

  async function deletePromo() {
    if (!deletingId) return
    setDeleteError('')
    // The user already confirmed in the dialog: a promo that contains students is deleted with them.
    // Without the flag the backend answers 409, which also protects against a stale student count.
    const withStudents = (studentCounts[deletingId] ?? 0) > 0
    try {
      const res = await fetch(`/api/promos/${deletingId}${withStudents ? '?withStudents=true' : ''}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchPromos()
        await fetchStudentCounts()
      } else {
        // e.g. 409: students were added since the page was loaded
        setDeleteError(await readError(res))
      }
    } catch (err) {
      console.error('Erreur lors de la suppression : ', err)
    } finally {
      setDeletingId(null)
      dialogConfirmPromo.current?.close()
    }
  }

  // The CSV carries the promotion of each student: the backend finds or creates the promotions by name
  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''   // lets the user pick the same file again
    if (!file) return

    setImportError('')
    setImportMessage('')
    setImporting(true)
    try {
      // no Content-Type header here: the browser sets it (with the multipart boundary)
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/students/import', {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const imported: Student[] = await res.json()
        await fetchPromos()
        await fetchStudentCounts()
        const promoCount = new Set(imported.map((s) => s.promo?.id)).size
        setImportMessage(`${imported.length} étudiant(s) importé(s) dans ${promoCount} promotion(s)`)
      } else {
        setImportError(await readError(res))
      }
    } catch (err) {
      console.error("Erreur lors de l'import : ", err)
      setImportError('Le serveur ne répond pas')
    } finally {
      setImporting(false)
    }
  }

  // fonction qui VIDE une promo de ses étudiants
  async function emptyPromo() {
    if (!selectedPromo) return
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/promos/${selectedPromo.id}/students`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchStudentCounts()
        setGroupsOfPromo([])
        setMessage('Promotion vidée')
      } else {
        setError(await readError(res))
      }
    } catch (err) {
      console.error('Erreur lors du vidage de la promotion : ', err)
      setError('Le serveur ne répond pas')
    } finally {
      dialogConfirmEmpty.current?.close()
    }
  }

  async function deleteStudent() {
    if (!deletingStudent || !selectedPromo) return
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/students/${deletingStudent.id}`, { method: 'DELETE' })
      if (res.ok) {
        // the student is gone: forget his unsaved changes, then reload the list and the groups
        setDrafts((prev) => {
          const next = { ...prev }
          delete next[deletingStudent.id]
          return next
        })
        const data = await fetchStudentCounts()
        if (data) setGroupsOfPromo(showGroups(selectedPromo, data))
        setMessage(`${deletingStudent.firstName} ${deletingStudent.lastName} supprimé(e)`)
      } else {
        setError(await readError(res))
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'étudiant : ", err)
      setError('Le serveur ne répond pas')
    } finally {
      setDeletingStudent(null)
      dialogConfirmStudent.current?.close()
    }
  }

  // edit mode: sends one PUT per modified student
  async function saveStudents() {
    if (!selectedPromo || dirtyStudents.length === 0) return
    const blank = dirtyStudents.some((s) => !drafts[s.id].firstName.trim() || !drafts[s.id].lastName.trim())
    if (blank) {
      setError('Le prénom et le nom sont obligatoires')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const saved: string[] = []
      const failures: string[] = []
      for (const student of dirtyStudents) {
        const d = drafts[student.id]
        const res = await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: d.firstName.trim(),
            lastName: d.lastName.trim(),
            groupName: d.groupName,
            particularityIds: d.particularityIds,
          }),
        })
        if (res.ok) {
          saved.push(student.id)
        } else {
          failures.push(`${d.firstName} ${d.lastName} : ${await readError(res)}`)
        }
      }
      // keep the drafts of the students that failed, so nothing typed is lost
      setDrafts((prev) => {
        const next = { ...prev }
        for (const id of saved) delete next[id]
        return next
      })
      const data = await fetchStudentCounts()
      if (data) setGroupsOfPromo(showGroups(selectedPromo, data))
      if (failures.length > 0) setError(failures.join(' | '))
      if (saved.length > 0) setMessage(`${saved.length} étudiant(s) modifié(s)`)
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des étudiants : ", err)
      setError('Le serveur ne répond pas')
    } finally {
      setLoading(false)
    }
  }

  async function savePromo() {
    if (selectedPromo) return   // edit mode: see saveStudents
    const name = newPromoName.trim()
    if (!name) {
      setError('Le nom de la promotion est obligatoire')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const created: Promo = await res.json()
        await fetchPromos()
        // the dialog switches to edit mode, so a CSV can be imported right away
        setSelectedPromo(created)
        setEditingId(true)
        setNewPromoName('')
        setMessage(`Promotion ${created.name} créée : tu peux importer un CSV`)
      } else {
        setError(await readError(res))
      }
    } catch (err) {
      console.error('Erreur lors de la création de la promotion : ', err)
      setError('Le serveur ne répond pas')
    } finally {
      setLoading(false)
    }
  }

  // the groups a student of the selected promotion can be moved to (all the groups of the promotion, even empty ones)
  const groupChoices = selectedPromo
      ? allGroups.filter((g) => g.promo.toLowerCase() === selectedPromo.name.toLowerCase()).map((g) => g.code)
      : []

  // number of students of the promo the user is about to delete (shown in the confirmation dialog)
  const deletingCount = deletingId ? (studentCounts[deletingId] ?? 0) : 0

  return (
      <div>
        {/* Page */}
        <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Gestion des promotions</h1>
        <div className='flex flex-col items-center pb-8'>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={importing}
                  className='cursor-pointer bg-gray-200 hover:bg-gray-300 text-black px-10 py-2 '>{importing ? 'Import en cours…' : 'Importer un CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importCsv} className="hidden" />
          <p className='mt-2 text-sm text-[#4D4D4D]'>Format : Prénom;Nom;Groupe;Promotion;Particularité 1;Particularité 2</p>
          {importMessage && <p className='mt-2 font-bold text-green-700'>{importMessage}</p>}
          {importError && <p className='mt-2 font-bold text-red-600'>{importError}</p>}
        </div>
        {deleteError && <p className='pb-4 text-center font-bold text-red-600'>{deleteError}</p>}
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
                    <img onClick={(e) => { e.stopPropagation(); setDeletingId(promo.id); setDeleteError(''); dialogConfirmPromo.current?.showModal() }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400'/>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Dialog modif promo */}
        {/* The "Aménagements" dropdown fires its own bubbling "close" event: only the dialog's own close counts */}
        <dialog ref={dialogRef} onClose={(e) => { if (e.target === e.currentTarget) closeEditDialog() }} className="m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
          <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
            <div className='flex justify-between mb-5'>
              <h2 className='justify-self-center text-center text-4xl whitespace-nowrap'>{editingId ? 'Modification de la promotion' : 'Outil de création de la promotion'}</h2>
              <img onClick={() => dialogRef.current?.close()} src="/x-circle-fill.svg" alt="" className='justify-self-end block w-7 h-auto invert cursor-pointer'/>
            </div>
            <div className='flex justify-between'>
              <button type="button" onClick={() => dialogConfirmEmpty.current?.showModal()}
                      disabled={loading || !selectedPromo || (studentCounts[selectedPromo.id] ?? 0) === 0}
                      title={!selectedPromo ? "Enregistre d'abord la promotion" : (studentCounts[selectedPromo.id] ?? 0) === 0 ? 'La promotion est déjà vide' : ''}
                      className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1 w-75 disabled:opacity-50'>Vider la promotion</button>
              <button type="button" onClick={selectedPromo ? saveStudents : savePromo}
                      disabled={loading || (!!selectedPromo && dirtyStudents.length === 0)}
                      title={selectedPromo && dirtyStudents.length === 0 ? 'Aucune modification à enregistrer' : ''}
                      className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md px-10 py-1 w-75 disabled:opacity-50'>Enregistrer la promotion</button>
            </div>
            {!selectedPromo && (
                <input type="text" value={newPromoName} onChange={(e) => setNewPromoName(e.target.value)}
                       placeholder="Nom de la promotion (ex : BUT1)" maxLength={50}
                       className='mt-3 w-full border-1 border-gray-300 rounded-md px-3 py-1 hover:bg-[#7A1B1B]' />
            )}
            {error && <p className='mt-2 font-bold text-red-300'>{error}</p>}
            {message && <p className='mt-2 font-bold text-green-300'>{message}</p>}
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
                                    <input type="text" value={draftOf(student).firstName} maxLength={50}
                                           onChange={(e) => updateDraft(student, (d) => ({ ...d, firstName: e.target.value }))}
                                           className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-2' />
                                  </td>
                                  <td className='px-2'>
                                    <input type="text" value={draftOf(student).lastName} maxLength={50}
                                           onChange={(e) => updateDraft(student, (d) => ({ ...d, lastName: e.target.value }))}
                                           className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-2' />
                                  </td>
                                  <td className='px-2'>
                                    <select value={draftOf(student).groupName}
                                            onChange={(e) => updateDraft(student, (d) => ({ ...d, groupName: e.target.value }))}
                                            aria-label={`Groupe de ${student.firstName} ${student.lastName}`} className='hover:bg-[#7A1B1B] border-1 border-gray-300 rounded-md w-full px-3'>
                                      {(groupChoices.length > 0 ? groupChoices : groupsOfPromo).map((thisGroup) => (
                                          <option key={thisGroup} value={thisGroup}>{thisGroup}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className='px-2'>
                                    {/* key: the dropdown does not pick up items added after its creation, so it is rebuilt once the list is loaded */}
                                    <smart-drop-down-list key={`${student.id}:${particularities.length}`} ref={bindParticularities(student)} selection-mode="checkBox" placeholder="Aménagements" aria-label={`Aménagements de ${student.firstName} ${student.lastName}`} className="amenities-dropdown max-w-full">
                                      {particularities.map((p) => (
                                          <smart-list-item key={p.id} value={p.id} selected={(student.particularities ?? []).some((sp) => sp.id === p.id)}>{p.label}</smart-list-item>
                                      ))}
                                    </smart-drop-down-list>
                                  </td>
                                  <td>
                                    <div className='flex items-center justify-center px-2 py-1 border-1 border-gray-300 rounded-md hover:bg-[#7A1B1B]'><img src="/trash.svg" onClick={() => { setDeletingStudent(student); dialogConfirmStudent.current?.showModal() }} alt="Supprimer un élève" className='invert-[90%]'/></div>
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
                <h2>
                  {deletingCount > 0
                      ? `Elle contient ${deletingCount} étudiant(s) : ils seront supprimés avec elle. Cette action est définitive.`
                      : 'Cette action est définitive.'}
                </h2>
                <div className='pt-5 flex gap-5'>
                  <button type="button" onClick={deletePromo} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>
                    {deletingCount > 0 ? 'Supprimer avec les étudiants' : 'Supprimer'}
                  </button>
                  <button type="button" onClick={() => dialogConfirmPromo.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
                </div>
              </div>
              <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
            </div>
          </div>
        </dialog>

        {/* Dialog confirm empty promo (no onClose={resetDialog}: it would erase the result message) */}
        <dialog ref={dialogConfirmEmpty} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
          <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
            <div className='flex justify-between'>
              <div>
                <h1 className='text-2xl'>Vider la promotion {selectedPromo?.name} ?</h1>
                <h2>Les {selectedPromo ? (studentCounts[selectedPromo.id] ?? 0) : 0} étudiant(s) seront supprimés. La promotion est conservée. Cette action est définitive.</h2>
                <div className='pt-5 flex gap-5'>
                  <button type="button" onClick={emptyPromo} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Vider</button>
                  <button type="button" onClick={() => dialogConfirmEmpty.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
                </div>
              </div>
              <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
            </div>
          </div>
        </dialog>

        {/* Dialog chargement (no onClose: it closes itself right after the form opens) */}
        <dialog ref={dialogChargement} className="m-auto w-[20%] h-[15%] rounded-md bg-transparent backdrop:bg-black/50">
          <div className='flex flex-col justify-center w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
            <div className='flex items-center justify-between'>
              <h1 className='text-4xl'>Chargement</h1>
              <img src="/loading.gif" alt="" className='w-17 h-auto invert mix-blend-screen'/>
            </div>
          </div>
        </dialog>

        {/* Dialog confirm del */}
        {/* (no onClose={resetDialog}: it would erase the result message) */}
        <dialog ref={dialogConfirmStudent} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
          <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
            <div className='flex justify-between'>
              <div>
                <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer {deletingStudent ? `${deletingStudent.firstName} ${deletingStudent.lastName}` : 'cet étudiant'} ?</h1>
                <h2>Cette action est définitive.</h2>
                <div className='pt-5 flex gap-5'>
                  <button type="button" onClick={deleteStudent} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Supprimer</button>
                  <button type="button" onClick={() => dialogConfirmStudent.current?.close()} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
                </div>
              </div>
              <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
            </div>
          </div>
        </dialog>
      </div>
  )
};

export default PromoPage