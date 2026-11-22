package fr.iutinfo.seatingplan.plan;

import static org.hamcrest.Matchers.hasSize;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import fr.iutinfo.seatingplan.promo.*;
import fr.iutinfo.seatingplan.room.*;
import fr.iutinfo.seatingplan.student.*;
import fr.iutinfo.seatingplan.student.particularity.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:planCreation", "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class PlanCreationTest {
    @Autowired MockMvc mvc;
    @Autowired PromoRepository promos;
    @Autowired StudentRepository students;
    @Autowired RoomRepository rooms;
    @Autowired ParticularityRepository particularities;
    @Autowired JdbcTemplate db;

    @Test
    void storesCompatibleAssignmentsAndRejectsImpossiblePlansAtomically() throws Exception {
        Promo promo = promos.save(new Promo("Test placement"));
        var outlet = particularities.save(new Particularity("Test prise", SeatEquipment.POWER_OUTLET));
        students.save(new Student("A", "A", null, List.of(), promo));
        Student equipped = students.save(new Student("B", "B", null, List.of(outlet), promo));
        rooms.save(new Room("r1", "R1", 1, 3, List.of(
                new Seat("prise", 0, 0, SeatType.AVAILABLE, List.of(SeatEquipment.POWER_OUTLET)),
                new Seat("interdite", 0, 1, SeatType.FORBIDDEN),
                new Seat("simple", 0, 2, SeatType.AVAILABLE))));
        String json = """
                {"name":"Mon plan","roomId":"r1","promoId":%d}
                """.formatted(promo.getId());
        mvc.perform(post("/api/plans").contentType("application/json").content(json))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.assignments", hasSize(2)));
        assertThat(db.queryForObject("select seat_id from saved_plan_assignments where student_id = ?",
                String.class, equipped.getId())).isEqualTo("prise");

        rooms.save(new Room("r2", "R2", 1, 2, List.of(
                new Seat("s1", 0, 0, SeatType.AVAILABLE), new Seat("s2", 0, 1, SeatType.AVAILABLE))));
        mvc.perform(post("/api/plans").contentType("application/json").content(json.replace("r1", "r2")))
                .andExpect(status().isConflict());
        assertThat(db.queryForObject("select count(*) from saved_plan", Integer.class)).isEqualTo(1);
    }
}
