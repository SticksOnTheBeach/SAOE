package fr.iutinfo.seatingplan.placement;

import ai.timefold.solver.test.api.score.stream.ConstraintVerifier;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Group;
import fr.iutinfo.seatingplan.student.Student;
import org.junit.jupiter.api.Test;

class SeatingConstraintProviderTest {

    private final ConstraintVerifier<SeatingConstraintProvider, SeatingPlan> constraintVerifier =
            ConstraintVerifier.build(new SeatingConstraintProvider(), SeatingPlan.class, SeatAssignment.class);

    private static Seat seat(int row, int column, SeatType type) {
        return new Seat("r" + row + "c" + column, row, column, type);
    }

    private static Student student(Group group) {
        return new Student("First", "Last", group, false);
    }

    // Forbidden seat

    @Test
    void forbiddenSeatIsPenalized() {
        SeatAssignment assignment = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.FORBIDDEN));

        constraintVerifier.verifyThat(SeatingConstraintProvider::forbiddenSeat)
                .given(assignment)
                .penalizesBy(1);
    }

    @Test
    void availableSeatIsNotPenalized() {
        SeatAssignment assignment = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.AVAILABLE));

        constraintVerifier.verifyThat(SeatingConstraintProvider::forbiddenSeat)
                .given(assignment)
                .penalizesBy(0);
    }

    // Same group neighbors

    @Test
    void sameGroupSideBySideIsPenalized() {
        SeatAssignment first = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.AVAILABLE));
        SeatAssignment second = new SeatAssignment(student(Group.G1A), seat(0, 1, SeatType.AVAILABLE));

        constraintVerifier.verifyThat(SeatingConstraintProvider::sameGroupNeighbors)
                .given(first, second)
                .penalizesBy(1);
    }

    @Test
    void sameGroupOneBehindTheOtherIsPenalized() {
        SeatAssignment first = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.AVAILABLE));
        SeatAssignment second = new SeatAssignment(student(Group.G1A), seat(1, 0, SeatType.AVAILABLE));

        constraintVerifier.verifyThat(SeatingConstraintProvider::sameGroupNeighbors)
                .given(first, second)
                .penalizesBy(1);
    }

    @Test
    void differentGroupsSideBySideAreNotPenalized() {
        SeatAssignment first = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.AVAILABLE));
        SeatAssignment second = new SeatAssignment(student(Group.G1B), seat(0, 1, SeatType.AVAILABLE));

        constraintVerifier.verifyThat(SeatingConstraintProvider::sameGroupNeighbors)
                .given(first, second)
                .penalizesBy(0);
    }

    @Test
    void sameGroupOnDiagonalIsNotPenalized() {
        SeatAssignment first = new SeatAssignment(student(Group.G1A), seat(0, 0, SeatType.AVAILABLE));
        SeatAssignment second = new SeatAssignment(student(Group.G1A), seat(1, 1, SeatType.AVAILABLE));

        constraintVerifier.verifyThat(SeatingConstraintProvider::sameGroupNeighbors)
                .given(first, second)
                .penalizesBy(0);
    }
}
