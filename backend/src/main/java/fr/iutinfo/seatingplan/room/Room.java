package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;

@Entity
public class Room {
    @Id
    private String id;
    private String name;

    @Column(name = "room_rows")
    private int rows;

    @Column(name = "room_columns")
    private int columns;

    // orphanRemoval : une place retirée de la liste est supprimée de la base
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private List<Seat> seats = new ArrayList<>();

    protected Room() {}

    public Room(String id, String name, int rows, int columns, List<Seat> seats) {
        validateGridRoom(rows, columns, seats);
        this.id = id;
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        // Copie modifiable : Hibernate a besoin d'une vraie liste
        this.seats = new ArrayList<>(seats);
    }

    public String getId() { return this.id; }
    public String getName() { return this.name; }
    public int getRows() { return this.rows; }
    public int getColumns() { return this.columns; }
    public List<Seat> getSeats() { return this.seats; }
    public int getSeatCount() { return this.seats.size(); }

    // places utilisables = celles qui ne sont pas interdites
    public int getUsableSeatCount() {
        return (int) seats.stream().filter(Seat::isUsable).count();
    }

    public int getOutletSeatCount() {
        return (int) this.seats.stream().filter(Seat::hasOutlet).count();
    }

    /**
     * Modifie la salle en une seule fois (nom, dimensions, places).
     * Les places qui existent déjà à la même case sont modifiées sur place (même id),
     * celles qui n'y sont plus sont supprimées, les nouvelles sont ajoutées.
     * Tout est vérifié avant de changer quoi que ce soit.
     */
    public void update(String name, int rows, int columns, List<Seat> newSeats) {
        validateGridRoom(rows, columns, newSeats);

        this.name = name;
        this.rows = rows;
        this.columns = columns;

        Map<String, Seat> existingByCell = new HashMap<>();
        for (Seat seat : this.seats) {
            existingByCell.put(cellKey(seat.getRow(), seat.getColumn()), seat);
        }

        List<Seat> result = new ArrayList<>();
        for (Seat wanted : newSeats) {
            Seat existing = existingByCell.get(cellKey(wanted.getRow(), wanted.getColumn()));
            if (existing != null) {
                existing.setType(wanted.getType());
                result.add(existing);
            } else {
                result.add(wanted);
            }
        }

        this.seats.retainAll(result);
        for (Seat seat : result) {
            if (!this.seats.contains(seat)) {
                this.seats.add(seat);
            }
        }
    }

    private static String cellKey(int row, int column) {
        return row + "," + column;
    }

    private static void validateGridRoom(int rows, int columns, List<Seat> seats) {
        if (rows <= 0 || columns <= 0) {
            throw new IllegalArgumentException("A room needs at least one row and one column");
        }

        Set<String> usedCells = new HashSet<>();
        for (Seat seat : seats) {
            // la place doit être dans la grille
            if (seat.getRow() < 0 || seat.getRow() >= rows || seat.getColumn() < 0 || seat.getColumn() >= columns) {
                throw new IllegalArgumentException("Seat " + seat.getId() + " is outside the room");
            }
            // deux places ne peuvent pas partager la même case
            if (!usedCells.add(cellKey(seat.getRow(), seat.getColumn()))) {
                throw new IllegalArgumentException("Two seats share the cell of seat " + seat.getId());
            }
        }
    }
}