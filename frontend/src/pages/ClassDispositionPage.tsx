import type { ReactNode } from 'react'

type ClassDispositionPageProps = {
  children: ReactNode
}

function ClassDispositionPage({ children }: ClassDispositionPageProps) {
  return (
    <>
      <header>
        <h1>SAOE - Gestion</h1>
      </header>

      <div className="content_part">{children}</div>

      <footer></footer>
    </>
  )
}

export default ClassDispositionPage
