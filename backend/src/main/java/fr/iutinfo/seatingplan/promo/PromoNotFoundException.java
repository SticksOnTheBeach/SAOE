package fr.iutinfo.seatingplan.promo;

public class PromoNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	public PromoNotFoundException(Long id){
		super("Erreur : la promo :" + id +" n'as pas été trouvée.");
	}
}
