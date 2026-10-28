package fr.iutinfo.seatingplan.student;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
	List<Student> findByPromoId(Long promoId);
	List<Student> findByLastName(String lastName);
	List<Student> findByFirstName(String firstName);

}
