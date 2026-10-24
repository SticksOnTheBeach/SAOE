package fr.iutinfo.seatingplan.room;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Room> findByNameIgnoreCase(String name);
}