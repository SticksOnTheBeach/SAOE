package fr.iutinfo.seatingplan.testdata;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.room.SeatType;
import fr.iutinfo.seatingplan.student.Group;
import fr.iutinfo.seatingplan.student.Student;

/**
 * Hardcoded data for the MVP. It will be replaced by real data
 * (database, CSV import)
 */
@Component
public class TestData {

    // One letter per seat so the grid below reads like the real room.
    private static final SeatType A = SeatType.AVAILABLE;
    private static final SeatType F = SeatType.FORBIDDEN;
    private static final SeatType P = SeatType.POWER_OUTLET;
    private static final SeatType N = null;   // pas de place sur cette case

    // Read top to bottom: row 0 is the front of the room.
    private static final SeatType[][] ROOM_105_LAYOUT = {
            {A, A, A, A, A, A},
            {A, A, F, N, A, A},
            {A, A, N, N, A, A},
            {A, F, A, A, A, A},
            {P, P, P, P, P, P},
    };

    private static final SeatType[][] ROOM_106_LAYOUT = {
        {A, A, A, A},
        {A, A, A, A},
        {A, F, A, A},
        {P, P, P, P},
    };
    
    
    private static final SeatType[][] ROOM_10_LAYOUT = {
            {A, N},
            {A, A}
        };

    private final Room room = buildRoom("105", "Room 105", ROOM_105_LAYOUT);
    private final List<Room> rooms = List.of(room, buildRoom("106", "Room 106", ROOM_106_LAYOUT));
    private final Room room10 = buildRoom("10", "Room 10", ROOM_10_LAYOUT);

    
    public List<Room> rooms() { 
    	return rooms; 
    }
    
    public Room room(String name) {
        return buildRoom(name, "Room " + name, ROOM_10_LAYOUT);
    }
    
    public Room room() { return room; }

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
            	SeatType type = layout[row][column];
            	if (type != null) {
            	    seats.add(new Seat("r" + row + "c" + column, row, column, type));
            	}
            }
        }
        return new Room(id, name, layout.length, layout[0].length, seats);
    }
    
}
