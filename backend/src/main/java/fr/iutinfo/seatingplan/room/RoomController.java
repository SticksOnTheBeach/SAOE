package fr.iutinfo.seatingplan.room;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {
	private RoomRepository roomRepository;
	
	public record SeatRequest(int row, int column, boolean hasPowerOutlet) { }
	public record RoomCreateRequest(String name, int rows, int columns, List<SeatRequest> seats) { }
	
	
	public RoomController(RoomRepository repository) {
		this.roomRepository = repository;
	}
	
	@GetMapping()
	public List<Room> all(){
		return roomRepository.findAll();
	}
	
	@GetMapping("/{id}")
	public Room one(@PathVariable Long id) {
		return roomRepository.findById(id).orElseThrow(() -> new RoomNotFoundException(id));
	}
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void deleteStudent(@PathVariable Long id) {
		if (!roomRepository.existsById(id)) {
		    throw new RoomNotFoundException(id);
		}
		roomRepository.deleteById(id);
	}
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Room create(@RequestBody RoomCreateRequest request) {

	    Room room = new Room(request.name(), request.rows(), request.columns());
	    Set<String> positions = new HashSet<>();

	    for (SeatRequest s : request.seats()) {

	        if (s.row() < 0 || s.row() >= request.rows()
	                || s.column() < 0 || s.column() >= request.columns()) {
	            throw new InvalidRoomException("Place hors de la salle : (" + s.row() + ", " + s.column() + ")");
	        }

	        if (!positions.add(s.row() + "-" + s.column())) {
	            throw new InvalidRoomException("Place en double : (" + s.row() + ", " + s.column() + ")");
	        }

	        room.addSeat(new Seat(s.row(), s.column(), s.hasPowerOutlet()));
	    }

	    return roomRepository.save(room);
	}
	
}
