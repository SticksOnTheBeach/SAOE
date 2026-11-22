package fr.iutinfo.seatingplan.plan;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.RoomRepository;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.student.Student;
import fr.iutinfo.seatingplan.student.StudentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/plans")
public class PlanController {
    private final RoomRepository rooms;
    private final PromoRepository promos;
    private final StudentRepository students;
    private final SavedPlanRepository plans;

    public PlanController(RoomRepository rooms, PromoRepository promos, StudentRepository students, SavedPlanRepository plans) {
        this.rooms = rooms;
        this.promos = promos;
        this.students = students;
        this.plans = plans;
    }

    public record Request(@NotBlank @Size(max = 255) String name, @NotBlank String roomId, @NotNull Long promoId) {}
    public record Result(String id, String name, String roomId, Long promoId, List<SeatAssignment> assignments) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Result create(@Valid @RequestBody Request request) {
        Room room = rooms.findById(request.roomId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable."));
        Promo promo = promos.findById(request.promoId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion introuvable."));
        List<Student> roster = students.findByPromoId(promo.getId());
        if (roster.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La promotion est vide.");
        }
        if (roster.size() > room.getUsableSeatCount()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La salle ne contient pas assez de places disponibles.");
        }

        // Avec deux équipements possibles, réserver d'abord les places doubles aux
        // étudiants qui ont les deux besoins, puis traiter les besoins simples.
        roster.sort(Comparator.comparingInt((Student s) -> s.getRequiredEquipment().size()).reversed()
                .thenComparing(Student::getId));
        List<Seat> free = new ArrayList<>(room.getSeats().stream().filter(Seat::isUsable)
                .sorted(Comparator.comparingInt((Seat s) -> s.getEquipment().size())
                        .thenComparingInt(Seat::getRow).thenComparingInt(Seat::getColumn))
                .toList());

        List<SeatAssignment> assignments = new ArrayList<>();
        for (Student student : roster) {
            var required = student.getRequiredEquipment();
            // Prendre la place compatible la moins équipée préserve les places polyvalentes.
            Seat seat = free.stream().filter(s -> s.getEquipment().containsAll(required)).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                            "Les équipements disponibles ne permettent pas de placer toute la promotion."));
            assignments.add(new SeatAssignment(student.getId(), seat.getId(), seat.getRow(), seat.getColumn()));
            free.remove(seat);
        }

        SavedPlan plan = plans.save(new SavedPlan(request.name().trim(), promo, room.getId(), assignments));
        return new Result(plan.getUuid(), plan.getName(), room.getId(), promo.getId(), assignments);
    }
}
