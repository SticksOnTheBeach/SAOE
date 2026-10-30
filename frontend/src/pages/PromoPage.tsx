import { useEffect, useState } from 'react'
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
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})

  async function fetchPromos() {
    try {
      const res = await fetch('/api/promos')
      if (res.ok) {
        const data: Promo[] = await res.json()
        setPromos(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des promotions : ', err)
    }
  }

  // Un seul appel pour tous les étudiants : il sert à afficher l'effectif de chaque promo
  async function fetchStudentCounts() {
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data: Student[] = await res.json()
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

  return (
  <div>
    <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Gestion des promotions</h1>
    <div className="grid grid-cols-5 gap-10 px-20 pb-10">
        <div className="cursor-pointer flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {promos.map((promo) => (
            <div onClick={() => navigate(`/Promo/${promo.id}`)} key={promo.id} className="cursor-pointer group flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
                <div>
                    <p className="text-4xl text-center text-[#4D4D4D] select-none">{promo.name}</p>
                    <p className="text-l text-center text-[#4D4D4D] select-none">Nombre d'étudiants : {studentCounts[promo.id] ?? 0}</p>
                    <div className="flex justify-between mt-20 invisible group-hover:visible gap-2">
                        <img onClick={(e) => { e.stopPropagation(); }} src="/pen.svg" alt="Modifier" title="Modifier" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400"/>
                        <img onClick={(e) => { e.stopPropagation(); }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400'/>
                    </div>
                </div>
            </div>
        ))}
    </div>
  </div>
  )
}

export default PromoPage
