package fr.iutinfo.seatingplan.promo;

public class PromoNotFoundException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;

	public PromoNotFoundException(Long id) {
        super("Could not find promo : " + id);
    }
	
	
}
