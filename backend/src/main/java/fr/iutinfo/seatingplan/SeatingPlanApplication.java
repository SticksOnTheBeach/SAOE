package fr.iutinfo.seatingplan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @SpringBootApplication enables auto-configuration, scans components
 * in this package and its sub-packages, and marks this class as a
 * configuration class.
 */
@SpringBootApplication
public class SeatingPlanApplication {
	
	/**
     * Starts the application.
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(SeatingPlanApplication.class, args);
    }
}
