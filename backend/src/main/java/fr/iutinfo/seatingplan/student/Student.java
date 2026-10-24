package fr.iutinfo.seatingplan.student;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id; // en gros l'id est généré automatiquement, par rapport à l'ordre dans lequel celui est incrémenter dans la bdd
    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Group groupName; // pour que ça soit le groupe donc G1A et ps un entier qui dis qu'il s'agit du groupe 0 donc G1A, car sinon si on change l'ordre bah c'est relou donc voilà

    private boolean needsPowerOutlet;
    
    protected Student() {}
    
    public Student(String firstName, String lastName, Group groupName, boolean needsPowerOutlet) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.groupName = groupName;
        this.needsPowerOutlet = needsPowerOutlet;
    }

    public Long getId() { return this.id; }
    public String getFirstName() { return this.firstName; }
    public String getLastName() { return this.lastName; }
    public Group getGroupName() { return this.groupName; }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setGroupName(Group groupName) { 
    	this.groupName = groupName; 
    }
    public void setNeedsPowerOutlet(boolean needsPowerOutlet) { 
    	this.needsPowerOutlet = needsPowerOutlet; 
    }
    
    

    // Without @JsonProperty, Jackson only serializes getXxx()/isXxx() methods
    @JsonProperty("needsPowerOutlet")
    public boolean needsPowerOutlet() { return this.needsPowerOutlet; }
}
