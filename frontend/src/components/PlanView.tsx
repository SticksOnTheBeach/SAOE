import { createPortal } from 'react-dom'
import './PlanView.css'

export interface PlanSeat {
  row: number
  column: number
  type: 'AVAILABLE' | 'FORBIDDEN'
}

export interface CreatedPlan {
  name: string
  assignments: { row: number; column: number; studentId: string }[]
}

// Pour dessiner aussi les places vides et les couloirs, la vue complète la réponse du serveur avec la salle.
export interface DisplayPlan extends CreatedPlan {
  room: { name: string; rows: number; columns: number; seats: PlanSeat[] }
  promoName: string
}

export default function PlanView({ plan, names, onBack }: {
  plan: DisplayPlan
  names: Map<string, string>
  onBack: () => void
}) {
  const { room } = plan
  // ligne × nombre de colonnes + colonne donne une clé unique à chaque case, en comptant depuis zéro.
  const labels = new Map<number, string>()
  for (const seat of room.seats) {
    labels.set(seat.row * room.columns + seat.column, seat.type === 'FORBIDDEN' ? 'Interdite' : 'Libre')
  }
  // Sur les places attribuées, le nom de l'étudiant remplace « Libre ». Si son nom manque, son identifiant reste visible.
  for (const assignment of plan.assignments) {
    labels.set(assignment.row * room.columns + assignment.column, names.get(assignment.studentId) || assignment.studentId)
  }

  // Dessine toutes les rangées pour les colonnes de start inclus à end exclu.
  // L'écran demande la salle entière et l'impression demande une bande de colonnes à la fois.
  function grid(start: number, end: number) {
    const columns = Array.from({ length: end - start }, (_, i) => start + i)
    return (
      <table className="placement-grid">
        <caption className="sr-only">Disposition des étudiants dans la salle {room.name}</caption>
        <thead><tr><th scope="col">Rang</th>{columns.map(col => <th key={col} scope="col">Col. {col + 1}</th>)}</tr></thead>
        <tbody>{Array.from({ length: room.rows }, (_, row) => (
          <tr key={row}>
            <th scope="row">{row + 1}</th>
            {columns.map(col => {
              // Une case sans siège correspond à un couloir. sr-only en donne le libellé aux lecteurs d'écran.
              const label = labels.get(row * room.columns + col)
              return <td key={col} className={label === undefined ? 'aisle' : ''}>{label ?? <span className="sr-only">Couloir</span>}</td>
            })}
          </tr>
        ))}</tbody>
      </table>
    )
  }

  const heading = <><h1 className="text-2xl font-bold">{plan.name}</h1><p>Salle {room.name} · Promotion {plan.promoName} · {plan.assignments.length} étudiant(s)</p></>
  return (
    <section className="p-5">
      {heading}
      <div className="my-4 flex flex-wrap gap-3">
        <button className="rounded-md border px-4 py-2" onClick={onBack}>Retour aux salles</button>
        {/* Le navigateur ouvre son menu d'impression, où l'utilisateur peut choisir « Enregistrer en PDF ». */}
        <button className="rounded-md bg-gray-700 px-4 py-2 text-white" onClick={() => window.print()}>Imprimer / Enregistrer en PDF</button>
      </div>
      <div className="overflow-auto">{grid(0, room.columns)}</div>
      {/* Le portail place la version imprimable directement dans le body. Le CSS peut ainsi masquer toute l'interface autour du plan. */}
      {createPortal(<div className="placement-print">
        {/* Huit colonnes par bande gardent les noms lisibles sur papier, même pour les grandes salles. */}
        {Array.from({ length: Math.ceil(room.columns / 8) }, (_, i) => (
          <section key={i}>{heading}{grid(i * 8, Math.min(i * 8 + 8, room.columns))}</section>
        ))}
      </div>, document.body)}
    </section>
  )
}
