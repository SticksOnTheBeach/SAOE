package fr.iutinfo.seatingplan.testdata;

import static org.assertj.core.api.Assertions.assertThat;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Group;
import fr.iutinfo.seatingplan.student.Student;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class TestDataTest {

    private final TestData testData = new TestData();

    @Test
    void roomHasOneSeatPerCell() {
        Room room = testData.room();

        assertThat(room.getSeats()).hasSize(room.getRows() * room.getColumns());
    }

    @Test
    void seatIdsAreUnique() {
        long distinctIds = testData.room().getSeats().stream()
                .map(Seat::getId)
                .distinct()
                .count();

        assertThat(distinctIds).isEqualTo(testData.room().getSeats().size());
    }

    @Test
    void roomHasExactlyTwoForbiddenSeats() {
        assertThat(countSeats(SeatType.FORBIDDEN)).isEqualTo(2);
    }

    @Test
    void roomHasEnoughUsableSeatsForAllStudents() {
        long usableSeats = testData.room().getSeats().stream()
                .filter(seat -> seat.getType() != SeatType.FORBIDDEN)
                .count();

        assertThat(usableSeats).isGreaterThanOrEqualTo(testData.students().size());
    }

    @Test
    void roomHasEnoughPowerOutletsForStudentsWhoNeedOne() {
        long studentsNeedingOutlet = testData.students().stream()
                .filter(Student::needsPowerOutlet)
                .count();

        assertThat(studentsNeedingOutlet).isPositive();
        assertThat(countSeats(SeatType.POWER_OUTLET)).isGreaterThanOrEqualTo(studentsNeedingOutlet);
    }

    @Test
    void studentIdsAreUnique() {
        long distinctIds = testData.students().stream()
                .map(Student::getId)
                .distinct()
                .count();

        assertThat(distinctIds).isEqualTo(testData.students().size());
    }

    @Test
    void studentIdsStayTheSameBetweenCalls() {
        // The frontend identifies students by id, so ids must not be regenerated on each request.
        assertThat(testData.students().get(0).getId())
                .isEqualTo(testData.students().get(0).getId());
    }

    @Test
    void severalStudentsShareTheSameGroup() {
        // Needed to be able to test the "same group, no direct neighbors" rule later.
        Map<Group, Long> studentsPerGroup = testData.students().stream()
                .collect(Collectors.groupingBy(Student::getGroupName, Collectors.counting()));

        assertThat(studentsPerGroup.values()).allMatch(count -> count >= 2);
    }

    private long countSeats(SeatType type) {
        return testData.room().getSeats().stream()
                .filter(seat -> seat.getType() == type)
                .count();
    }
}
