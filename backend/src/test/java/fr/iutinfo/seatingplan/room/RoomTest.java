package fr.iutinfo.seatingplan.room;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;

class RoomTest {

    private static Seat seat(int row, int column) {
        return new Seat("r" + row + "c" + column, row, column, SeatType.AVAILABLE);
    }

    @Test
    void acceptsACompleteGrid() {
        Room room = new Room("1", "Room 1", 1, 2, List.of(seat(0, 0), seat(0, 1)));

        assertThat(room.getSeats()).hasSize(2);
    }

    // depuis le commit 001852b la salle prend des places indépendantes et plus forcément rows*columns places,
    // donc une grille à trous c'est normal maintenant (une salle peut avoir des cases sans table)
    @Test
    void acceptsAGridWithHoles() {
        Room room = new Room("1", "Room 1", 2, 2, List.of(seat(0, 0)));

        assertThat(room.getSeatCount()).isEqualTo(1);
    }

    @Test
    void rejectsSeatOutsideTheRoom() {
        assertThatThrownBy(() -> new Room("1", "Room 1", 1, 2, List.of(seat(0, 0), seat(5, 1))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsTwoSeatsOnTheSameCell() {
        assertThatThrownBy(() -> new Room("1", "Room 1", 1, 2, List.of(seat(0, 0), seat(0, 0))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void isNotAffectedByChangesToTheOriginalList() {
        List<Seat> seats = new ArrayList<>(List.of(seat(0, 0), seat(0, 1)));
        Room room = new Room("1", "Room 1", 1, 2, seats);

        seats.clear();

        assertThat(room.getSeats()).hasSize(2);
    }

    // POWER_OUTLET c'est plus un SeatType mais un équipement, du coup la place est AVAILABLE
    // et elle a juste une prise dans sa liste d'équipements
    @Test
    void usableSeatCountIgnoresForbiddenSeats() {
        Room room = new Room("t", "Test", 1, 3, List.of(
                new Seat("a", 0, 0, SeatType.AVAILABLE, List.of()),
                new Seat("b", 0, 1, SeatType.FORBIDDEN, List.of()),
                new Seat("c", 0, 2, SeatType.AVAILABLE, List.of(SeatEquipment.POWER_OUTLET))));

        assertThat(room.getUsableSeatCount()).isEqualTo(2);
        assertThat(room.getPowerOutletSeatCount()).isEqualTo(1);
    }

    // une place peut avoir plusieurs équipements à la fois, et elle compte dans les deux compteurs
    @Test
    void countsEachEquipmentSeparately() {
        Room room = new Room("t", "Test", 1, 3, List.of(
                new Seat("a", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.PRM, SeatEquipment.POWER_OUTLET)),
                new Seat("b", 0, 1, SeatType.AVAILABLE, List.of(SeatEquipment.PRM)),
                new Seat("c", 0, 2, SeatType.AVAILABLE, List.of())));

        assertThat(room.getPrmSeatCount()).isEqualTo(2);
        assertThat(room.getPowerOutletSeatCount()).isEqualTo(1);
        assertThat(room.countWith(SeatEquipment.POWER_OUTLET)).isEqualTo(1);
    }

    // update garde la place qui était déjà sur la case (même id) et change juste son type/ses équipements
    @Test
    void updateKeepsTheExistingSeatOfACellAndChangesItsEquipment() {
        Room room = new Room("t", "Test", 1, 2, List.of(
                new Seat("a", 0, 0, SeatType.AVAILABLE, List.of()),
                new Seat("b", 0, 1, SeatType.AVAILABLE, List.of())));

        room.update("Test", 1, 2, List.of(
                new Seat("nouveau1", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.PRM)),
                new Seat("nouveau2", 0, 1, SeatType.FORBIDDEN, List.of())));

        Seat first = room.getSeats().stream().filter(s -> s.getColumn() == 0).findFirst().orElseThrow();
        assertThat(first.getId()).isEqualTo("a");
        assertThat(first.getEquipment()).containsExactly(SeatEquipment.PRM);
        assertThat(room.getPrmSeatCount()).isEqualTo(1);
        assertThat(room.getUsableSeatCount()).isEqualTo(1);
    }
}
