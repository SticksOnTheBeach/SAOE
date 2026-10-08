package fr.iutinfo.seatingplan.testdata;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TestDataController.class)
@Import(TestData.class)
class TestDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void studentsEndpointReturnsTheTwelveStudents() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12))
                .andExpect(jsonPath("$[0].id").isNotEmpty())
                .andExpect(jsonPath("$[0].firstName").value("Lea"))
                .andExpect(jsonPath("$[0].lastName").value("Martin"))
                .andExpect(jsonPath("$[0].groupName").value("G1A"))
                .andExpect(jsonPath("$[0].needsPowerOutlet").value(false))
                .andExpect(jsonPath("$[1].needsPowerOutlet").value(true));
    }

    @Test
    void roomEndpointReturnsTheGrid() throws Exception {
        mockMvc.perform(get("/api/room"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("105"))
                .andExpect(jsonPath("$.name").value("Room 105"))
                .andExpect(jsonPath("$.rows").value(5))
                .andExpect(jsonPath("$.columns").value(6))
                .andExpect(jsonPath("$.seats.length()").value(30))
                // Seats are listed row by row, so the seat at (row 1, column 2) is at index 1 * 6 + 2 = 8
                .andExpect(jsonPath("$.seats[8].id").value("r1c2"))
                .andExpect(jsonPath("$.seats[8].row").value(1))
                .andExpect(jsonPath("$.seats[8].column").value(2))
                .andExpect(jsonPath("$.seats[8].type").value("FORBIDDEN"))
                .andExpect(jsonPath("$.seats[24].type").value("POWER_OUTLET"));
    }
}
