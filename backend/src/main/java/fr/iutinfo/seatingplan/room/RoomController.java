package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    // What the website sends to create a room. The id is chosen by the backend.
    public record SeatRequest(int row, int column, SeatType type) {}
    public record CreateRoomRequest(String name, int rows, int columns, List<SeatRequest> seats) {}

    private final RoomRepository repository;

    public RoomController(RoomRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Room> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Room get(@PathVariable String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable : " + id));
    }

    @PostMapping
    public ResponseEntity<Room> create(@RequestBody CreateRoomRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la salle est obligatoire");
        }
        if (request.seats() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La liste des places est obligatoire");
        }

        List<Seat> seats = new ArrayList<>();
        for (SeatRequest s : request.seats()) {
            if (s == null || s.type() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chaque place doit avoir un type");
            }
            seats.add(new Seat("r" + s.row() + "c" + s.column(), s.row(), s.column(), s.type()));
        }

        Room room;
        try {
            // The Room constructor already checks the grid (size, duplicates, outside the room)
            room = new Room(UUID.randomUUID().toString(), request.name().trim(),
                    request.rows(), request.columns(), seats);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        if (room.getUsableSeatCount() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La salle n'a aucune place utilisable");
        }

        repository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }
}