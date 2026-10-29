package fr.iutinfo.seatingplan.promo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Promo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;   // "BUT1", "BUT2", "BUT3"

    protected Promo() {}

    public Promo(String name) {
        this.name = name;
    }

    public Long getId() { return this.id; }
    public String getName() { return this.name; }
    public void setName(String name) { this.name = name; }
}