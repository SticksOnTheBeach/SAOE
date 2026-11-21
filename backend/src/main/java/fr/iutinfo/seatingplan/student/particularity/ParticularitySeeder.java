package fr.iutinfo.seatingplan.student.particularity;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import fr.iutinfo.seatingplan.room.SeatEquipment;

/**
 * Crée les particularités du client au démarrage si elles n'existent pas encore.
 * Idempotent : on peut relancer l'application sans créer de doublons.
 */
@Component
class ParticularitySeeder implements CommandLineRunner {

    private final ParticularityRepository particularityRepository;

    ParticularitySeeder(ParticularityRepository particularityRepository) {
        this.particularityRepository = particularityRepository;
    }

   /* 
   @Override
    public void run(String... args) {
        seed(["PMR", "Élève à mobilité réduite"], SeatEquipment.PRM);

        seed(["Besoin d'un ordinateur", "ordinateur", "PC"], SeatEquipment.POWER_OUTLET);

        seed("Tier-temps", null);
    }

    private void seed(String label, SeatEquipment requiredEquipment) {
        boolean exists = particularityRepository.findAll().stream().anyMatch(p -> p.matches(label));
        if (!exists) {
            particularityRepository.save(new Particularity(label, requiredEquipment));
        }
    }*/
    
    @Override
    public void run(String... args) {
        seed(List.of("PMR", "Élève à mobilité réduite"), SeatEquipment.PRM);

        seed(List.of("Besoin d'un ordinateur", "ordinateur", "PC"), SeatEquipment.POWER_OUTLET);

        seed(List.of("Tiers temps", "Tiers-temps"), null);
    }

    private void seed(List<String> labels, SeatEquipment requiredEquipment) {
        for (String label : labels) {
            seed(label, requiredEquipment);
        }
    }

    private void seed(String label, SeatEquipment requiredEquipment) {
        boolean exists = particularityRepository.findAll().stream().anyMatch(p -> p.matches(label));
        if (!exists) {
            particularityRepository.save(new Particularity(label, requiredEquipment));
        }
    }
}