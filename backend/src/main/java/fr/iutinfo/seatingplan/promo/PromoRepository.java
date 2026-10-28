package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoRepository extends JpaRepository<Promo, Long> {
	List<Promo> findByPromoId(Long promoId);
}
