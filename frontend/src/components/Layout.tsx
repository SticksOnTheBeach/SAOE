import { Outlet } from 'react-router'
import Header from './Header'

function Layout() {
  return (
    <>
      <Header />
      <div className="content_part">
        <Outlet />
      </div>
      <footer></footer>
    </>
  )
}

export default Layout
