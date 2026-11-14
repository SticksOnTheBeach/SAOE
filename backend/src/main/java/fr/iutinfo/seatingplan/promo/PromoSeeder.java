package fr.iutinfo.seatingplan.promo;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PromoSeeder implements CommandLineRunner {

    private final PromoRepository promos;

    public PromoSeeder(PromoRepository promos) {
        this.promos = promos;
    }

    @Override
    public void run(String... args) {
        for (String name : List.of("BUT1", "BUT2", "BUT3")) {
            if (!promos.existsByName(name)) {
                promos.save(new Promo(name));
            }
        }
    }
}