package fr.iutinfo.seatingplan.student;

import java.util.UUID;

public class Student{
        private String id;
        private String firstName;
        private String lastName;
        private String group;

        public Student(String firstName, String lastName, String group){
                this.id = UUID.randomUUID().toString();
                this.firstName = firstName;
                this.lastName = lastName;
                this.group = group;

        }

}
