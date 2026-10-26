import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

function PromoPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  function resetDialog() {
    setMessage('')
    setError('')
    setLoading(false)
  }
  
  return (
  <div>
    <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Gestion des promotions</h1>
    <div className="grid grid-cols-5 gap-10 px-20 pb-10">
        <div className="cursor-pointer flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        <div className="cursor-pointer group flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <div>
                <p className="text-4xl text-center text-[#4D4D4D] select-none">G4B</p>
                <p className="text-l text-center text-[#4D4D4D] select-none">Nombre d'étudiants : 15</p>
                <div className="flex justify-between mt-20 invisible group-hover:visible gap-2">
                    <img onClick={(e) => { e.stopPropagation(); }} src="/pen.svg" alt="Modifier" title="Modifier" className="w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400"/>
                    <img onClick={(e) => { e.stopPropagation(); }} src="/trash.svg" alt="Supprimer" title="Supprimer" className='w-15 h-auto pt-2 bg-gray-400 p-3 rounded-md hover:border-3 hover:border-gray-400'/>
                </div>
            </div>
        </div>
    </div>

    <dialog onClose={resetDialog} className="m-auto w-[87.5%] h-[87.5%] rounded-md bg-transparent backdrop:bg-black/50">
        <div className='flex flex-col w-full h-full bg-[#691111] text-white p-5 rounded-3xl border-2 border-gray-500'>
        </div>
    </dialog>
  </div>
  )
}

export default PromoPage