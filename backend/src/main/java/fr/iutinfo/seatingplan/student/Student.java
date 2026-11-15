package fr.iutinfo.seatingplan.student;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.room.SeatEquipment;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private String id; // en gros l'id est généré automatiquement, par rapport à l'ordre dans lequel celui est incrémenter dans la bdd
    private String firstName;
    private String lastName;
    
    // Tiers temps : information sur l'étudiant, pas un besoin de place (la place n'a rien à fournir).
    private boolean extraTime = false;
    
    @ManyToOne
    @JoinColumn(name = "promo_id")
    private Promo promo;

    @Enumerated(EnumType.STRING)
    private Group groupName; // pour que ça soit le groupe donc G1A et ps un entier qui dis qu'il s'agit du groupe 0 donc G1A, car sinon si on change l'ordre bah c'est relou donc voilà

    // avant on avait juste un boolean needsPowerOutlet, mais du coup à chaque nouveau besoin (pmr, etc...) il fallait
    // rajouter un champ + une règle. Là on a une liste d'équipements, donc rajouter un besoin = rajouter une valeur
    // dans l'enum SeatEquipment et c'est tout, le reste du code bouge pas
    // EAGER : on veut les besoins de l'étudiant direct avec lui, sinon ça pète hors de la session hibernate
    // OrderColumn : hibernate garde l'ordre de la liste dans une colonne "position", du coup c'est une vraie liste et pas un sac
    // Fetch SUBSELECT : hibernate va chercher les équipements de tous les étudiants d'un coup dans une seule requête
    // au lieu d'une requête par étudiant, donc moins de requêtes quand on fait GET /api/students
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_required_equipment", joinColumns = @JoinColumn(name = "student_id"))
    @Enumerated(EnumType.STRING)
    @OrderColumn(name = "position")
    @Fetch(FetchMode.SUBSELECT)
    private List<SeatEquipment> requiredEquipment = new ArrayList<>();
    
    
    protected Student() {}
    
    public Student(String firstName, String lastName, Group groupName, List<SeatEquipment> requiredEquipment, Promo promo) {
        List<SeatEquipment> asked = checkRequiredEquipment(requiredEquipment);
        this.firstName = firstName;
        this.lastName = lastName;
        this.groupName = groupName;
        // copie modifiable : hibernate a besoin d'une vraie liste à lui
        this.requiredEquipment = new ArrayList<>(asked);
        this.promo = promo;
    }
    
    public boolean isExtraTime() { return this.extraTime; }
    public void setExtraTime(boolean extraTime) { this.extraTime = extraTime; }
    public String getId() { return this.id; }
    public String getFirstName() { return this.firstName; }
    public String getLastName() { return this.lastName; }
    public Group getGroupName() { return this.groupName; }
    public Promo getPromo() { return this.promo; }
    
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setGroupName(Group groupName) { 
    	this.groupName = groupName; 
    }
    
    // utilisé par le PUT : on remplace les besoins de l'étudiant sans le recréer
    public void setRequiredEquipment(List<SeatEquipment> requiredEquipment) {
        List<SeatEquipment> asked = checkRequiredEquipment(requiredEquipment);
        // on copie avant de vider, au cas où on nous passe la liste de l'étudiant lui même
        List<SeatEquipment> wanted = new ArrayList<>(asked);
        // clear + addAll sur la même liste, comme ça hibernate suit les changements
        this.requiredEquipment.clear();
        this.requiredEquipment.addAll(wanted);
    }
    
    

    // est ce que l'étudiant a besoin de cet équipement là ?
    public boolean needs(SeatEquipment e) {
    	return this.requiredEquipment.contains(e);
    }
    
    // copie non modifiable : personne ne peut rajouter un besoin dans notre dos sans passer par la validation
    public List<SeatEquipment> getRequiredEquipment() {
    	return Collections.unmodifiableList(new ArrayList<>(this.requiredEquipment));
    }
    
    // requiredEquipment null = aucun besoin, c'est pas une erreur. Par contre deux fois le même besoin, ça veut rien dire
    private static List<SeatEquipment> checkRequiredEquipment(List<SeatEquipment> requiredEquipment) {
        if (requiredEquipment == null) {
            return List.of();
        }
        if (new HashSet<>(requiredEquipment).size() != requiredEquipment.size()) {
            throw new IllegalArgumentException("Un étudiant ne peut pas avoir deux fois le même équipement");
        }
        return requiredEquipment;
    }
    
    
}
