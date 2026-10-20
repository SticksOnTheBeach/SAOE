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

    @Test
    void rejectsMissingSeats() {
        assertThatThrownBy(() -> new Room("1", "Room 1", 2, 2, List.of(seat(0, 0))))
                .isInstanceOf(IllegalArgumentException.class);
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

    @Test
    void usableSeatCountIgnoresForbiddenSeats() {
        Room room = new Room("t", "Test", 1, 3, List.of(
                new Seat("a", 0, 0, SeatType.AVAILABLE),
                new Seat("b", 0, 1, SeatType.FORBIDDEN),
                new Seat("c", 0, 2, SeatType.POWER_OUTLET)));

        assertThat(room.getUsableSeatCount()).isEqualTo(2);
        assertThat(room.getOutletSeatCount()).isEqualTo(1);
    }
}
