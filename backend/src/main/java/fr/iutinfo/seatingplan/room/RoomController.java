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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private static final int MAX_SIZE = 100;

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

    /**
     * Creates a room. "seats" is optional: it lists the type of every cell, row by row
     * (the cell number i is on row i / columns and column i % columns).
     * Without it, every seat is AVAILABLE.
     */
    @PostMapping
    public ResponseEntity<Room> create(@RequestParam("name") String name, @RequestParam("rows") int rows, @RequestParam("columns") int columns, @RequestParam(value = "seats", required = false) List<SeatType> seats) {
    	Room room;
    	
    	if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la salle est obligatoire");
        }
        if (rows < 1 || columns < 1 || rows > MAX_SIZE || columns > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le nombre de lignes et de colonnes doit être compris entre 1 et " + MAX_SIZE);
        }
        if (seats == null) {
            seats = Collections.nCopies(rows * columns, SeatType.AVAILABLE);
        }

        List<Seat> cells = new ArrayList<>();
        for (int i = 0; i < seats.size(); i++) {
            int row = i / columns;
            int column = i % columns;
            cells.add(new Seat("r" + row + "c" + column, row, column, seats.get(i)));
        }

        
        try {
                // The Room constructor already checks the grid (number of seats, duplicates, outside the room)
                room = new Room(UUID.randomUUID().toString(), name.trim(), rows, columns, cells);
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