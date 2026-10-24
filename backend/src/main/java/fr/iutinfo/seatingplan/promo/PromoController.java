package fr.iutinfo.seatingplan.promo;

import java.util.List;
import java.util.function.Supplier;

import org.hibernate.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.student.Student;
import fr.iutinfo.seatingplan.student.StudentRepository;
import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestController
@RequestMapping("/api/promos")
public class PromoController {

    public record CreatePromoRequest(String name) {}

    private final PromoRepository promos;
    private final StudentRepository students;

    public PromoController(PromoRepository promos, StudentRepository students) {
        this.promos = promos;
        this.students = students;
    }

    @GetMapping
    public List<Promo> list() {
        return promos.findAll();
    }
    
    @GetMapping("/{id}")
    public Promo one(@PathVariable Long id) {
        return promos.findById(id).orElseThrow(() -> new PromoNotFoundException(id));
    }

    @PostMapping
    public ResponseEntity<Promo> create(@RequestBody CreatePromoRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la promo est obligatoire");
        }
        String name = request.name().trim();
        if (promos.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La promo " + name + " existe déjà");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(promos.save(new Promo(name)));
    }

    @GetMapping("/{id}/students")
    public List<Student> studentsOf(@PathVariable Long id) {
        if (!promos.existsById(id)) {
            throw new PromoNotFoundException(id);
        }
        return students.findByPromoId(id);
    }
}