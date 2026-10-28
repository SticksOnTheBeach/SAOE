package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
