package fr.iutinfo.seatingplan.room;

import static org.assertj.core.api.Assertions.assertThat;

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
}
