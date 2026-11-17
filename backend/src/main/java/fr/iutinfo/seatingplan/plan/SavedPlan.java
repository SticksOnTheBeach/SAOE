package fr.iutinfo.seatingplan.plan;

import java.time.Instant;

import fr.iutinfo.seatingplan.promo.Promo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class SavedPlan {

	@Id
	@GeneratedValue(strategy=GenerationType.UUID)
	private String uuid;
	private String name;
	private Instant createdAt;

	// Solver result: feasible = true when every hard rule is respected
	private int hardScore;
	private int softScore;
	private boolean feasible;

	@ManyToOne
	@JoinColumn(name = "promo_id")
	private Promo promo;


	// private ResourceType resource

	protected SavedPlan() {}

	public SavedPlan(String name, Promo promo, int hardScore, int softScore, boolean feasible) {
		this.name = name;
		this.promo = promo;
		this.hardScore = hardScore;
		this.softScore = softScore;
		this.feasible = feasible;
		this.createdAt = Instant.now();
	}

	public String getUuid() { return this.uuid; }
	public String getName() { return this.name; }
	public Instant getCreatedAt() { return this.createdAt; }
	public int getHardScore() { return this.hardScore; }
	public int getSoftScore() { return this.softScore; }
	public boolean isFeasible() { return this.feasible; }
	public Promo getPromo() { return this.promo; }

	public void setName(String name) { this.name = name; }

	public void setScore(int hardScore, int softScore, boolean feasible) {
		this.hardScore = hardScore;
		this.softScore = softScore;
		this.feasible = feasible;
	}
}
