import { useLocation } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

interface RoomState {
  id?: string
  name: string
  rows: number
  columns: number
}

function ClassDispositionPage() {
  const dialogRefHelp = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  const data = location.state as RoomState | null

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
            {Array.from({ length: Number(data.columns) }, (_, column) => (
              <div key={column} className="flex-1 flex items-center justify-center aspect-square rounded-md bg-gray-200"></div>
            ))}
          </div>
        ))}
      </div>

      <dialog ref={dialogRefHelp} className="m-auto w-3/4 h-3/4 rounded-md bg-transparent backdrop:bg-black/50">
        <div className='bg-gray-200 p-5'>
          <h1 className='text-3xl text-center pb-5'>Comment utiliser ce configurateur ?</h1>
          <h2 className='pt-5 font-bold text-xl pb-2'>Status des emplacements</h2>
          <p>Chaquns de ces carrés représente un emplacement. Il peut être : 
            <br /> - Une place disponible : Une place qui sera attribuée à un élève sans condition particulière
            <br /> - Une place avec une prise disponible : Une place qui sera attribuée à un élève qui à besoin d'avoir accès à un ordinateur
            <br /> - Une place interdite : Une place qui sera pas attribuée pour x raisons
            <br /> - Un couloir : Une place qui ne peux donc pas être attribuée à un éleve
            <br /><span className='font-bold'>En cliquant sur une case, vous pourrez changer le status d'un emplacement avec les choix ci-dessus.</span>
          </p>
          <h2 className='pt-10 font-bold text-xl pb-2'>Mode de sélection</h2>
          <p>2 modes de sélection sont possibles : 
            <br /><span className='font-bold'>Selection unique</span>
            <br />Vous cliquez sur l'emplacement désiré, un menu s'ouvre et vous choisissez le status de cet emplacement.
            <br /><span className='font-bold '>Selection multiple</span>
            <br />Vous sélectionnez un ou plusieurs emplacements 
          </p>
        </div>
      </dialog>
    </div>
  )
}

export default ClassDispositionPage
