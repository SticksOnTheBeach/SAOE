package fr.iutinfo.seatingplan.placement;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.room.Room;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

/**
 * Un plan de classe enregistré : une promo, une ou plusieurs salles,
 * et pour chaque étudiant la place que Timefold lui a donnée.
 *
 * rooms et placements sont LAZY : il faut donc les lire dans une méthode @Transactional
 * (open-in-view est désactivé).
 */
@Entity
public class SavedPlan {
    @Id
    private String id;
    private String name;
    private Instant createdAt;

    // Résultat du solveur : feasible = true quand toutes les règles "hard" sont respectées
    private int hardScore;
    private int softScore;
    private boolean feasible;

    @ManyToOne
    @JoinColumn(name = "promo_id")
    private Promo promo;

    @ManyToMany
    @JoinTable(name = "saved_plan_room",
            joinColumns = @JoinColumn(name = "plan_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id"))
    private List<Room> rooms = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "plan_id")
    private List<PlacedStudent> placements = new ArrayList<>();

    protected SavedPlan() {}

    public SavedPlan(String name, Promo promo, List<Room> rooms, SeatingPlan solved) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.promo = promo;
        this.createdAt = Instant.now();
        this.rooms = new ArrayList<>(rooms);
        for (SeatAssignment assignment : solved.getAssignments()) {
            this.placements.add(new PlacedStudent(assignment.getStudent(), assignment.getSeat()));
        }
        this.hardScore = solved.getScore().hardScore();
        this.softScore = solved.getScore().softScore();
        this.feasible = this.hardScore == 0;
    }

    public String getId() { return this.id; }
    public String getName() { return this.name; }
    public Instant getCreatedAt() { return this.createdAt; }
    public int getHardScore() { return this.hardScore; }
    public int getSoftScore() { return this.softScore; }
    public boolean isFeasible() { return this.feasible; }
    public Promo getPromo() { return this.promo; }
    public List<Room> getRooms() { return this.rooms; }
    public List<PlacedStudent> getPlacements() { return this.placements; }
}
