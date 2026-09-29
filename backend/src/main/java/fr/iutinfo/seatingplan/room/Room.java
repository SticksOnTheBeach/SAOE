package fr.iutinfo.seatingplan.room;

import java.util.List;

public record Room(String name, List<List<SeatType>> seats) {
}
