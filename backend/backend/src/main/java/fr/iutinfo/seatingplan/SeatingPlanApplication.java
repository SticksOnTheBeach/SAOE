package fr.iutinfo.seatingplan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * L'annotation @SpringBootApplication active l'auto-configuration, 
 * le scan des composants dans ce package, et définit cette classe 
 * comme fichier de configuration
 */
@SpringBootApplication
public class SeatingPlanApplication {
	
	/**
     * Méthode principale qui lance l'application.
     * @param args Arguments passés en ligne de commande.
     */
    public static void main(String[] args) {
        SpringApplication.run(SeatingPlanApplication.class, args);
    }
}
