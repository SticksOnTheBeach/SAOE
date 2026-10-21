import { Outlet } from 'react-router'
import Header from './Header'
import { FooterBandeau } from './Footer' 

function Layout() {
  return (
    <>
      <Header />
      <div className="content_part pb-16">
        <Outlet />
      </div>
      <FooterBandeau />
    </>
  )
}

export default Layout
