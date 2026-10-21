package fr.iutinfo.seatingplan.testdata;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.student.Student;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestDataController {

    private final TestData testData;

    public TestDataController(TestData testData) {
        this.testData = testData;
    }

    @GetMapping("/students")
    public List<Student> students() {
        return testData.students();
    }

    @GetMapping("/room")
    public Room room() {
        return testData.room();
    }

    public record RoomForm(String name, int columns, int rows) {}

    @PostMapping("/room")
    public Room createRoom(@RequestBody RoomForm form) {
        System.out.println("Salle reçue : " + form.name() + " (" + form.columns() + "x" + form.rows() + ")");
        return testData.room();
    }
}