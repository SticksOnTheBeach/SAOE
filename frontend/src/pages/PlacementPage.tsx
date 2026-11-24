import { useState } from 'react'
import { Link, useLocation } from 'react-router'

function PlacementPage() {
  const rows = 5
  const columns = 15

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

        <section className="mx-4 pt-15 sm:mx-8 xl:mx-[20%]">
            <h1 className="pb-5 text-center text-4xl text-[#4D4D4D]">Historique des placements</h1>
            <div className="grid items-start gap-4 rounded-lg border-2 border-gray-300 bg-gray-200 p-4 md:grid-cols-[minmax(10rem,1fr)_minmax(0,3fr)]">
                <ul aria-label="Placements sauvegardés" tabIndex={0} className="min-h-0 max-h-125 space-y-2 overflow-y-auto">
                    {Array.from({ length: 100 }, (_, i) => (
                        <li key={i} className="rounded-md border border-gray-300 bg-gray-100 px-4 py-3 hover:bg-gray-200 hover:border-gray-600">
                            <h4 className="font-medium">R-46-47/BUT2</h4>
                        </li>
                    ))}
                </ul>

                <div className="min-w-0 min-h-125 rounded-md bg-gray-100 p-4 sm:p-5">
                    <div className="grid items-start gap-5 sm:grid-cols-[minmax(9rem,1fr)_minmax(0,2fr)]">
                        <dl className="space-y-3 [&_dt]:text-sm [&_dt]:text-gray-600 [&_dd]:font-medium">
                            <h3 className="mb-4 pb-3 text-2xl font-medium">R46-47/BUT1</h3>
                            <div>
                                <dt>Salle utilisée</dt>
                                <dd>R46-47</dd>
                            </div>
                            <div>
                                <dt>Promotion utilisée</dt>
                                <dd>BUT1</dd>
                            </div>
                            <div>
                                <dt>Date de creation</dt>
                                <dd>01/01/2026</dd>
                            </div>
                            <div>
                                <dt>Date de modification</dt>
                                <dd>02/02/2026</dd>
                            </div>
                            <div>
                                <dt>Crée par :</dt>
                                <dd>Laurent Dubreuil</dd>
                            </div>
                        </dl>
                        <svg
                            viewBox={`0 0 ${columns * 40} ${rows * 40}`}
                            role="img"
                            aria-label={`Aperçu du plan de ${rows} lignes et ${columns} colonnes`}
                            className="h-auto max-h-80 w-full min-w-0 max-w-lg justify-self-center"
                        >
                            {Array.from({ length: rows }, (_, row) =>
                                Array.from({ length: columns }, (_, column) => (
                                    <rect key={`${row}-${column}`} x={column * 40 + 2} y={row * 40 + 2}
                                        width={36} height={36} rx={4} className="fill-gray-200 stroke-gray-300" />
                                ))
                            )}
                        </svg>
                    </div>
                    <div className="mt-5 flex justify-center pt-4">
                        <button className="rounded-md border-2 border-gray-500 px-6 py-2 hover:bg-gray-200">Charger le plan</button>
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}

export default PlacementPage
