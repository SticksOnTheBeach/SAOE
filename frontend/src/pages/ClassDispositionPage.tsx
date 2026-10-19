import { Outlet } from 'react-router'
import Header from '../components/Header'

function ClassDispositionPage() {
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

export default ClassDispositionPage
