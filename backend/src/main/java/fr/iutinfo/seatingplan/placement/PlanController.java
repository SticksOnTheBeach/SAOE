package fr.iutinfo.seatingplan.placement;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ai.timefold.solver.core.api.solver.SolverManager;
import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.promo.PromoNotFoundException;
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.room.Room;
import fr.iutinfo.seatingplan.room.RoomNotFoundException;
import fr.iutinfo.seatingplan.room.RoomRepository;
import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.student.Student;
import fr.iutinfo.seatingplan.student.StudentRepository;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

    // Ce que le site envoie : un nom, UNE promo, une ou plusieurs salles (par leur id)
    public record GeneratePlanRequest(String name, Long promoId, List<String> roomIds) {}

    // Ce que le site reçoit
    public record PlacementResponse(Long studentId, String firstName, String lastName, String group,
                                    String roomId, String roomName, String seatId, int row, int column) {}

    public record PlanResponse(String id, String name, Long promoId, String promoName, List<String> roomIds,
                               boolean feasible, int hardScore, int softScore, Instant createdAt,
                               List<PlacementResponse> placements) {}

    public record PlanSummary(String id, String name, String promoName, int studentCount,
                              boolean feasible, Instant createdAt) {}

    private final SavedPlanRepository plans;
    private final RoomRepository rooms;
    private final PromoRepository promos;
    private final StudentRepository students;
    private final SolverManager<SeatingPlan, String> solverManager;

    public PlanController(SavedPlanRepository plans, RoomRepository rooms, PromoRepository promos,
                          StudentRepository students, SolverManager<SeatingPlan, String> solverManager) {
        this.plans = plans;
        this.rooms = rooms;
        this.promos = promos;
        this.students = students;
        this.solverManager = solverManager;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PlanSummary> all() {
        return plans.findAll().stream()
                .sorted(Comparator.comparing(SavedPlan::getCreatedAt).reversed())
                .map(plan -> new PlanSummary(plan.getId(), plan.getName(), plan.getPromo().getName(),
                        plan.getPlacements().size(), plan.isFeasible(), plan.getCreatedAt()))
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public PlanResponse one(@PathVariable String id) {
        SavedPlan plan = plans.findById(id).orElseThrow(() -> new PlanNotFoundException(id));
        return toResponse(plan);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PlanResponse> generate(@RequestBody GeneratePlanRequest request) {
        String name = checkedName(request.name());
        if (plans.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un plan nommé " + name + " existe déjà");
        }

        if (request.promoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La promo est obligatoire");
        }
        Promo promo = promos.findById(request.promoId())
                .orElseThrow(() -> new PromoNotFoundException(request.promoId()));

        List<String> roomIds = request.roomIds() == null ? List.of() : request.roomIds().stream().distinct().toList();
        if (roomIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choisis au moins une salle");
        }
        List<Room> chosenRooms = roomIds.stream()
                .map(id -> rooms.findById(id).orElseThrow(() -> new RoomNotFoundException(id)))
                .toList();

        List<Student> promoStudents = students.findByPromoId(promo.getId());
        if (promoStudents.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La promo " + promo.getName() + " n'a aucun étudiant");
        }

        checkCapacity(chosenRooms, promoStudents);

        // Le solveur ne reçoit que les places utilisables (pas les FORBIDDEN)
        List<Seat> seats = new ArrayList<>();
        for (Room room : chosenRooms) {
            for (Seat seat : room.getSeats()) {
                if (seat.isUsable()) {
                    seats.add(seat);
                }
            }
        }
        List<SeatAssignment> assignments = new ArrayList<>();
        for (Student student : promoStudents) {
            assignments.add(new SeatAssignment(student));
        }

        SeatingPlan solved = solve(new SeatingPlan(seats, assignments));

        SavedPlan saved = plans.save(new SavedPlan(name, promo, chosenRooms, solved));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!plans.existsById(id)) {
            throw new PlanNotFoundException(id);
        }
        plans.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- helpers ----------

    private SeatingPlan solve(SeatingPlan problem) {
        try {
            // solve() lance le calcul en arrière-plan ; getFinalBestSolution() attend la fin
            // (durée limitée par timefold.solver.termination.* dans application.properties)
            return solverManager.solve(UUID.randomUUID().toString(), problem).getFinalBestSolution();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Le calcul du plan a été interrompu");
        } catch (ExecutionException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Le calcul du plan a échoué : " + e.getCause());
        }
    }

    // Si c'est impossible, on répond 409 avec les chiffres : le site peut proposer une autre salle
    private static void checkCapacity(List<Room> chosenRooms, List<Student> promoStudents) {
        int usable = chosenRooms.stream().mapToInt(Room::getUsableSeatCount).sum();
        if (promoStudents.size() > usable) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    promoStudents.size() + " étudiants pour " + usable + " places utilisables : choisis une autre salle");
        }
        int outlets = chosenRooms.stream().mapToInt(Room::getOutletSeatCount).sum();
        long needOutlet = promoStudents.stream().filter(Student::needsPowerOutlet).count();
        if (needOutlet > outlets) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    needOutlet + " étudiants ont besoin d'une prise pour " + outlets + " places avec prise : choisis une autre salle");
        }
    }

    private static String checkedName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty() || trimmed.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom du plan doit faire entre 1 et 100 caractères");
        }
        return trimmed;
    }

    // À appeler dans une transaction (rooms et placements sont LAZY)
    private static PlanResponse toResponse(SavedPlan plan) {
        Map<String, Room> roomOfSeat = new HashMap<>();
        for (Room room : plan.getRooms()) {
            for (Seat seat : room.getSeats()) {
                roomOfSeat.put(seat.getId(), room);
            }
        }

        List<PlacementResponse> placements = new ArrayList<>();
        for (PlacedStudent placed : plan.getPlacements()) {
            Student student = placed.getStudent();
            Seat seat = placed.getSeat();
            Room room = roomOfSeat.get(seat.getId());
            placements.add(new PlacementResponse(
                    student.getId(), student.getFirstName(), student.getLastName(), student.getGroupName().name(),
                    room == null ? null : room.getId(), room == null ? null : room.getName(),
                    seat.getId(), seat.getRow(), seat.getColumn()));
        }

        return new PlanResponse(plan.getId(), plan.getName(), plan.getPromo().getId(), plan.getPromo().getName(),
                plan.getRooms().stream().map(Room::getId).toList(),
                plan.isFeasible(), plan.getHardScore(), plan.getSoftScore(), plan.getCreatedAt(), placements);
    }
}
