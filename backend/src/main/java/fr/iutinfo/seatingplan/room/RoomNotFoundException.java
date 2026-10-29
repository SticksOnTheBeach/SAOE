package fr.iutinfo.seatingplan.room;

public class RoomNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RoomNotFoundException(String id) {
        super("Erreur : la salle " + id + " n'a pas été trouvée.");
    }
}