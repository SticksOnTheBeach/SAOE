package fr.iutinfo.seatingplan.promo;

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
        if (promos.count() == 0) {
            promos.save(new Promo("BUT1"));
            promos.save(new Promo("BUT2"));
            promos.save(new Promo("BUT3"));
        }
    }
}