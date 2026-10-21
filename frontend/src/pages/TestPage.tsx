import { useRef } from 'react'

function TestPage() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button onClick={() => dialogRef.current?.showModal()}>
        Ouvrir le popup
      </button>

      <dialog ref={dialogRef} className="m-auto w-3/4 h-3/4 rounded-md bg-transparent backdrop:bg-black/50">
        <div className="w-full h-full bg-[#380404] text-white p-5 rounded-md">
            <h2>Mon titre</h2>
            <button onClick={() => dialogRef.current?.close()}>Fermer</button>
        </div>
      </dialog>
    </>
  )
}

export default TestPage