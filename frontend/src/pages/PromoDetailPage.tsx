import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'

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

// Ce que l'utilisateur est en train de taper, avant enregistrement
interface Draft {
  firstName: string
  lastName: string
  groupName: string
  needsPowerOutlet: boolean
}

// Mirror of the backend Group enum (fr.iutinfo.seatingplan.student.Group)
const GROUPS = [
  'G1A', 'G1B',
  'G2A', 'G2B',
  'G3A', 'G3B',
  'G4A', 'G4B',
  'G5A', 'G5B',
  'G6A', 'G6B',
  'G7A', 'G7B',
  'G8A', 'G8B',
]

function PromoDetailPage() {
  const { id } = useParams()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dialogConfirm = useRef<HTMLDialogElement>(null)
  const [promo, setPromo] = useState<Promo | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [drafts, setDrafts] = useState<Record<number, Draft>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleGroup, setVisibleGroup] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Les advices du backend renvoient un message en texte brut, pas du JSON
  async function readError(res: Response) {
    const body = await res.text().catch(() => '')
    return body.trim() || 'Erreur ' + res.status
  }

  const fetchPromo = useCallback(async () => {
    try {
      const res = await fetch(`/api/promos/${id}`)
      if (!res.ok) {
        throw new Error(await readError(res))
      }
      const data: Promo = await res.json()
      setPromo(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [id])

  // Recharge la liste et repart des valeurs du serveur : les brouillons sont réinitialisés
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/promos/${id}/students`)
      if (!res.ok) {
        throw new Error(await readError(res))
      }
      const data: Student[] = await res.json()
      setStudents(data)
      setDrafts(Object.fromEntries(data.map((student) => [student.id, toDraft(student)])))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [id])

  useEffect(() => {
    setError('')
    setMessage('')
    setVisibleGroup(null)
    fetchPromo()
    fetchStudents()
  }, [id, fetchPromo, fetchStudents])

  // Ctrl+S / Cmd+S enregistre, comme dans un éditeur de texte
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function toDraft(student: Student): Draft {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      groupName: student.groupName ?? GROUPS[0],
      needsPowerOutlet: student.needsPowerOutlet,
    }
  }

  function isDirty(student: Student) {
    const draft = drafts[student.id]
    if (!draft) return false
    const saved = toDraft(student)
    return draft.firstName !== saved.firstName
      || draft.lastName !== saved.lastName
      || draft.groupName !== saved.groupName
      || draft.needsPowerOutlet !== saved.needsPowerOutlet
  }

  function updateDraft(studentId: number, patch: Partial<Draft>) {
    setDrafts((previous) => ({ ...previous, [studentId]: { ...previous[studentId], ...patch } }))
  }

  // Regroupe par le groupe enregistré, pas par le brouillon : une ligne en cours
  // de changement de groupe ne doit pas sauter d'un bloc à l'autre pendant la saisie
  function groupStudents(list: Student[]) {
    const groups = new Map<string, Student[]>()
    for (const student of list) {
      const key = student.groupName ?? 'Sans groupe'
      const group = groups.get(key)
      if (group) {
        group.push(student)
      } else {
        groups.set(key, [student])
      }
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, group]) => ({
        name,
        students: group.sort((a, b) =>
          a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
        ),
      }))
  }

  async function saveAll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const modified = students.filter(isDirty)
    if (modified.length === 0) return

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const failures = await Promise.all(modified.map(async (student) => {
        const draft = drafts[student.id]
        const res = await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            groupName: draft.groupName,
            needsPowerOutlet: draft.needsPowerOutlet,
          }),
        })
        return res.ok ? null : `${draft.lastName} ${draft.firstName} : ${await readError(res)}`
      }))

      const errors = failures.filter((failure): failure is string => failure !== null)
      await fetchStudents()

      if (errors.length > 0) {
        setError(errors.join(' — '))
      } else {
        setMessage(`${modified.length} étudiant${modified.length > 1 ? 's' : ''} enregistré${modified.length > 1 ? 's' : ''}`)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function cancelChanges() {
    setDrafts(Object.fromEntries(students.map((student) => [student.id, toDraft(student)])))
    setMessage('')
    setError('')
  }

  async function deleteStudent() {
    if (deletingId === null) return

    setMessage('')
    setError('')

    try {
      const res = await fetch(`/api/students/${deletingId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(await readError(res))
      }
      await fetchStudents()
      setMessage('Étudiant supprimé')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setDeletingId(null)
      dialogConfirm.current?.close()
    }
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/students/import?promoId=${id}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(await readError(res))
      }
      const imported: Student[] = await res.json()
      await fetchStudents()
      setMessage(`${imported.length} étudiant${imported.length > 1 ? 's' : ''} importé${imported.length > 1 ? 's' : ''}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
      // Permet de réimporter le même fichier juste après
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const groups = groupStudents(students)
  const visibleGroups = visibleGroup === null ? groups : groups.filter((group) => group.name === visibleGroup)
  const dirtyCount = students.filter(isDirty).length
  const dirtyGroups = new Set(students.filter(isDirty).map((student) => student.groupName))

  return (
    <div className='bg-white min-h-[calc(100vh-10rem)]'>
      <div className='flex items-center justify-between gap-5 px-10 pt-5'>
        <Link to="/Promo" className='text-[#4D4D4D] hover:underline whitespace-nowrap'>&larr; Mes promos</Link>
        <h1 className='text-4xl text-center text-[#4D4D4D]'>Promotion {promo?.name ?? '...'}</h1>
        <div className='flex gap-3'>
          <input ref={fileInputRef} onChange={importCsv} type="file" accept=".csv,text/csv" id="csv" className='hidden'/>
          <label htmlFor="csv" className='cursor-pointer border-1 border-gray-400 text-[#4D4D4D] rounded-md px-5 py-2 hover:bg-gray-200 whitespace-nowrap'>Importer un CSV</label>
        </div>
      </div>

      <div className='px-10 pt-3 min-h-10'>
        {loading && (
          <p className='text-[#4D4D4D]'>Chargement...</p>
        )}
        {error && (
          <p className='text-red-700 font-bold'>{error}</p>
        )}
        {message && (
          <p className='text-green-700'>{message}</p>
        )}
      </div>

      <div className='flex gap-10 px-10 pb-10 pt-3'>
        <aside className='w-60 shrink-0'>
          <h2 className='text-2xl text-[#4D4D4D] pb-1'>Groupes</h2>
          <p className='text-sm text-[#4D4D4D] pb-4'>
            {students.length} étudiant{students.length > 1 ? 's' : ''} &middot; {groups.length} groupe{groups.length > 1 ? 's' : ''}
          </p>
          <ul className='flex flex-col gap-1'>
            <li>
              <button type="button" onClick={() => setVisibleGroup(null)} className={`w-full text-left px-3 py-2 rounded-md text-[#4D4D4D] hover:bg-gray-200 ${visibleGroup === null ? 'bg-gray-200 font-bold' : ''}`}>
                Tous les groupes
              </button>
            </li>
            {groups.map((group) => (
              <li key={group.name}>
                <button type="button" onClick={() => setVisibleGroup(group.name)} className={`w-full flex justify-between px-3 py-2 rounded-md text-[#4D4D4D] hover:bg-gray-200 ${visibleGroup === group.name ? 'bg-gray-200 font-bold' : ''}`}>
                  <span>{group.name} {dirtyGroups.has(group.name) && <span title="Modifications non enregistrées" className='text-orange-600'>&bull;</span>}</span>
                  <span className='text-sm'>{group.students.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <form ref={formRef} onSubmit={saveAll} className='flex-1 min-w-0'>
          <div className='sticky top-0 z-10 flex items-center justify-between gap-5 bg-white border-b-1 border-gray-300 pb-3'>
            <p className='text-[#4D4D4D]'>
              {dirtyCount === 0
                ? 'Modifiez les lignes directement, puis enregistrez (Ctrl+S)'
                : `${dirtyCount} modification${dirtyCount > 1 ? 's' : ''} non enregistrée${dirtyCount > 1 ? 's' : ''}`}
            </p>
            <div className='flex gap-3'>
              <button type="button" onClick={cancelChanges} disabled={dirtyCount === 0} className='border-1 border-gray-400 text-[#4D4D4D] rounded-md px-5 py-1 hover:bg-gray-200 disabled:opacity-40'>Annuler</button>
              <button type="submit" disabled={loading || dirtyCount === 0} className='border-1 border-gray-400 text-[#4D4D4D] rounded-md px-5 py-1 hover:bg-gray-200 disabled:opacity-40'>Enregistrer</button>
            </div>
          </div>

          {students.length === 0 && (
            <p className='text-[#4D4D4D] pt-10'>Aucun étudiant dans cette promotion. Importez un CSV pour commencer.</p>
          )}

          {visibleGroups.map((group) => (
            <section key={group.name} className='pt-8'>
              <h3 className='text-xl text-[#4D4D4D] pb-2'>
                {group.name} <span className='text-sm'>({group.students.length} étudiant{group.students.length > 1 ? 's' : ''})</span>
              </h3>

              <div className='grid grid-cols-[1fr_1fr_6rem_4rem_2.5rem] gap-2 text-sm text-gray-500 px-2 pb-1'>
                <span>Nom</span>
                <span>Prénom</span>
                <span>Groupe</span>
                <span className='text-center'>Prise</span>
                <span></span>
              </div>

              <div className='flex flex-col'>
                {group.students.map((student) => {
                  const draft = drafts[student.id] ?? toDraft(student)
                  const dirty = isDirty(student)
                  return (
                    <div key={student.id} className={`grid grid-cols-[1fr_1fr_6rem_4rem_2.5rem] gap-2 items-center px-2 py-1 rounded-md ${dirty ? 'bg-orange-50' : 'hover:bg-gray-100'}`}>
                      <input value={draft.lastName} onChange={(e) => updateDraft(student.id, { lastName: e.target.value })} type="text" aria-label="Nom" className='border-1 border-gray-300 rounded-md px-2 text-[#4D4D4D] bg-white' maxLength={50} required/>
                      <input value={draft.firstName} onChange={(e) => updateDraft(student.id, { firstName: e.target.value })} type="text" aria-label="Prénom" className='border-1 border-gray-300 rounded-md px-2 text-[#4D4D4D] bg-white' maxLength={50} required/>
                      <select value={draft.groupName} onChange={(e) => updateDraft(student.id, { groupName: e.target.value })} aria-label="Groupe" className='border-1 border-gray-300 rounded-md px-1 text-[#4D4D4D] bg-white'>
                        {GROUPS.map((groupName) => (
                          <option key={groupName} value={groupName}>{groupName}</option>
                        ))}
                      </select>
                      <input checked={draft.needsPowerOutlet} onChange={(e) => updateDraft(student.id, { needsPowerOutlet: e.target.checked })} type="checkbox" aria-label="Besoin d'une prise électrique" title="Besoin d'une prise électrique" className='justify-self-center'/>
                      <img onClick={() => { setDeletingId(student.id); dialogConfirm.current?.showModal() }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-7 h-auto bg-gray-400 p-1.5 rounded-md cursor-pointer hover:border-2 hover:border-gray-500'/>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </form>
      </div>

      <dialog ref={dialogConfirm} className="m-auto w-[45%] h-[20%] rounded-md bg-transparent backdrop:bg-black/50">
        <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
          <div className='flex justify-between'>
            <div>
              <h1 className='text-2xl'>Êtes vous sur(e) de vouloir supprimer cet étudiant ?</h1>
              <h2>Cette action est définitive.</h2>
              <div className='pt-5 flex gap-5'>
                <button type="button" onClick={deleteStudent} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Supprimer</button>
                <button type="button" onClick={() => { setDeletingId(null); dialogConfirm.current?.close() }} className='border-2 border-gray-400 px-5 py-2 rounded-md hover:bg-[#7A1B1B]'>Annuler</button>
              </div>
            </div>
            <img src="/warning.svg" alt="" className='w-25 h-auto invert'/>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default PromoDetailPage
