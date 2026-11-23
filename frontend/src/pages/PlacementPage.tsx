import { useState } from 'react'
import { Link, useLocation } from 'react-router'

function PlacementPage() {

  return (
    <div>
        <h1 className='text-4xl text-center pt-5 pb-5 text-[#4D4D4D]'>Gestionnaire des placements</h1>
        <div className='bg-gray-200 border-2 border-gray-300 mx-[20%] p-2 rounded-md'>
            <h2 className='text-2xl mb-5 pl-2 font-normal'>Création d'un placement</h2>
            <div className='flex justify-between px-10'>
                <div>
                    <h3 className='text-center'>Nom du plan</h3>
                    <input type="text" name="" id="" className='border-2 border-gray-700 rounded-md w-75 h-8 px-2 py-1 hover:bg-gray-300'/>
                </div>
                <div>
                    <h3 className='text-center'>Choix de la promotion</h3>
                    <select name="" id="" className='border-2 border-gray-700 rounded-md w-50 h-8 px-2 py-1 hover:bg-gray-300'>
                        <option value="">1</option>
                        <option value="">2</option>
                        <option value="">3</option>
                    </select>
                </div>
                <div>
                    <h3 className='text-center'>Choix de la salle</h3>
                    <select name="" id="" className='border-2 border-gray-700 rounded-md w-50 h-8 px-2 py-1 hover:bg-gray-300'>
                        <option value="">1</option>
                        <option value="">2</option>
                        <option value="">3</option>
                    </select>
                </div>
                <button className='border-2 border-gray-700 rounded-md px-5 hover:bg-gray-300'>Générer le plan</button>
            </div>
        </div>

        <div className=''>
            <h1 className='text-4xl text-center pt-15 pb-5 text-[#4D4D4D]'>Historique des placements</h1>
            <div className="flex gap-2 mx-[20%] px-3 py-3 bg-gray-200 border-2 border-gray-300 rounded-md">
                <div className="flex-2 flex flex-col gap-1">
                {Array.from({ length: 10 }, (_, i) => ( 
                    <div className="flex justify-around rounded-md bg-gray-300 hover:bg-gray-400 w-full p-2">
                        <h4 className='font-bold'>R-46-47/BUT2</h4>
                    </div>
                ))}
                </div>

                <div className="flex-1 rounded-md bg-gray-300 w-full p-2">
                    <button className=''>Charger le plan</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PlacementPage
