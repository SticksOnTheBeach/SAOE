import { NavLink, Link } from 'react-router'

let is_menu_open: boolean = false;

function handleClick() {
  if (is_menu_open === false) {
    is_menu_open = true;
  } else {
    is_menu_open = false
  }
}

function Header() {
  return (
    <header className="flex justify-between gap-6 bg-[#B51621] px-6 py-4 text-white shadow-md">
      <div className='flex items-center gap-6'>
        <img src="../../public/logo.png" alt="" className='h-15 w-15'/>
        <h1 className="text-2xl font-bold tracking-tight">
          <Link to="/">
            SAOE
          </Link>
        </h1>
      </div>
      <div className="flex items-center gap-3 h-12 w-30 pt-3" onClick={handleClick}>
        <div className='rounded-full bg-white h-12 w-12'>
        </div>
        <p className='text-[50px] pt-9'>ˇ</p>
      </div>
    </header>
  )
}

export default Header