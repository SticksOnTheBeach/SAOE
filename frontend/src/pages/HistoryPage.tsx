function RoomPage() {
  const x = 13
  return (
    <div>
      <h1 className='text-4xl text-center pt-5 pb-10 text-[#4D4D4D]'>Historique des placements</h1>
      <div className="flex gap-2 px-3 pb-3">
        <div className="flex-1 flex flex-col gap-1">
          {Array.from({ length: x }, (_, i) => ( 
              <div onClick={() => console.log("Salle selectionnée")} className="rounded-md bg-gray-200 hover:bg-gray-300 w-full p-2">
                  <p>Bonjour</p>
              </div>
          ))}
        </div>

        <div className="flex-1 rounded-md bg-gray-200 hover:bg-gray-300 w-full p-2">
          
        </div>
      </div>
    </div>
  )
}

export default RoomPage
