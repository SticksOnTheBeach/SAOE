package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

// import org.hibernate.mapping.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;

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
    	
    // set permet de ne pas avoir de doublons et évite d'utiliser list etc...
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "seat_equipment", joinColumns = @JoinColumn(name = "seat_id"))
    @Enumerated(EnumType.STRING)
    @OrderColumn(name = "position")
    private List<SeatEquipment> equipment = new ArrayList<>();

    protected Seat() {}
    
    
    // voir pour faire en sorte qu'une place ait plusieurs types. Peut-être une liste de type dcp ?
    public Seat(String id, int row, int column, SeatType type, List<SeatEquipment> equipment) {
    	checkEquipment(type, equipment);
        this.id = id;
        this.row = row;
        this.column = column;
        this.type = type;
        this.equipment = new ArrayList<>(equipment); 
    }
    
    public Seat(String id, int row, int column, SeatType type) {
        this(id, row, column, type, List.of());
    }

    public String getId() { return this.id; }
    public int getRow() { return this.row; }
    public int getColumn() { return this.column; }
    public SeatType getType() { return this.type; }

    // Utilisé par Room.update : on change le type d'une place existante sans la recréer
    public void setType(SeatType type) { this.type = type; }
    
    // public void setEquipment(SeatEquipment equipment) { this.equipment.add(equipment); }

    public boolean has(SeatEquipment e) { 
    	return this.equipment.contains(e); 
    }
    
    /*public List<SeatEquipment> getEquipment() {
    	return this.equipment;
    }*/
    public List<SeatEquipment> getEquipment() { return Collections.unmodifiableList(this.equipment); }
    
    
    public boolean isUsable() {
        return this.type != SeatType.FORBIDDEN;
    }

    // Direct neighbors share a side: left, right, front or back (not diagonal)
    public boolean isNeighborOf(Seat other) {
        int rowGap = Math.abs(this.row - other.row);
        int columnGap = Math.abs(this.column - other.column);
        return rowGap + columnGap == 1;
    }
    
    
    public void update(SeatType type, List<SeatEquipment> equipment) {
        checkEquipment(type, equipment);
        this.type = type;
        // clear + addAll Hibernate suit les changements du même Set
        this.equipment.clear();
        this.equipment.addAll(equipment);
    }
 
    
    private static void checkEquipment(SeatType type, List<SeatEquipment> equipment) {
        if (type == null) {
            throw new IllegalArgumentException("A seat needs a type");
        }
        if (type == SeatType.FORBIDDEN && !equipment.isEmpty()) {
            throw new IllegalArgumentException("A forbidden seat cannot have equipment");
        }
        
        if (new HashSet<>(equipment).size() != equipment.size()) {
            throw new IllegalArgumentException("A seat cannot have the same equipment twice");
        }
    }
}