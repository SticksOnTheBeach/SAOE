package fr.iutinfo.seatingplan.testdata;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @PostMapping("/room")
    public Room handlePost(@RequestParam("name") String name) {
        return testData.room(name);
    }
}
