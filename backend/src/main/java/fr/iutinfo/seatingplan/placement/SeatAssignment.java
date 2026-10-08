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
@PlanningEntity
public class SeatAssignment {
    @PlanningId
    private String id;
    private Student student;

    // Not final: Timefold sets it while solving
    @PlanningVariable
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
