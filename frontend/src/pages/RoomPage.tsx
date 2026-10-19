function RoomPage() {
  const x = 10
  return (
    <div>
      <div className="text-center">
        <h2>Room</h2>
        <p>The seating grid</p>
      </div>
      <div className="grid grid-cols-5 gap-8 p-2">
        {Array.from({ length: x }, (_, i) => (
          <div key={i} className="h-70 rounded-lg bg-gray-200">
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomPage
