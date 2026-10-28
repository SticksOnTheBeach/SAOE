package fr.iutinfo.seatingplan.placement;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedPlanRepository extends JpaRepository<SavedPlan, String> {
	 
    boolean existsByNameIgnoreCase(String name);
}
