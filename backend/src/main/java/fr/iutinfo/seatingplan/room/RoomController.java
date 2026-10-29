package fr.iutinfo.seatingplan.room;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {
	private RoomRepository roomRepository;
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
	void deleteStudent(@PathVariable Long id) {
		roomRepository.deleteById(id);
	}
	
}
