package fr.iutinfo.seatingplan.promo;

public class PromoNotFoundController extends RuntimeException {
	
	private static final long serialVersionUID = 1L;

	public PromoNotFoundController(Long id) {
        super("Could not find promo : " + id);
    }
	
	
}
