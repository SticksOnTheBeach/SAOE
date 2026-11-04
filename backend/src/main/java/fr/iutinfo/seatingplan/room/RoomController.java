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
	
	// record permettant de gérer le fais que si le json renvoyé par le site sur l'api de contient pas de equipment et bien ça crash pas
	public record SeatRequest(int row, int column, @NotNull SeatType type, List<SeatEquipment> equipment) {
	    public SeatRequest {
	        equipment = (equipment == null) ? List.of() : equipment;
	    }
	}
	
	
	// on laisse sous entendre au programme que la réponse attendu renvoyé comme requête par le serveur, est sous la forme suivante, donc on attend ça de la part du serveur du moins comme requete d'envoie sur Api
	public record RoomCreateRequest(
	    @NotBlank String name,
	    @Positive int rows,
	    @Positive int columns,
	    @NotNull @Valid List<SeatRequest> seats) { }
	

	public record SeatResponse(String id, int row, int column, SeatType type, List<SeatEquipment> equipment, boolean usable) {
		static SeatResponse from(Seat s) {
			return new SeatResponse(s.getId(), s.getRow(), s.getColumn(), s.getType(), s.getEquipment(), s.isUsable());
		}
	}
		
	
	public record RoomResponse(String id, String name, int rows, int columns, int seatCount, int usableSeatCount, List<SeatResponse> seats) {
		static RoomResponse from(Room r) {
			// pour r.getSeat Cette ligne, dans RoomResponse.from, transforme chaque Seat de la salle en SeatResponse.
			return new RoomResponse(r.getId(), r.getName(), r.getRows(), r.getColumns(), r.getSeatCount(), r.getUsableSeatCount(), r.getSeats().stream().map(SeatResponse::from).toList());
		}
	}
	
	public RoomController(RoomRepository repository) {
		this.roomRepository = repository;
	}
	
	@GetMapping()
	public List<RoomResponse> all(){
		return roomRepository.findAll().stream().map(RoomResponse::from).toList();
	}
	
	@GetMapping("/{id}")
	public RoomResponse one(@PathVariable String id) {
	    return RoomResponse.from(roomRepository.findById(id).orElseThrow(() -> new RoomNotFoundException(id)));
	}
	
	
	
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void deleteStudent(@PathVariable String id) {
		if (!roomRepository.existsById(id)) {
		    throw new RoomNotFoundException(id);
		}
		// roomRepository.deleteById(id);
		roomRepository.deleteById(id);
	}
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Room create(@RequestBody RoomCreateRequest request) {

		List<Seat> seats = request.seats().stream()
		        .map(s -> new Seat(UUID.randomUUID().toString(), s.row(), s.column(), s.type(), s.equipment()))
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
