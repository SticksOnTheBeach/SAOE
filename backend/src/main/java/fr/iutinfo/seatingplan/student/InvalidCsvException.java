package fr.iutinfo.seatingplan.student;

public class InvalidCsvException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidCsvException(String message) {
        super(message);
    }
}
