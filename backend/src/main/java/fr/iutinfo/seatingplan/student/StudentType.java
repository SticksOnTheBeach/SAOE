package fr.iutinfo.seatingplan.student;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;

import fr.iutinfo.seatingplan.room.SeatEquipment;

/**
 * Les particularités d'un étudiant, telles que le client les écrit dans le CSV.
 * Chacune peut imposer un équipement à la place (c'est ce que lit Timefold) :
 * PRM -> une place accessible, COMPUTER -> une place avec une prise.
 * EXTRA_TIME est une information : elle n'impose rien à la place.
 */
public enum StudentType {

    PRM("Élève à mobilité réduite", SeatEquipment.PRM),
    COMPUTER("Besoin d'un ordinateur", SeatEquipment.POWER_OUTLET),
    EXTRA_TIME("Tiers temps", null);

    private final String label;                    // le texte écrit dans le CSV
    private final SeatEquipment requiredEquipment; // null = n'impose rien à la place

    StudentType(String label, SeatEquipment requiredEquipment) {
        this.label = label;
        this.requiredEquipment = requiredEquipment;
    }

    public String getLabel() {
        return label;
    }

    public Optional<SeatEquipment> requiredEquipment() {
        return Optional.ofNullable(requiredEquipment);
    }

    /**
     * Retrouve une particularité à partir du texte du CSV.
     * On ignore la casse, les accents et les espaces en trop : "élève à mobilité réduite " est accepté.
     *
     * @throws IllegalArgumentException si le texte ne correspond à aucune particularité connue
     */
    public static StudentType fromLabel(String text) {
        String wanted = normalize(text);
        for (StudentType type : values()) {
            if (normalize(type.label).equals(wanted)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Particularité inconnue : '" + text + "'");
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