package fr.iutinfo.seatingplan.student;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestController
@RequestMapping("/api/students")
public class StudentController {
	

	public record CreateStudentRequest(String firstName, String lastName, Group group, 	boolean needsPowerOutlet, Long promoId) {}
	private final StudentRepository repository;
	private final PromoRepository promos;


    public StudentController(StudentRepository repository, PromoRepository promos){
        this.repository = repository;
        this.promos = promos;
    }

    @GetMapping("")
    public List<Student> all() {
        return repository.findAll();
    }

    // end::get-aggregate-root[]

    @GetMapping("/{id}")
    public Student one(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
    }

    public Student replaceStudent(@RequestBody Student newStudent, @PathVariable Long id) {

        return repository.findById(id).map(
                student -> {
                    student.setFirstName(newStudent.getFirstName());
                    student.setLastName(newStudent.getLastName());
                    student.setGroupName(newStudent.getGroupName());
                    student.setNeedsPowerOutlet(false);
                    return repository.save(student);
                }).orElseGet(() -> {
            return repository.save(newStudent);
        });
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        repository.deleteById(id);
    }
    
    @PostMapping("")
    public ResponseEntity<Student> create(@RequestBody CreateStudentRequest request) {
        if (request == null || request.firstName() == null || request.firstName().isBlank()
                || request.lastName() == null || request.lastName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le prénom et le nom sont obligatoires");
        }
        if (request.group() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le groupe est obligatoire");
        }
        if (request.promoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La promo est obligatoire");
        }
        Promo promo = promos.findById(request.promoId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Promo introuvable : " + request.promoId()));

        Student student = new Student(request.firstName().trim(), request.lastName().trim(),
                request.group(), request.needsPowerOutlet(), promo);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(student));
    }

}
