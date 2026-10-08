package fr.iutinfo.seatingplan.student;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public class Student{
        private String id;
        private String firstName;
        private String lastName;
        private Group groupName;
        private boolean needsPowerOutlet;

        public Student(String firstName, String lastName, Group groupName, boolean needsPowerOutlet){
                /*// pour l'instant l'id, est l'id de 
                l'étudiant dans notre code, mais dans le futur, 
                on pourra le remplacer par l'id de l'étudiant dans 
                la base de données, qui sera celui que l'étudiant possède, 
                c'est à dire son numéro étudiant universitaire
                */
                this.id = UUID.randomUUID().toString(); 
                this.firstName = firstName;
                this.lastName = lastName;
                this.groupName = groupName;
                this.needsPowerOutlet = needsPowerOutlet;

        }

        public String getId() { return this.id; }
        public String getFirstName() { return this.firstName; }
        public String getLastName() { return this.lastName; }
        public Group getGroupName() { return this.groupName; }

        // Without @JsonProperty, Jackson only serializes getXxx()/isXxx() methods
        @JsonProperty("needsPowerOutlet")
        public boolean needsPowerOutlet() { return this.needsPowerOutlet; }

}
