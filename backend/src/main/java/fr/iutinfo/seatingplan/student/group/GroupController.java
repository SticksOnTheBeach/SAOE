package fr.iutinfo.seatingplan.student.group;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    public record GroupResponse(String code, String promo) {}

    // tous les groupes et la promotion de chacun : le front en déduit les groupes proposés pour une promotion
    @GetMapping
    public List<GroupResponse> all() {
        return Arrays.stream(Group.values())
                .map(group -> new GroupResponse(group.name(), group.getPromoName()))
                .toList();
    }
}