package fr.iutinfo.seatingplan.student.group;

import java.util.Arrays;
import java.util.List;

/**
 * Les groupes de l'IUT, chacun rattaché à une promotion.
 * Le CSV du client doit utiliser ces noms exacts (G1A, G4B...), et un groupe ne peut être utilisé que dans sa promotion t'façonn on renvoie une erreur si c'est pas respécté
 */
public enum Group {

    G1A("BUT1"), G1B("BUT1"), G2A("BUT1"), G2B("BUT1"), G3A("BUT1"), G3B("BUT1"),
    G4A("BUT2"), G4B("BUT2"), G5A("BUT2"), G5B("BUT2"), G6A("BUT2"), G6B("BUT2"),
    G7A("BUT3"), G7B("BUT3"), G8A("BUT3"), G8B("BUT3");

    private final String promoName;

    Group(String promoName) {
        this.promoName = promoName;
    }

    public String getPromoName() {
        return promoName;
    }

    // le nom de la promotion est comparé sans tenir compte de la casse ("but1" est accepté)
    public boolean belongsTo(String promoName) {
        return promoName != null && this.promoName.equalsIgnoreCase(promoName.trim());
    }

    // les groupes d'une promotion (liste vide si la promotion n'existe pas dans l'enum)
    public static List<Group> of(String promoName) {
        return Arrays.stream(values()).filter(group -> group.belongsTo(promoName)).toList();
    }

    // les promotions qui ont des groupes : BUT1, BUT2, BUT3
    public static List<String> promoNames() {
        return Arrays.stream(values()).map(Group::getPromoName).distinct().toList();
    }
}