import { useEffect, useState } from 'react'

// ---------- Types : ils reprennent les JSON du backend ----------
interface Promo {
  id: number
  name: string
}

interface Room {
  id: string
  name: string
  rows: number
  columns: number
  usableSeatCount: number
}

interface Placement {
  studentId: number
  firstName: string
  lastName: string
  group: string
  roomId: string | null
  roomName: string | null
  seatId: string
  row: number
  column: number
}

interface Plan {
  id: string
  name: string
  promoId: number
  promoName: string
  roomIds: string[]
  feasible: boolean
  hardScore: number
  softScore: number
  createdAt: string
  placements: Placement[]
}

interface PlanSummary {
  id: string
  name: string
  promoName: string
  studentCount: number
  feasible: boolean
  createdAt: string
}

// Lit le message d'erreur du backend, qu'il soit en JSON ({ message }) ou en texte brut
async function readError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    return JSON.parse(text).message ?? text
  } catch {
    return text || 'Erreur ' + res.status
  }
}

// Une couleur stable par groupe (G1A, G1B...) pour repérer les voisins du même groupe
function groupColor(group: string): string {
  let hash = 0
  for (const c of group) hash = (hash * 31 + c.charCodeAt(0)) % 360
  return `hsl(${hash}, 60%, 80%)`
}

function PlanTestPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [plans, setPlans] = useState<PlanSummary[]>([])

  const [name, setName] = useState('')
  const [promoId, setPromoId] = useState('')
  const [roomIds, setRoomIds] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastRequest, setLastRequest] = useState('')
  const [lastStatus, setLastStatus] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)

  async function loadLists() {
    try {
      const [p, r, pl] = await Promise.all([
        fetch('/api/promos'),
        fetch('/api/rooms'),
        fetch('/api/plans'),
      ])
      if (p.ok) setPromos(await p.json())
      if (r.ok) setRooms(await r.json())
      if (pl.ok) setPlans(await pl.json())
    } catch (err) {
      console.error('Erreur de chargement', err)
    }
  }

  useEffect(() => {
    loadLists()
  }, [])

  function toggleRoom(id: string) {
    setRoomIds((current) => (current.includes(id) ? current.filter((r) => r !== id) : [...current, id]))
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = { name, promoId: promoId === '' ? null : Number(promoId), roomIds }
    setLastRequest(`POST /api/plans\n${JSON.stringify(body, null, 2)}`)

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setLastStatus(`${res.status} ${res.statusText}`)
      if (!res.ok) throw new Error(await readError(res))
      setPlan(await res.json())
      await loadLists()
    } catch (err) {
      console.error(err)
      setPlan(null)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function openPlan(id: string) {
    setError('')
    setLastRequest(`GET /api/plans/${id}`)
    try {
      const res = await fetch(`/api/plans/${id}`)
      setLastStatus(`${res.status} ${res.statusText}`)
      if (!res.ok) throw new Error(await readError(res))
      setPlan(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function deletePlan(id: string) {
    setError('')
    setLastRequest(`DELETE /api/plans/${id}`)
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' })
      setLastStatus(`${res.status} ${res.statusText}`)
      if (!res.ok) throw new Error(await readError(res))
      if (plan?.id === id) setPlan(null)
      await loadLists()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const chosenCapacity = rooms.filter((r) => roomIds.includes(r.id)).reduce((sum, r) => sum + r.usableSeatCount, 0)

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-[#4D4D4D]">
      <h1 className="text-center text-3xl pb-2">Page de test : génération de plan</h1>
      <p className="text-center text-sm pb-8">Page jetable pour tester <code>/api/plans</code>. Elle n'a pas besoin d'être mergée.</p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ---------- Formulaire ---------- */}
        <form onSubmit={generate} className="flex flex-col gap-4 rounded-xl bg-gray-200 p-5">
          <h2 className="text-xl">1. Créer un plan</h2>

          <label className="flex flex-col gap-1">
            Nom du plan
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="DS de maths"
              className="rounded-md border border-gray-400 bg-white px-2 py-1" />
          </label>

          <label className="flex flex-col gap-1">
            Promo (une seule)
            <select value={promoId} onChange={(e) => setPromoId(e.target.value)}
              className="rounded-md border border-gray-400 bg-white px-2 py-1">
              <option value="">-- choisir --</option>
              {promos.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <fieldset className="flex flex-col gap-1">
            <legend className="pb-1">Salles (une ou plusieurs)</legend>
            {rooms.length === 0 && <p className="text-sm">Aucune salle : crée-en une sur la page « Mes salles ».</p>}
            {rooms.map((r) => (
              <label key={r.id} className="flex items-center gap-2">
                <input type="checkbox" checked={roomIds.includes(r.id)} onChange={() => toggleRoom(r.id)} />
                {r.name} <span className="text-sm">({r.usableSeatCount} places utilisables, {r.rows}×{r.columns})</span>
              </label>
            ))}
            <p className="pt-1 text-sm">Total des salles choisies : {chosenCapacity} places</p>
          </fieldset>

          <button type="submit" disabled={loading}
            className="rounded-md bg-[#691111] px-4 py-2 text-white hover:bg-[#7A1B1B] disabled:opacity-50">
            {loading ? 'Calcul en cours...' : 'Générer le plan'}
          </button>

          {error && <p className="rounded-md bg-red-100 p-2 text-red-800">{error}</p>}
        </form>

        {/* ---------- Plans existants + dernière requête ---------- */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-gray-200 p-5">
            <h2 className="pb-2 text-xl">2. Plans enregistrés</h2>
            {plans.length === 0 && <p className="text-sm">Aucun plan pour l'instant.</p>}
            <ul className="flex flex-col gap-2">
              {plans.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2">
                  <button type="button" onClick={() => openPlan(p.id)} className="text-left hover:underline">
                    <strong>{p.name}</strong> · {p.promoName} · {p.studentCount} étudiants {p.feasible ? '✅' : '⚠️'}
                  </button>
                  <button type="button" onClick={() => deletePlan(p.id)} className="text-sm text-red-700 hover:underline">
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-gray-200 p-5">
            <h2 className="pb-2 text-xl">Dernière requête</h2>
            {lastRequest ? (
              <>
                <pre className="overflow-auto rounded-md bg-white p-2 text-sm">{lastRequest}</pre>
                <p className="pt-2 text-sm">Réponse : <strong>{lastStatus}</strong></p>
              </>
            ) : (
              <p className="text-sm">Rien envoyé pour l'instant.</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Résultat ---------- */}
      {plan && (
        <div className="mt-8 rounded-xl bg-gray-200 p-5">
          <h2 className="text-xl">3. Résultat : {plan.name}</h2>
          <p className="pb-4 text-sm">
            Promo {plan.promoName} · {plan.placements.length} étudiants ·{' '}
            {plan.feasible ? '✅ toutes les règles sont respectées' : '⚠️ règles non respectées'} ·
            score {plan.hardScore}hard / {plan.softScore}soft
          </p>

          {plan.roomIds.map((roomId) => {
            const room = rooms.find((r) => r.id === roomId)
            const here = plan.placements.filter((p) => p.roomId === roomId)
            return (
              <div key={roomId} className="pb-6">
                <h3 className="pb-2 text-lg">Salle {room?.name ?? roomId} ({here.length} étudiants)</h3>
                {room ? (
                  <div className="overflow-auto rounded-md bg-white p-4">
                    <div className="grid w-max gap-1"
                      style={{ gridTemplateColumns: `repeat(${room.columns}, 4rem)`, gridTemplateRows: `repeat(${room.rows}, 4rem)` }}>
                      {/* les places sans étudiant et les trous restent vides */}
                      {Array.from({ length: room.rows * room.columns }, (_, i) => {
                        const row = Math.floor(i / room.columns)
                        const column = i % room.columns
                        const p = here.find((x) => x.row === row && x.column === column)
                        return (
                          <div key={i}
                            title={p ? `${p.firstName} ${p.lastName} (${p.group})` : undefined}
                            style={{ background: p ? groupColor(p.group) : undefined }}
                            className={'flex h-16 w-16 flex-col items-center justify-center rounded-md text-xs ' +
                              (p ? '' : 'border border-dashed border-gray-300')}>
                            {p && (
                              <>
                                <span className="font-bold">{p.firstName.charAt(0)}. {p.lastName.slice(0, 6)}</span>
                                <span>{p.group}</span>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">Salle introuvable dans la liste (rechargé ?).</p>
                )}
              </div>
            )
          })}

          <details>
            <summary className="cursor-pointer text-sm">JSON reçu du backend</summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-white p-2 text-xs">{JSON.stringify(plan, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default PlanTestPage
