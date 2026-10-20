function RoomPage() {
  const room_name = "20"
  const room_places = 30
  const x = 13
  return (
    <div>
      <div className="grid grid-cols-5 gap-10 px-20 py-10">
        <div onClick={() => console.log("Nouvelle salle")} className="flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
          <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {Array.from({ length: x }, (_, i) => ( // Création des divs
          <div onClick={() => console.log("Salle ", i, " selectionnée")} key={i} className="flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
            <div>
              <p className="text-4xl text-center text-[#4D4D4D] select-none">{room_name+i}</p>
              <p className="text-l text-center text-[#4D4D4D] select-none">Places disponible : {room_places}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomPage
