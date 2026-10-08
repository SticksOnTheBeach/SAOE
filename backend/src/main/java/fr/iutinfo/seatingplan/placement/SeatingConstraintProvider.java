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
}
