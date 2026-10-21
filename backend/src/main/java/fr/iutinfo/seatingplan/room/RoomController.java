package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.Collections;
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

    private static final int MAX_SIZE = 100;

    /**
     * What the website sends to create a room (JSON).
     * "seats" is optional: the type of every cell, row by row
     * (cell number i is on row i / columns and column i % columns).
     * Without it, every seat is AVAILABLE. Other fields sent by the website are ignored.
     */
    public record CreateRoomRequest(String name, int rows, int columns, List<SeatType> seats) {}

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
        int rows = request.rows();
        int columns = request.columns();
        if (rows < 1 || columns < 1 || rows > MAX_SIZE || columns > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le nombre de lignes et de colonnes doit être compris entre 1 et " + MAX_SIZE);
        }
        List<SeatType> types = request.seats();
        if (types == null) {
            types = Collections.nCopies(rows * columns, SeatType.AVAILABLE);
        }

        List<Seat> cells = new ArrayList<>();
        for (int i = 0; i < types.size(); i++) {
            if (types.get(i) == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chaque place doit avoir un type");
            }
            int row = i / columns;
            int column = i % columns;
            cells.add(new Seat("r" + row + "c" + column, row, column, types.get(i)));
        }

        Room room;
        try {
            // The Room constructor already checks the grid (number of seats, duplicates, outside the room)
            room = new Room(UUID.randomUUID().toString(), request.name().trim(), rows, columns, cells);
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