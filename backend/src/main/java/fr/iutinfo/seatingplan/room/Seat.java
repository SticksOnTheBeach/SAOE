package fr.iutinfo.seatingplan.room;

public class Seat {
    private final String id;
    private final int row;
    private final int column;
    private final SeatType type;

    public Seat(String id, int row, int column, SeatType type) {
        this.id = id;
        this.row = row;
        this.column = column;
        this.type = type;
    }

    public String getId() { return this.id; }
    public int getRow() { return this.row; }
    public int getColumn() { return this.column; }
    public SeatType getType() { return this.type; }

    public boolean hasOutlet() {
        return this.type == SeatType.POWER_OUTLET;
    }
}