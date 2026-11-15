package fr.iutinfo.seatingplan.student;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.fasterxml.jackson.annotation.JsonIgnore;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.room.SeatEquipment;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
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
    // default false : sans ça, Hibernate ne peut pas ajouter la colonne NOT NULL à une table qui contient déjà des étudiants.
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean extraTime = false;
    
    @ManyToOne
    @JoinColumn(name = "promo_id")
    private Promo promo;

    @Enumerated(EnumType.STRING)
    private Group groupName; // pour que ça soit le groupe donc G1A et ps un entier qui dis qu'il s'agit du groupe 0 donc G1A, car sinon si on change l'ordre bah c'est relou donc voilà

    // Les particularités de l'étudiant (vide = aucune).
    // SUBSELECT : une seule requête pour charger les particularités de tous les étudiants d'une liste.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_particularity", joinColumns = @JoinColumn(name = "student_id"))
    @Enumerated(EnumType.STRING)
    @OrderColumn(name = "position")
    @Fetch(FetchMode.SUBSELECT)
    private List<StudentType> particularities = new ArrayList<>();    
    
    protected Student() {}
    
    public Student(String firstName, String lastName, Group groupName, List<StudentType> particularities, Promo promo) {
    	
        this.firstName = firstName;
        this.lastName = lastName;
        this.groupName = groupName;
        setParticularities(particularities);
        this.promo = promo;
    }
    
    public boolean isExtraTime() { return this.extraTime; }
    public void setExtraTime(boolean extraTime) { this.extraTime = extraTime; }
    public String getId() { return this.id; }
    public String getFirstName() { return this.firstName; }
    public String getLastName() { return this.lastName; }
    public Group getGroupName() { return this.groupName; }
    public Promo getPromo() { return this.promo; }
    public List<StudentType> getParticularities() { 
    	return List.copyOf(this.particularities); 
    }
    
    // En gros c'est ce que la place doit avoir pour cet étudiant, déduit de ses particularités (on gère les différents cas et contraintes avec timefold)
    // Calculé, pas stocké : @JsonIgnore pour ne pas l'envoyer au front.
    @JsonIgnore
    public List<SeatEquipment> getRequiredEquipment() {
        return this.particularities.stream()
                .map(StudentType::requiredEquipment)
                .flatMap(java.util.Optional::stream)
                .distinct()
                .toList();
    }
    
    
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
    public void setParticularities(List<StudentType> particularities) {
        // copie d'abord (on peut nous renvoyer notre propre liste) ; si oui les doublons sont ignorés :
        // le client peut écrire la même particularité dans deux colonnes
        List<StudentType> wanted = (particularities == null) ? new ArrayList<>() : new ArrayList<>(new LinkedHashSet<>(particularities));
        this.particularities.clear();
        this.particularities.addAll(wanted);
    }
    
    

    // est ce que l'étudiant a besoin de cet équipement là ?
    public boolean needs(SeatEquipment e) {
    	return getRequiredEquipment().contains(e);
    }
    
    
    
}
