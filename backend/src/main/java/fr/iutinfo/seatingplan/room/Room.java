package fr.iutinfo.seatingplan.room;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity // spécifie que la table correspond à une table de base de donnée, chaque objet de cette classe est enregistrée dans une base de donnée
public class Room {
    private final String id;
    private String name;
    private int rows;
    private int columns;
    private List<Seat> seats;

    public Room(String id, String name, int rows, int columns, List<Seat> seats) {
    	validateGridRoom(rows, columns, seats);
        this.id = id;
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        // Copy so that changing the caller's list later cannot change the room
        this.seats = List.copyOf(seats);
    }

    public void setName(String name){
        this.name = name;
    }
    public void setRows(int rows){
        this.rows = rows;
    }
    public void setColumns(int columns){
        this.columns = columns;
    }
    public void setSeats(List<Seat> seats){
        this.seats = seats;
    }
    public String getId() { return this.id; }
    public String getName() { return this.name; }
    public int getRows() { return this.rows; }
    public int getColumns() { return this.columns; }
    public List<Seat> getSeats() { return this.seats; }
    public int getSeatCount() { return this.seats.size(); }

    // on compte le nombre de sièges utilisables, c'est-à-dire ceux qui ne sont pas interdits
    public int getUsableSeatCount() {
        return (int) this.seats.stream().filter(seat -> seat.getType() != SeatType.FORBIDDEN).count();
    }

    public int getOutletSeatCount(){
        return this.seats.stream().filter(seat -> seat.getType() == SeatType.POWER_OUTLET).toList().size();
    }

    private static void validateGridRoom(int rows, int columns, List<Seat> seats) {
        if (rows <= 0 || columns <= 0) {
            throw new IllegalArgumentException("A room needs at least one row and one column");
        }

        // vérifie que le nombres de places n'est pas supérieure à la capacité de la salle
        if (seats.size() != rows * columns) {
            throw new IllegalArgumentException(
                    "Expected " + rows * columns + " seats for a " + rows + "x" + columns
                            + " room, got " + seats.size());
        }


        Set<String> usedCells = new HashSet<>();
        for (Seat seat : seats) {
            /* vérifie que la place n'est pas en dehors des coordonnées de la salle, par exemple que l'on ai pas une salle
            en 10 10 pour une salle de 9 rangées et 9 colonnes
             */
            if (seat.getRow() < 0 || seat.getRow() >= rows|| seat.getColumn() < 0 || seat.getColumn() >= columns) {
                throw new IllegalArgumentException("Seat " + seat.getId() + " is outside the room");
            }

            // on vérifie que deux places ne partagent pas la même case, donc la même colonne pour la même rangée
            if (!usedCells.add(seat.getRow() + "," + seat.getColumn())) {
                throw new IllegalArgumentException("Two seats share the cell of seat " + seat.getId());
            }
        }
    }
}
