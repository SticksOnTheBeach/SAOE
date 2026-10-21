function RoomPage() {
  const x = 13
  return (
    <div className="flex gap-2 px-3 py-3">
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
  )
}

export default RoomPage
