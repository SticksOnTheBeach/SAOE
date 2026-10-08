package fr.iutinfo.seatingplan.student;

import java.util.UUID;

public class Student{
        private String id;
        private String firstName;
        private String lastName;
        private String group;

        public Student(String firstName, String lastName, String group){
                /*// pour l'instant l'id, est l'id de 
                l'étudiant dans notre code, mais dans le futur, 
                on pourra le remplacer par l'id de l'étudiant dans 
                la base de données, qui sera celui que l'étudiant possède, 
                c'est à dire son numéro étudiant universitaire
                */
                this.id = UUID.randomUUID().toString(); 
                this.firstName = firstName;
                this.lastName = lastName;
                this.group = group;

        }

}
