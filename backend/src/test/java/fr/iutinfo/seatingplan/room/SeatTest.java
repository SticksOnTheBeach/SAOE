package fr.iutinfo.seatingplan.room;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class SeatTest {

    private static Seat seat(int row, int column) {
        return new Seat("r" + row + "c" + column, row, column, SeatType.AVAILABLE);
    }

    @Test
    void seatsSideBySideAreNeighbors() {
        assertThat(seat(1, 1).isNeighborOf(seat(1, 2))).isTrue();
        assertThat(seat(1, 1).isNeighborOf(seat(1, 0))).isTrue();
    }

    @Test
    void seatsInFrontAndBehindAreNeighbors() {
        assertThat(seat(1, 1).isNeighborOf(seat(0, 1))).isTrue();
        assertThat(seat(1, 1).isNeighborOf(seat(2, 1))).isTrue();
    }

    @Test
    void diagonalSeatsAreNotNeighbors() {
        assertThat(seat(1, 1).isNeighborOf(seat(2, 2))).isFalse();
    }

    @Test
    void distantSeatsAreNotNeighbors() {
        assertThat(seat(1, 1).isNeighborOf(seat(1, 3))).isFalse();
    }

    @Test
    void aSeatIsNotItsOwnNeighbor() {
        Seat seat = seat(1, 1);

        assertThat(seat.isNeighborOf(seat)).isFalse();
    }

    // deux fois le même équipement ça veut rien dire, donc on refuse
    @Test
    void rejectsTheSameEquipmentTwice() {
        assertThatThrownBy(() -> new Seat("a", 0, 0, SeatType.AVAILABLE,
                List.of(SeatEquipment.PRM, SeatEquipment.PRM)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // une place interdite c'est une place où personne s'assoit, donc lui mettre une prise ça sert à rien
    @Test
    void rejectsEquipmentOnAForbiddenSeat() {
        assertThatThrownBy(() -> new Seat("a", 0, 0, SeatType.FORBIDDEN,
                List.of(SeatEquipment.POWER_OUTLET)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // par contre une place interdite SANS équipement, ça c'est normal
    @Test
    void acceptsAForbiddenSeatWithoutEquipment() {
        Seat seat = new Seat("a", 0, 0, SeatType.FORBIDDEN, List.of());

        assertThat(seat.isUsable()).isFalse();
        assertThat(seat.getEquipment()).isEmpty();
    }

    // equipment null = aucun équipement, ça doit pas péter
    @Test
    void nullEquipmentBecomesAnEmptyList() {
        Seat seat = new Seat("a", 0, 0, SeatType.AVAILABLE, null);

        assertThat(seat.getEquipment()).isEmpty();
        assertThat(seat.has(SeatEquipment.PRM)).isFalse();
    }

    @Test
    void keepsItsEquipment() {
        Seat seat = new Seat("a", 0, 0, SeatType.AVAILABLE,
                List.of(SeatEquipment.PRM, SeatEquipment.POWER_OUTLET));

        assertThat(seat.has(SeatEquipment.PRM)).isTrue();
        assertThat(seat.has(SeatEquipment.POWER_OUTLET)).isTrue();
    }

    // le getter renvoie une liste non modifiable, sinon n'importe qui pourrait rajouter un
    // équipement sans passer par la validation
    @Test
    void getEquipmentCannotBeModified() {
        Seat seat = new Seat("a", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.PRM));

        assertThatThrownBy(() -> seat.getEquipment().add(SeatEquipment.POWER_OUTLET))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void updateReplacesTypeAndEquipment() {
        Seat seat = new Seat("a", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.PRM));

        seat.update(SeatType.AVAILABLE, List.of(SeatEquipment.POWER_OUTLET));

        assertThat(seat.getEquipment()).containsExactly(SeatEquipment.POWER_OUTLET);
    }

    // si l'update est refusé, la place doit rester exactement comme avant
    @Test
    void updateRejectsEquipmentOnAForbiddenSeat() {
        Seat seat = new Seat("a", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.PRM));

        assertThatThrownBy(() -> seat.update(SeatType.FORBIDDEN, List.of(SeatEquipment.PRM)))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(seat.getType()).isEqualTo(SeatType.AVAILABLE);
        assertThat(seat.getEquipment()).containsExactly(SeatEquipment.PRM);
    }
}
