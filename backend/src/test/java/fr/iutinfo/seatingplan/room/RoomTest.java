package fr.iutinfo.seatingplan.room;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
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
}
