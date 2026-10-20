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
 */
@PlanningSolution
public class SeatingPlan {
    @ProblemFactCollectionProperty // ça dis à timefold que cette liste est une collection de faits du problème, c'est-à-dire que ce sont des données qui ne changent pas pendant la résolution du problème.
    @ValueRangeProvider // pioche les valeurs à partir de cette liste pour les affecter aux variables de planification
    private List<Seat> seats;

    @PlanningEntityCollectionProperty // liste des entité à mofifier
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
