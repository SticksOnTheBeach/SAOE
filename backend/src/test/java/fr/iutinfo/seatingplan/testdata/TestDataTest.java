package fr.iutinfo.seatingplan.testdata;

import static org.assertj.core.api.Assertions.assertThat;

import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Student;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class TestDataTest {

    private final TestData testData = new TestData();

    @Test
    void roomGridIsRectangular() {
        List<List<SeatType>> seats = testData.room().seats();
        int columns = seats.get(0).size();

        assertThat(seats).allSatisfy(row -> assertThat(row).hasSize(columns));
    }

    @Test
    void roomHasExactlyTwoForbiddenSeats() {
        assertThat(countSeats(SeatType.FORBIDDEN)).isEqualTo(2);
    }

    @Test
    void roomHasEnoughUsableSeatsForAllStudents() {
        long usableSeats = testData.room().seats().stream()
                .flatMap(List::stream)
                .filter(seat -> seat != SeatType.FORBIDDEN)
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
                .map(Student::id)
                .distinct()
                .count();

        assertThat(distinctIds).isEqualTo(testData.students().size());
    }

    @Test
    void severalStudentsShareTheSameGroup() {
        // Needed to be able to test the "same group, no direct neighbors" rule later.
        Map<String, Long> studentsPerGroup = testData.students().stream()
                .collect(Collectors.groupingBy(Student::groupName, Collectors.counting()));

        assertThat(studentsPerGroup.values()).allMatch(count -> count >= 2);
    }

    private long countSeats(SeatType type) {
        return testData.room().seats().stream()
                .flatMap(List::stream)
                .filter(seat -> seat == type)
                .count();
    }
}
