function RoomPage() {
  const x = 13
  return (
    <div>
      <div className="grid grid-cols-5 gap-10 px-20 py-10">
        <div className="flex items-center justify-center aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
          <p className="text-8xl text-center text-[#4D4D4D] select-none">+</p>
        </div>
        {Array.from({ length: x }, (_, i) => ( // Création des divs
          <div key={i} className="aspect-square rounded-4xl bg-gray-200 hover:bg-gray-300">
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomPage
