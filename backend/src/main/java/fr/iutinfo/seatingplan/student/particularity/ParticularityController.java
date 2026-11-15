package fr.iutinfo.seatingplan.student.particularity;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.room.SeatEquipment;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/particularities")
public class ParticularityController {

    private final ParticularityRepository particularityRepository;

    ParticularityController(ParticularityRepository particularityRepository) {
        this.particularityRepository = particularityRepository;
    }

    // le front construit son menu "Aménagements" avec cette liste : rien n'est codé en dur côté front
    @GetMapping
    public List<Particularity> all() {
        return particularityRepository.findAll();
    }

    public record ParticularityCreateRequest(@NotBlank @Size(max = 100) String label,
                                             SeatEquipment requiredEquipment) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Particularity create(@Valid @RequestBody ParticularityCreateRequest request) {
        String label = request.label().trim();
        boolean exists = particularityRepository.findAll().stream().anyMatch(p -> p.matches(label));
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La particularité '" + label + "' existe déjà");
        }
        return particularityRepository.save(new Particularity(label, request.requiredEquipment()));
    }
}	