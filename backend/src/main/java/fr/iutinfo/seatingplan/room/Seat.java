package fr.iutinfo.seatingplan.room;

public class Seat {
    private String id;
    private int row;
    private int column;
    private SeatType type;

    public Seat(String id, int row, int column, SeatType type) {
        this.id = id;
        this.row = row;
        this.column = column;
        this.type = type;
    }

    public String getId() { return id; }
    public int getRow() { return row; }
    public int getColumn() { return column; }
    public SeatType getType() { return type; }

    public boolean hasOutlet() {
        return this.type == SeatType.POWER_OUTLET;
    }
}
