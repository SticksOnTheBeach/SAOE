package fr.iutinfo.seatingplan.room;

public class InvalidRoomException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidRoomException(String message) {
        super(message);
    }
}