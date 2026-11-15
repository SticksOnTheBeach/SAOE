package fr.iutinfo.seatingplan.promo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PromoRepository extends JpaRepository<Promo, Long> {
    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);
    Optional<Promo> findByNameIgnoreCase(String name);
    
    // trouver une promo ( son nom ) par son id
    @Query("SELECT p.name FROM Promo p WHERE p.id = :id")
    Optional<String> findNameById(@Param("id") Long id);
}
