package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    private static final int MAX_SIZE = 100;

    /**
     * What the website sends to create a room (JSON).
     * "seats" is optional: the type of every cell, row by row
     * (cell number i is on row i / columns and column i % columns).
     * Without it, every seat is AVAILABLE. Other fields sent by the website are ignored.
     */
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
        return repository.findById(id).orElseThrow(() -> new RoomNotFoundException(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            throw new RoomNotFoundException(id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping
    public ResponseEntity<Room> create(@RequestBody CreateRoomRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la salle est obligatoire");
        }
        int rows = request.rows();
        int columns = request.columns();
        if (rows < 1 || columns < 1 || rows > MAX_SIZE || columns > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Le nombre de lignes et de colonnes doit être compris entre 1 et " + MAX_SIZE);
        }

        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une salle nommée \"" + name + "\" existe déjà");
        }
     

        String roomId = UUID.randomUUID().toString();
        List<Seat> cells = new ArrayList<>();
        if (request.seats() == null) {
            // pas de liste envoyée : une place disponible sur chaque case, comme avant
            for (int r = 0; r < rows; r++)
                for (int c = 0; c < columns; c++)
                    cells.add(new Seat(roomId + "-r" + r + "c" + c, r, c, SeatType.AVAILABLE));
        } else {
            for (SeatRequest s : request.seats()) {
                if (s == null || s.type() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chaque place doit avoir un type");
                }
                cells.add(new Seat(roomId + "-r" + s.row() + "c" + s.column(), s.row(), s.column(), s.type()));
            }
        }

        Room room;
        try {
            // The Room constructor already checks the grid (number of seats, duplicates, outside the room)
            room = new Room(roomId, request.name().trim(), rows, columns, cells);
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