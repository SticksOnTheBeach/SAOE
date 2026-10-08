package fr.iutinfo.seatingplan.placement;

import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;
import fr.iutinfo.seatingplan.room.SeatType;

/**
 * The placement rules. Timefold only maximizes the score: each rule
 * says which situations cost points, and how many.
 */
public class SeatingConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[] {
                forbiddenSeat(factory),
                sameGroupNeighbors(factory),
                powerOutletNeeded(factory),
                oneStudentPerSeat(factory),
        };
    }

    // No student on a forbidden seat
    Constraint forbiddenSeat(ConstraintFactory factory) {
        return factory.forEach(SeatAssignment.class)
                .filter(assignment -> assignment.getSeat().getType() == SeatType.FORBIDDEN)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Forbidden seat");
    }

    // Two students from the same group are never direct neighbors
    Constraint sameGroupNeighbors(ConstraintFactory factory) {
        return factory.forEachUniquePair(SeatAssignment.class,
                        Joiners.equal(assignment -> assignment.getStudent().getGroupName()))
                .filter((first, second) -> first.getSeat().isNeighborOf(second.getSeat()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Same group neighbors");
    }

    // A student who needs a power outlet always sits on a seat that has one
    Constraint powerOutletNeeded(ConstraintFactory factory) {
        return factory.forEach(SeatAssignment.class)
                .filter(assignment -> assignment.getStudent().needsPowerOutlet()
                        && !assignment.getSeat().hasOutlet())
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Power outlet needed");
    }

    // Two students never share the same seat
    Constraint oneStudentPerSeat(ConstraintFactory factory) {
        return factory.forEachUniquePair(SeatAssignment.class,
                        Joiners.equal(SeatAssignment::getSeat))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("One student per seat");
    }
}
