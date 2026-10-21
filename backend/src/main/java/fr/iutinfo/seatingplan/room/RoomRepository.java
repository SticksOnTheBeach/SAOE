package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Repository;

/**
 * Stores the rooms in memory (they disappear when the backend restarts).
 * => on remplacera / supprimera cette classe par l'instanciation de lla BDD
 * et donc la gestion des données sera faites via la BDD que le front implémentera
 */
@Repository
public class RoomRepository {

    // Keeps the creation order, and is safe if two requests arrive at the same time
    private final Map<String, Room> rooms = Collections.synchronizedMap(new LinkedHashMap<>());

    public void save(Room room) {
        rooms.put(room.getId(), room);
    }

    public Optional<Room> findById(String id) {
        return Optional.ofNullable(rooms.get(id));
    }

    public List<Room> findAll() {
        synchronized (rooms) {
            return new ArrayList<>(rooms.values());
        }
    }
}