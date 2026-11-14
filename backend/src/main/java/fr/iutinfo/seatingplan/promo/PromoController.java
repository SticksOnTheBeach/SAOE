package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RestController;

import fr.iutinfo.seatingplan.room.RoomNotFoundException;
import fr.iutinfo.seatingplan.student.Student;
import fr.iutinfo.seatingplan.student.StudentRepository;

@RestController
@RequestMapping("/api/promos")
public class PromoController {

	
	
	private PromoRepository promoRepository;
	private StudentRepository studentRepository;
	
	public PromoController(PromoRepository promoRepository, StudentRepository studentRepository) {
		this.promoRepository = promoRepository;
		this.studentRepository = studentRepository;
	}
	
	@GetMapping()
	public List<Promo> all(){
		return promoRepository.findAll();
	}
	
	@GetMapping("/{id}")
	public Promo one(@PathVariable Long id) {
		return promoRepository.findById(id).orElseThrow(() -> new PromoNotFoundException(id));
	}
	
	@GetMapping("/{id}/students")
	public List<Student> studentsParPromo(@PathVariable Long id){
		promoRepository.findById(id).orElseThrow(() -> new PromoNotFoundException(id));		
		return studentRepository.findByPromoId(id);
	}
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deletePromo(@PathVariable Long id) {
	    if (!promoRepository.existsById(id)) {
	        throw new PromoNotFoundException(id);
	    }
	    long studentCount = studentRepository.countByPromoId(id);
	    if (studentCount > 0) {
	        throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible de supprimer cette promo : elle contient " + studentCount + " étudiant(s)");
	    }
	    promoRepository.deleteById(id);
	}
}
