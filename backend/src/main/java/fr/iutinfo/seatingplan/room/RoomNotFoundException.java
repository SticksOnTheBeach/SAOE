
package fr.iutinfo.seatingplan.room;

public class RoomNotFoundException extends RuntimeException {


    public RoomNotFoundException(String id) {
        super("Could not find room" + id);
    }
}
