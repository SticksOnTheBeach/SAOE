package fr.iutinfo.seatingplan.room;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Stores the rooms in memory (they disappear when the backend restarts).
 * => on remplacera / supprimera cette classe par l'instanciation de lla BDD
 * et donc la gestion des données sera faites via la BDD que le front implémentera
 */
public interface RoomRepository extends JpaRepository<Room, String> {

}
