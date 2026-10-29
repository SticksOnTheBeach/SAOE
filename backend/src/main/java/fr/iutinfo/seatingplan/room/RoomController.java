package fr.iutinfo.seatingplan.room;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {
	private RoomRepository roomRepository;
	
	public record SeatRequest(int row, int column, @NotNull SeatType type) { }

	public record RoomCreateRequest(
	    @NotBlank String name,
	    @Positive int rows,
	    @Positive int columns,
	    @NotNull @Valid List<SeatRequest> seats) { }
	

	
	
	public RoomController(RoomRepository repository) {
		this.roomRepository = repository;
	}
	
	@GetMapping()
	public List<Room> all(){
		return roomRepository.findAll();
	}
	
	@GetMapping("/{id}")
	public Room one(@PathVariable String id) {
		return roomRepository.findById(id).orElseThrow(() -> new RoomNotFoundException(id));
	}
	
	
	
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void deleteStudent(@PathVariable String id) {
		if (!roomRepository.existsById(id)) {
		    throw new RoomNotFoundException(id);
		}
		roomRepository.deleteById(id);
	}
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Room create(@RequestBody RoomCreateRequest request) {

		List<Seat> seats = request.seats().stream()
		        .map(s -> new Seat(UUID.randomUUID().toString(), s.row(), s.column(), s.type()))
		        .toList();

	    try {
	        Room room = new Room(UUID.randomUUID().toString(),
	                request.name(), request.rows(), request.columns(), seats);
	        return roomRepository.save(room);
	    } catch (IllegalArgumentException e) {
	        throw new InvalidRoomException(e.getMessage());
	    }
	}
	
	
	
	@PutMapping("/{id}")
	public Room update(@PathVariable String id, @Valid @RequestBody RoomCreateRequest request) {

	    Room room = roomRepository.findById(id)
	            .orElseThrow(() -> new RoomNotFoundException(id));

	    List<Seat> seats = request.seats().stream()
	            .map(s -> new Seat(UUID.randomUUID().toString(), s.row(), s.column(), s.type()))
	            .toList();

	    try {
	        room.update(request.name(), request.rows(), request.columns(), seats);
	    } catch (IllegalArgumentException e) {
	        throw new InvalidRoomException(e.getMessage());
	    }

	    return roomRepository.save(room);
	}
}
