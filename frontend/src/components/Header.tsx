import { useState } from 'react'
import { Link } from 'react-router'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="flex justify-between gap-6 bg-[#B51621] px-1 py-0.5 text-white shadow-md">
      <div className="flex justify-between gap-30 px-6 py-4">
        <div className="flex items-center gap-6">
          <img src="/logo.png" alt="" className="h-15 w-15" />
          <h1 className="text-2xl font-bold tracking-tight">
            <Link to="/">SAOE</Link>
          </h1>
        </div>
        <div className="flex justify-between gap-3 pt-1.5">
          <Link to={"/"}><button className="py-3 px-7 rounded-lg hover:bg-[#96121B]">Acceuil</button></Link>
          <Link to={"/Room"}><button className="py-3 px-7 rounded-lg hover:bg-[#96121B]">Mes Salles</button></Link>
          <Link to={"/Promo"}><button className="py-3 px-7 rounded-lg hover:bg-[#96121B]">Mes Promos</button></Link>
          <Link to={"/History"}><button className="py-3 px-7 rounded-lg hover:bg-[#96121B]">Historique Placements</button></Link>
        </div>
      </div>

      <div className="relative gap-3 h-18 w-30 pt-1.5 cursor-pointer" onClick={() => setIsMenuOpen((open) => !open)}>
        <img
          src={isMenuOpen ? '/pp_extended.png' : '/pp_closed.png'}
          alt="Menu Utilisateur"
          className="w-4/5 h-auto pt-2"
        />
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-black">
            <ul className="py-1">
              <li>
                <Link to="/Profile" className="block px-4 py-2 hover:bg-gray-100">Mon Profil</Link>
              </li>
              <li>
                <Link to="/Settings" className="block px-4 py-2 hover:bg-gray-100">Paramètres</Link>
              </li>
              <hr className="border-gray-200" />
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header