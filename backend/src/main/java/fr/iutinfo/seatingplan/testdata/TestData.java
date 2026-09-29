package fr.iutinfo.seatingplan.testdata;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Student;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Hardcoded data for the MVP. It will be replaced by real data
 * (database, CSV import) after the client validates the direction.
 */
@Component
public class TestData {

    // One letter per seat so the grid below reads like the real room.
    private static final SeatType A = SeatType.AVAILABLE;
    private static final SeatType F = SeatType.FORBIDDEN;
    private static final SeatType P = SeatType.POWER_OUTLET;

    public Room room() {
        return new Room("105", List.of(
                List.of(A, A, A, A, A, A),
                List.of(A, A, F, A, A, A),
                List.of(A, A, A, A, A, A),
                List.of(A, F, A, A, A, A),
                List.of(P, P, P, P, P, P)));
    }

    public List<Student> students() {
        return List.of(
                new Student("s01", "Martin", "Lea", "G1A", false),
                new Student("s02", "Bernard", "Hugo", "G1A", true),
                new Student("s03", "Dubois", "Chloe", "G1A", false),
                new Student("s04", "Thomas", "Lucas", "G1A", false),
                new Student("s05", "Robert", "Manon", "G1A", false),
                new Student("s06", "Richard", "Nathan", "G1A", false),
                new Student("s07", "Petit", "Ines", "G1B", false),
                new Student("s08", "Durand", "Jules", "G1B", true),
                new Student("s09", "Leroy", "Emma", "G1B", false),
                new Student("s10", "Moreau", "Louis", "G1B", false),
                new Student("s11", "Simon", "Sarah", "G1B", false),
                new Student("s12", "Laurent", "Adam", "G1B", false));
    }
}
