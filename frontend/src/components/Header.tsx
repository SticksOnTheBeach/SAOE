import { NavLink, Link } from 'react-router'

function Header() {
  return (
    <header className="flex items-center gap-6 bg-slate-900 px-6 py-4 text-white shadow-md">
      <h1 className="text-2xl font-bold tracking-tight">
        <Link to="/">
          SAOE <span className="font-normal text-slate-400">- Gestion</span>
        </Link>
      </h1>
      <nav className="flex gap-4">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </header>
  )
}

export default Header
