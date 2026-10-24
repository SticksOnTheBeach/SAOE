package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private static final int MAX_SIZE = 100;

    /**
     * Ce que le site envoie pour créer OU modifier une salle (JSON).
     * "seats" = la liste des places qui existent (ligne, colonne, type), sans les trous.
     * Sans "seats" :
     *  - à la création, toutes les cases sont des places disponibles ;
     *  - à la modification, la salle garde ses places et ses trous actuels
     *    (les cases ajoutées par un agrandissement sont des places disponibles).
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

    @PostMapping
    public ResponseEntity<Room> create(@RequestBody CreateRoomRequest request) {
        String name = checkedName(request);
        checkSize(request.rows(), request.columns());
        if (repository.existsByNameIgnoreCase(name)) {
            throw nameAlreadyUsed(name);
        }

        String roomId = UUID.randomUUID().toString();
        List<Seat> cells = request.seats() == null
                ? allAvailable(roomId, request.rows(), request.columns())
                : seatsFromRequest(roomId, request.seats());

        Room room;
        try {
            // Le constructeur de Room vérifie la grille (place hors de la salle, deux places sur la même case)
            room = new Room(roomId, name, request.rows(), request.columns(), cells);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        requireUsableSeat(room.getUsableSeatCount());

        repository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    // Tout se passe dans une transaction : si une vérification échoue, rien n'est modifié en base.
    @PutMapping("/{id}")
    @Transactional
    public Room update(@PathVariable String id, @RequestBody CreateRoomRequest request) {
        Room room = repository.findById(id).orElseThrow(() -> new RoomNotFoundException(id));

        String name = checkedName(request);
        checkSize(request.rows(), request.columns());
        repository.findByNameIgnoreCase(name)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw nameAlreadyUsed(name); });

        List<Seat> cells = request.seats() == null
                ? adaptedSeats(room, request.rows(), request.columns())
                : seatsFromRequest(id, request.seats());
        requireUsableSeat((int) cells.stream().filter(Seat::isUsable).count());

        try {
            room.update(name, request.rows(), request.columns(), cells);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return room;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            throw new RoomNotFoundException(id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- vérifications et construction des places ----

    private static String checkedName(CreateRoomRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la salle est obligatoire");
        }
        return request.name().trim();
    }

    private static void checkSize(int rows, int columns) {
        if (rows < 1 || columns < 1 || rows > MAX_SIZE || columns > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le nombre de lignes et de colonnes doit être compris entre 1 et " + MAX_SIZE);
        }
    }

    private static ResponseStatusException nameAlreadyUsed(String name) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Une salle nommée \"" + name + "\" existe déjà");
    }

    private static void requireUsableSeat(int usableSeatCount) {
        if (usableSeatCount == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La salle n'a aucune place utilisable");
        }
    }

    private static String seatId(String roomId, int row, int column) {
        return roomId + "-r" + row + "c" + column;
    }

    private static List<Seat> allAvailable(String roomId, int rows, int columns) {
        List<Seat> cells = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < columns; c++) {
                cells.add(new Seat(seatId(roomId, r, c), r, c, SeatType.AVAILABLE));
            }
        }
        return cells;
    }

    private static List<Seat> seatsFromRequest(String roomId, List<SeatRequest> requested) {
        List<Seat> cells = new ArrayList<>();
        for (SeatRequest s : requested) {
            if (s == null || s.type() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chaque place doit avoir un type");
            }
            cells.add(new Seat(seatId(roomId, s.row(), s.column()), s.row(), s.column(), s.type()));
        }
        return cells;
    }

    /**
     * Modification sans liste de places : on garde ce que la salle a déjà.
     * Une case qui avait une place garde son type, une case qui était un trou reste un trou,
     * une case en dehors de l'ancienne grille (agrandissement) devient une place disponible.
     */
    private static List<Seat> adaptedSeats(Room room, int rows, int columns) {
        Map<String, Seat> existing = new HashMap<>();
        for (Seat seat : room.getSeats()) {
            existing.put(seat.getRow() + "," + seat.getColumn(), seat);
        }

        List<Seat> cells = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < columns; c++) {
                Seat old = existing.get(r + "," + c);
                boolean insideOldGrid = r < room.getRows() && c < room.getColumns();
                if (old != null) {
                    cells.add(new Seat(seatId(room.getId(), r, c), r, c, old.getType()));
                } else if (!insideOldGrid) {
                    cells.add(new Seat(seatId(room.getId(), r, c), r, c, SeatType.AVAILABLE));
                }
            }
        }
        return cells;
    }
}