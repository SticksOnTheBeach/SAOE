package fr.iutinfo.seatingplan.student;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestController
public class StudentController {

    private final StudentRepository repository;


    public StudentController(StudentRepository repository){
        this.repository = repository;
    }

    @GetMapping("/students")
    public List<Student> all() {
        return repository.findAll();
    }

    // end::get-aggregate-root[]

    @PostMapping("/students")
    public Student newEmployee(@RequestBody Student newStudent) {
        return repository.save(newStudent);

    }
    @GetMapping("/students/{id}")
    public Student one(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
    }

    public Student replaceStudent(@RequestBody Student newStudent, @PathVariable Long id) {

        return repository.findById(id).map(
                student -> {
                    student.setFirstName(newStudent.getFirstName());
                    student.setLastName(newStudent.getLastName());
                    student.setGroup(newStudent.getGroupName());
                    return repository.save(student);
                }).orElseGet(() -> {
            return repository.save(newStudent);
        });
    }

    @DeleteMapping("/students/{id}")
    public void deleteStudent(@PathVariable Long id) {
        repository.deleteById(id);
    }

}
