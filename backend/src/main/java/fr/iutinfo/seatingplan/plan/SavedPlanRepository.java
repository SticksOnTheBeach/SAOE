package fr.iutinfo.seatingplan.plan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SavedPlanRepository extends JpaRepository<SavedPlan, String> {
    @Modifying
    @Query("update SavedPlan p set p.promo = null where p.promo.id = :promoId")
    void detachPromo(Long promoId);
}
