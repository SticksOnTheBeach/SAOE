package fr.iutinfo.seatingplan.plan;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record SeatAssignment(String studentId, String seatId,
        @Column(name = "seat_row") int row, @Column(name = "seat_column") int column) {}
