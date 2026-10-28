package fr.iutinfo.seatingplan.promo;

public class PromoNotFoundException extends RuntimeException {
		
	public PromoNotFoundException(Long id){
		super("Erreur : la promo :" + id +" n'as pas été trouvée.");
	}
}
