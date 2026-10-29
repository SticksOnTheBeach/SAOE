package fr.iutinfo.seatingplan.student.Exception;

public class StudentNotFoundException extends RuntimeException {


    private static final long serialVersionUID = 1L;

	public StudentNotFoundException(Long id) {
		super("L'étudiant correspondant à l'id : " + id + " n'as pas été trouvée");
    }
}
