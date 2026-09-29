import type { ReactNode } from 'react'
import Header from '../components/Header'

type ClassDispositionPageProps = {
  children: ReactNode
}

function ClassDispositionPage({ children }: ClassDispositionPageProps) {
  return (
    <>
      <Header />

      <div className="content_part">{children}</div>

      <footer></footer>
    </>
  )
}

export default ClassDispositionPage
