package fr.iutinfo.seatingplan.student.particularity;

import java.text.Normalizer;
import java.util.Locale;

import fr.iutinfo.seatingplan.room.SeatEquipment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Une particularité d'étudiant (mobilité réduite, ordinateur, tiers temps...).
 * C'est une donnée et non un enum : en ajouter une (POST /api/particularities) ne demande aucune modification du code.
 * Si elle impose un équipement à la place, requiredEquipment le dit ; sinon il est null.
 */
@Entity
public class Particularity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // le texte exact que le client écrit dans son CSV
    @Column(nullable = false, unique = true, length = 100)
    private String label;

    // null = cette particularité n'impose rien à la place
    @Enumerated(EnumType.STRING)
    private SeatEquipment requiredEquipment;

    protected Particularity() {}

    public Particularity(String label, SeatEquipment requiredEquipment) {
        this.label = label;
        this.requiredEquipment = requiredEquipment;
    }

    public String getId() { return this.id; }
    public String getLabel() { return this.label; }
    public SeatEquipment getRequiredEquipment() { return this.requiredEquipment; }

    /**
     * Ce texte désigne-t-il cette particularité ?
     * On ignore la casse, les accents et les espaces en trop : "élève à mobilité réduite " est accepté.
     */
    public boolean matches(String text) {
        return text != null && normalize(this.label).equals(normalize(text));
    }

    private static String normalize(String text) {
        String withoutAccents = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return withoutAccents
                .replace('’', '\'')           // apostrophe typographique (Word, Excel)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }
}