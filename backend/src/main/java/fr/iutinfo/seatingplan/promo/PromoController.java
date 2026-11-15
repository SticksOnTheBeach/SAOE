package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.student.Student;
import fr.iutinfo.seatingplan.student.StudentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/promos")
public class PromoController {

	
	
	private PromoRepository promoRepository;
	private StudentRepository studentRepository;
	
	public record PromoCreateRequest(@NotBlank @Size(max = 50) String name) {}

	
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
	
	/* MÉTHODE PERMETTANT DE SUPPRIMER UNE PROMO MAIS PAS DE LA VIDER, SI LA PROMO CONTIENT DES ELÈVES CETTE DERNIÈRE NE PEUT ÊTRE SUPPRIMÉE
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
	}*/
	
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Transactional
	public void deletePromo(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean withStudents) {
	    if (!promoRepository.existsById(id)) {
	        throw new PromoNotFoundException(id);
	    }
	    String promoName = promoRepository.findNameById(id).orElseThrow(() -> new PromoNotFoundException(id));
	    long studentCount = studentRepository.countByPromoId(id);
	    if (studentCount > 0) {
	        if (!withStudents) {
	            throw new ResponseStatusException(HttpStatus.CONFLICT, "La promotion" + promoName + "contient " + studentCount + " étudiant(s) : confirmez la suppression pour les supprimer avec elle");
	        }
	        studentRepository.deleteByPromoId(id);
	    }
	    promoRepository.deleteById(id);
	}
	
	// permet de vider une promo de ses étudiants
	@DeleteMapping("/{id}/students")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Transactional
	public void emptyPromo(@PathVariable Long id) {
		if (!promoRepository.existsById(id)) {
			throw new PromoNotFoundException(id);
		}
		studentRepository.deleteByPromoId(id);
	}
	

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Promo create(@Valid @RequestBody PromoCreateRequest request) {
	    String name = request.name().trim();
	    if (promoRepository.existsByNameIgnoreCase(name)) {
	        throw new ResponseStatusException(HttpStatus.CONFLICT, "Une promotion nommée " + name + " existe déjà");
	    }
	    return promoRepository.save(new Promo(name));
	}
}
