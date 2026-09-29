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
                .andExpect(jsonPath("$[0].id").value("s01"))
                .andExpect(jsonPath("$[0].lastName").value("Martin"))
                .andExpect(jsonPath("$[0].needsPowerOutlet").value(false))
                .andExpect(jsonPath("$[1].needsPowerOutlet").value(true));
    }

    @Test
    void roomEndpointReturnsTheGrid() throws Exception {
        mockMvc.perform(get("/api/room"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("105"))
                .andExpect(jsonPath("$.seats.length()").value(5))
                .andExpect(jsonPath("$.seats[0].length()").value(6))
                .andExpect(jsonPath("$.seats[1][2]").value("FORBIDDEN"))
                .andExpect(jsonPath("$.seats[4][0]").value("POWER_OUTLET"));
    }
}
