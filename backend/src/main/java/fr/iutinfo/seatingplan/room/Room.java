package fr.iutinfo.seatingplan.room;

import java.util.List;

public class Room {
    private final String id;
    private final String name;
    private final int rows;
    private final int columns;
    private final List<Seat> seats;

    public Room(String id, String name, int rows, int columns, List<Seat> seats) {
        this.id = id;
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.seats = seats;
    }

    public String getId() { return this.id; }
    public String getName() { return this.name; }
    public int getRows() { return this.rows; }
    public int getColumns() { return this.columns; }
    public List<Seat> getSeats() { return this.seats; }
}