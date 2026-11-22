import { useEffect, useState } from 'react'


function ProfilePage() {
  const [isOn, setIsOn] = useState(false)

  function setFooterStatus() {
    if (isOn) {
      setIsOn(false)
    } else {
      setIsOn(true)
    }
    console.log(isOn)
  }

  return (
    <div className='bg-gray-200'>
      <div className="relative overflow-hidden">
        <img src="/bg-profile.jpg" className="h-full w-full object-cover blur-sm scale-110" alt="Fond flouté"/>
      </div>

      <div className='flex flex-col items-center gap-10 -mt-[5%] z-10 relative'>
        <div className='flex items-center justify-center bg-gray-200 rounded-full w-60 h-60'>
          <img src="pp.jpg" alt="" className='rounded-full h-50 h-50' />
        </div>
        <div className='flex gap-5 flex-col text-center'>
          <h2 className='text-6xl font-bold'>Boucher Natacha</h2>
          <h3 className='text-3xl'>nboucher1</h3>
        </div>
      </div>

      <div className='grid grid-cols-[minmax(0,1fr)_2px_minmax(0,1fr)] gap-x-2 px-2 py-20 sm:gap-x-20 sm:px-5 xl:px-20'>
        <div className='min-w-0'>
          <h4 className='text-xl sm:text-4xl mb-5'>Informations</h4>
          <div className='overflow-x-auto rounded-xl border-2 border-gray-500'>
            <table className='w-full wrap-anywhere bg-white [&_th]:text-left [&_th]:px-1 sm:[&_th]:px-3 xl:[&_th]:px-10 [&_th]:py-8 [&_td]:px-1 sm:[&_td]:px-3 xl:[&_td]:px-10 [&_td]:py-8'>
              <tbody className="divide-y divide-gray-300">
                <tr>
                  <th>
                    <p>Prenom</p>
                  </th>
                  <td>
                    <input type="text" className='h-10 w-50 border-2 border-gray-500 rounded-md px-3 hover:bg-gray-100'/>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Nom</p>
                  </th>
                  <td>
                    <input type="text" className='h-10 w-50 border-2 border-gray-500 rounded-md px-3 hover:bg-gray-100'/>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Status éducatif</p>
                  </th>
                  <td>
                    <p>Etudiant</p>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Email</p>
                  </th>
                  <td>
                    <p>bnatacha@gmail.com</p>
                  </td>
                  <td>
                    <button className='p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100'>Modifier</button>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Téléphone</p>
                  </th>
                  <td>
                    <p>07 66 28 11 83</p>
                  </td>
                  <td>
                    <button className='p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100'>Modifier</button>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Mot de passe</p>
                  </th>
                  <td>
                    <button className='p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100'>Modifier mon mot de passe</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div aria-hidden="true" className='bg-gray-700' />

        <div className='min-w-0'>
          <h4 className='text-xl sm:text-4xl mb-5'>Paramètres</h4>
          <div className='overflow-x-auto rounded-xl border-2 border-gray-500'>
            <table className='w-full wrap-anywhere bg-white [&_th]:text-left [&_th]:px-1 sm:[&_th]:px-3 xl:[&_th]:px-10 [&_th]:py-8 [&_td]:px-1 sm:[&_td]:px-3 xl:[&_td]:px-10 [&_td]:py-8'>
              <tbody className="divide-y divide-gray-300">
                <tr>
                  <th>
                    <p>Thème</p>
                  </th>
                  <td>
                    <select name="" id="" className='py-2 rounded-md border-2 border-gray-500 hover:bg-gray-100'>
                      <option value="">Clair</option>
                      <option value="">Sombre</option>
                      <option value="">Système</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Langage</p>
                  </th>
                  <td>
                    <select name="" id="" className='py-2 rounded-md border-2 border-gray-500 hover:bg-gray-100'>
                      <option value="">Français</option>
                      <option value="">Español</option>
                      <option value="">English</option>
                      <option value="">Português</option>
                      <option value="">Chinois</option>
                      <option value="">Hindi</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Gestion de mes données</p>
                  </th>
                  <td>
                    <button className='p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100'>Supprimer mes données</button>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Supprimer mon compte</p>
                  </th>
                  <td>
                    <button className='p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100'>Supprimer mon compte</button>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Désactiver le footer interractif</p>
                  </th>
                  <td className='flex gap-2'>
                    <h3 className={`pt-1 text-l ${isOn ? 'font-normal' : 'font-bold'}`}>Off</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input checked={!isOn} onChange={() => setFooterStatus()} type="checkbox" className="sr-only peer" />
                      <div className="group peer bg-white rounded-full duration-300 w-16 h-8 ring-2 after:duration-300 after:bg-gray-400 peer-checked:after:bg-gray-400 after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-8 peer-hover:after:scale-95"></div>
                    </label>
                    <h3 className={`pt-1 text-l ${isOn ? 'font-bold' : 'font-normal'}`} id='multiple'>On</h3>
                  </td>
                </tr>
                <tr>
                  <th>
                    <p>Contribuez à nos études</p>
                  </th>
                  <td>
                    <a href="https://paypal.me/geoffreyrigal5" target="_blank" rel="noopener noreferrer" className="inline-block p-2 border-2 border-gray-500 rounded-md hover:bg-gray-100">Faire un don</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='flex justify-center pb-10'>
        <button className='p-2 border-2 border-gray-500 rounded-md bg-white hover:bg-gray-100'>Sauvegarder les modifications</button>
      </div>
    </div>
  )
}

export default ProfilePage
