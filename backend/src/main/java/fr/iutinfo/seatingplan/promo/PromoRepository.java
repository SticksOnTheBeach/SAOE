package fr.iutinfo.seatingplan.promo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoRepository extends JpaRepository<Promo, Long> {
    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);
}
