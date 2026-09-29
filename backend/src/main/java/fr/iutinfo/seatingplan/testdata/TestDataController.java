package fr.iutinfo.seatingplan.testdata;

import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.student.Student;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
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
}
