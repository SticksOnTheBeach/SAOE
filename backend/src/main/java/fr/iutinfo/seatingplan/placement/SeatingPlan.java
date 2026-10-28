package fr.iutinfo.seatingplan.placement;

import java.util.List;

import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import fr.iutinfo.seatingplan.room.Seat;

/**
 * The whole problem handed to Timefold: the seats it can choose from,
 * one assignment per student to fill in, and the resulting score.
 *
 * Ce n'est PAS une entité JPA : c'est juste le "problème" que Timefold manipule en mémoire.
 * Le résultat enregistré en base est dans SavedPlan.
 */
@PlanningSolution
public class SeatingPlan {
    @ProblemFactCollectionProperty // collection de faits : ne change pas pendant la résolution
    @ValueRangeProvider // Timefold pioche les places dans cette liste pour les affecter aux variables de planification
    private List<Seat> seats;

    @PlanningEntityCollectionProperty // liste des entités à modifier : un SeatAssignment par étudiant
    private List<SeatAssignment> assignments;

    // Computed by Timefold: 0hard means every hard rule is respected
    @PlanningScore
    private HardSoftScore score;

    // Required by Timefold, which creates copies of the solution while solving
    public SeatingPlan() {}

    public SeatingPlan(List<Seat> seats, List<SeatAssignment> assignments) {
        this.seats = seats;
        this.assignments = assignments;
    }

    public List<Seat> getSeats() { return this.seats; }
    public List<SeatAssignment> getAssignments() { return this.assignments; }
    public HardSoftScore getScore() { return this.score; }

    public void setScore(HardSoftScore score) { this.score = score; }
}	
