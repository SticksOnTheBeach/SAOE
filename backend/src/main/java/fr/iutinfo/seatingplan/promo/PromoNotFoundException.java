package fr.iutinfo.seatingplan.promo;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class PromoNotFoundException extends ResponseStatusException {
	
	private static final long serialVersionUID = 1L;

 
	public PromoNotFoundException(Long id) {
	        
		super(HttpStatus.NOT_FOUND, "Promo introuvable : " + id);
	}
	
	
	
}
