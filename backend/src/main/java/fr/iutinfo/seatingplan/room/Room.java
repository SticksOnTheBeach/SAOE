package fr.iutinfo.seatingplan.room;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Room {
    private final String id;
    private final String name;
    private final int rows;
    private final int columns;
    private final List<Seat> seats;

    public Room(String id, String name, int rows, int columns, List<Seat> seats) {
        validateGrid(rows, columns, seats);
        this.id = id;
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        // Copy so that changing the caller's list later cannot change the room
        this.seats = List.copyOf(seats);
    }

    public String getId() { return this.id; }
    public String getName() { return this.name; }
    public int getRows() { return this.rows; }
    public int getColumns() { return this.columns; }
    public List<Seat> getSeats() { return this.seats; }

    // The solver and the frontend both assume exactly one seat per cell of the grid.
    private static void validateGrid(int rows, int columns, List<Seat> seats) {
        if (rows <= 0 || columns <= 0) {
            throw new IllegalArgumentException("A room needs at least one row and one column");
        }
        if (seats.size() != rows * columns) {
            throw new IllegalArgumentException(
                    "Expected " + rows * columns + " seats for a " + rows + "x" + columns
                            + " room, got " + seats.size());
        }

        Set<String> usedCells = new HashSet<>();
        for (Seat seat : seats) {
            if (seat.getRow() < 0 || seat.getRow() >= rows
                    || seat.getColumn() < 0 || seat.getColumn() >= columns) {
                throw new IllegalArgumentException("Seat " + seat.getId() + " is outside the room");
            }
            if (!usedCells.add(seat.getRow() + "," + seat.getColumn())) {
                throw new IllegalArgumentException("Two seats share the cell of seat " + seat.getId());
            }
        }
    }
}
