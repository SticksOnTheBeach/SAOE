package fr.iutinfo.seatingplan.testdata;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Group;
import fr.iutinfo.seatingplan.student.Student;
import java.util.ArrayList;
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

    // Read top to bottom: row 0 is the front of the room.
    private static final SeatType[][] ROOM_105_LAYOUT = {
            {A, A, A, A, A, A},
            {A, A, F, A, A, A},
            {A, A, A, A, A, A},
            {A, F, A, A, A, A},
            {P, P, P, P, P, P},
    };

    private final Room room = buildRoom("105", "Room 105", ROOM_105_LAYOUT);

    public Room room() {
        return room;
    }

    // Built once: student ids are random UUIDs, so they must not change between calls.
    private final List<Student> students = List.of(
            new Student("Lea", "Martin", Group.G1A, false),
            new Student("Hugo", "Bernard", Group.G1A, true),
            new Student("Chloe", "Dubois", Group.G1A, false),
            new Student("Lucas", "Thomas", Group.G1A, false),
            new Student("Manon", "Robert", Group.G1A, false),
            new Student("Nathan", "Richard", Group.G1A, false),
            new Student("Ines", "Petit", Group.G1B, false),
            new Student("Jules", "Durand", Group.G1B, true),
            new Student("Emma", "Leroy", Group.G1B, false),
            new Student("Louis", "Moreau", Group.G1B, false),
            new Student("Sarah", "Simon", Group.G1B, false),
            new Student("Adam", "Laurent", Group.G1B, false));

    public List<Student> students() {
        return students;
    }

    private static Room buildRoom(String id, String name, SeatType[][] layout) {
        List<Seat> seats = new ArrayList<>();
        for (int row = 0; row < layout.length; row++) {
            for (int column = 0; column < layout[row].length; column++) {
                seats.add(new Seat("r" + row + "c" + column, row, column, layout[row][column]));
            }
        }
        return new Room(id, name, layout.length, layout[0].length, seats);
    }
}
