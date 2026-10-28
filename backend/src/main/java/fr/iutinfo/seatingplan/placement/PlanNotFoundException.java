package fr.iutinfo.seatingplan.placement;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class PlanNotFoundException extends ResponseStatusException {
	
	private static final long serialVersionUID = 1L;
	 
    public PlanNotFoundException(String id) {
        super(HttpStatus.NOT_FOUND, "Plan introuvable : " + id);
    }
}
