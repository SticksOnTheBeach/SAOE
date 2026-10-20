package fr.iutinfo.seatingplan.placement;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.student.Student;

/**
 * Links one student to the seat Timefold picks for them.
 * The student never changes; the seat is what the solver moves around.
 */
@PlanningEntity // ça dis à timefold que cette classe est une entité de planification, c'est-à-dire qu'elle contient des variables de planification qui peuvent être modifiées par le solveur pour trouver une solution optimale.
public class SeatAssignment {
    @PlanningId // ça dis à timefold que l'id de cette entité est l'id du student, c'est-à-dire que chaque étudiant a un id unique et que timefold peut utiliser cet id pour identifier l'entité.
    private String id;
    private Student student;

    // Not final: Timefold sets it while solving
    @PlanningVariable // ça dis à timefold "voici la variableque tu dois modifier pour trouver la meilleure solution"
    private Seat seat;

    // Required by Timefold, which creates copies of the entity while solving
    public SeatAssignment() {}

    public SeatAssignment(Student student) {
        this(student, null);
    }

    public SeatAssignment(Student student, Seat seat) {
        this.id = student.getId();
        this.student = student;
        this.seat = seat;
    }

    public String getId() { return this.id; }
    public Student getStudent() { return this.student; }
    public Seat getSeat() { return this.seat; }

    public void setSeat(Seat seat) { this.seat = seat; }
}
