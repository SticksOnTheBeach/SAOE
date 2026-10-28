package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promos")
public class PromoController {

	
	
	private PromoRepository repository;
	
	public PromoController(PromoRepository repository) {
		this.repository = repository;
	}
	
	@GetMapping()
	public List<Promo> all(){
		return repository.findAll();
	}
	
	@GetMapping("/{id}")
	public Promo one(@PathVariable Long id) {
		return repository.findById(id).orElseThrow(() -> new PromoNotFoundException(id));
	}
}
