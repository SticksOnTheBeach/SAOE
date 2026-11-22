import { useState } from 'react'
import { Link, useLocation } from 'react-router'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="flex justify-between gap-6 bg-[#B51621] px-1 py-0.5 text-white shadow-md">
      <div className="flex justify-between gap-30 px-6 py-4">
        <Link className="flex items-center gap-6" to="/">
          <img src="/logo.png" alt="" className="h-15 w-15" />
          <h1 className="text-2xl font-bold tracking-tight">SAOE</h1>
        </Link>
        <div className="flex justify-between gap-3 pt-1.5">
          <Link to={"/"}><button className={`py-3 px-7 rounded-lg hover:bg-[#96121B] ${pathname === '/' ? 'font-bold' : ''}`}>Acceuil</button></Link>
          <Link to={"/Promo"}><button className={`py-3 px-7 rounded-lg hover:bg-[#96121B] ${pathname === '/Promo' ? 'font-bold' : ''}`}>Mes Promos</button></Link>
          <Link to={"/Room"}><button className={`py-3 px-7 rounded-lg hover:bg-[#96121B] ${pathname === '/Room' ? 'font-bold' : ''}`}>Mes Salles</button></Link>
          {/* <Link to={"/History"}><button className={`py-3 px-7 rounded-lg hover:bg-[#96121B] ${pathname === '/History' ? 'font-bold' : ''}`}>Historique Placements</button></Link> */}
        </div>
      </div>

      <div className="flex justify-center relative h-18 w-30 pt-4 cursor-pointer" onClick={() => setIsMenuOpen((open) => !open)}>
        <img src="/mael.jpg" alt="" className="size-14 shrink-0 rounded-full object-cover" />
        <img
          src={isMenuOpen ? '/pp_closed.png' : '/pp_extended.png'}
          alt="Menu Utilisateur"
          className="h-full min-w-0 scale-125 flex-1 object-contain object-left pr-5 pl-4 origin-right"
        />
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-black">
            <ul className="py-1">
              <li>
                <Link to="/Profile" className="block px-4 py-2 hover:bg-gray-100">Mon Profil</Link>
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
