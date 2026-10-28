package fr.iutinfo.seatingplan.student;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestController
public class StudentController {
	
	private StudentRepository repository;
	
	StudentController(StudentRepository repository){
		
		this.repository = repository;
	}

	
	@GetMapping("/students")
	public List<Student> all(){
		return repository.findAll();
	}
	
	@GetMapping("/student/{id}")
	public Student one(@PathVariable Long id) {
		return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
	}
	
	
	@PutMapping("/students/{id}")
	Student replaceStudent(@RequestBody Student newStudent, @PathVariable Long id) {
	    
	    return repository.findById(id)
	      .map(student -> {
	    	 student.setFirstName(newStudent.getFirstName());
	    	 student.setLastName(newStudent.getLastName());
	    	 student.setGroupName(newStudent.getGroupName());
	    	 student.setNeedsPowerOutlet(newStudent.needsPowerOutlet());
	        return repository.save(student);
	      })
	      .orElseGet(() -> {
	        return repository.save(newStudent);
	      });
	}
	
	
	
	@DeleteMapping("/students/{id}")
	void deleteStudent(@PathVariable Long id) {
	    repository.deleteById(id);
	  }
}
