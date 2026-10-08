package fr.iutinfo.seatingplan.student;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public class Student {
    private final String id;
    private final String firstName;
    private final String lastName;
    private final Group groupName;
    private final boolean needsPowerOutlet;

    public Student(String firstName, String lastName, Group groupName, boolean needsPowerOutlet) {
        // For now the id only exists in our code. Later it will be
        // replaced by the student's university student number,
        // stored in the database.
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
