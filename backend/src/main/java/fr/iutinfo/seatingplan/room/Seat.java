package fr.iutinfo.seatingplan.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

@Entity
public class Seat {
	@Id
	private String id;
	@Column(name = "seat_row")
	private int row;
	@Column(name = "seat_column")
	private int column;
	@Enumerated(EnumType.STRING)
	private SeatType type;
	
    protected Seat() {} 

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
    
    public boolean isUsable() {
    	if (!(this.type==SeatType.NOSEAT) && !(this.type==SeatType.FORBIDDEN)) {
    		return true;
    	}
    	return false;
    }

    // Direct neighbors share a side: left, right, front or back (not diagonal)
    public boolean isNeighborOf(Seat other) {
        int rowGap = Math.abs(this.row - other.row);
        int columnGap = Math.abs(this.column - other.column);
        return rowGap + columnGap == 1;
    }
}
