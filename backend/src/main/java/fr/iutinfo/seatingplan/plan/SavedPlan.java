package fr.iutinfo.seatingplan.plan;

import java.time.Instant;

import org.springframework.data.annotation.Id;

import fr.iutinfo.seatingplan.promo.Promo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class SavedPlan {
	
	
	
	@Id
	@GeneratedValue(strategy=GenerationType.UUID)
	private final String uuid;
	private final String name;
	private final Instant createdAt;
	
	
	// Solver result: feasible = true when every hard rule is respected
    private int hardScore;
    private int softScore;
    private boolean feasible;

    
    @ManyToOne
    @JoinColumn(name = "promo_id")
    private Promo promo;
	
    
    // private ResourceType resource
	
	public SavedPlan();
}
