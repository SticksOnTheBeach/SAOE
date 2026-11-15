package fr.iutinfo.seatingplan.student;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.promo.PromoNotFoundException;
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.room.SeatEquipment;
import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestController
@RequestMapping("/api/students")
public class StudentController {
	
	private StudentRepository studentRepository;
	private PromoRepository promoRepository;
	
	
	StudentController(StudentRepository repository, PromoRepository promoRepository){
		
		this.studentRepository = repository;
		this.promoRepository = promoRepository;
	}

	
	@GetMapping()
	public List<Student> all(){
		return studentRepository.findAll();
	}
	
	@GetMapping("/{id}")
	public Student one(@PathVariable String id) {
		return studentRepository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
	}
	
	
	@PutMapping("/{id}")
	Student replaceStudent(@RequestBody Student newStudent, @PathVariable String id) {
	    
	    return studentRepository.findById(id)
	      .map(student -> {
	    	 student.setFirstName(newStudent.getFirstName());
	    	 student.setLastName(newStudent.getLastName());
	    	 student.setGroupName(newStudent.getGroupName());
	    	 student.setRequiredEquipment(newStudent.getRequiredEquipment());
	    	 student.setExtraTime(newStudent.isExtraTime());
	        return studentRepository.save(student);
	      })
	      .orElseGet(() -> {
	        return studentRepository.save(newStudent);
	      });
	}
	
	@GetMapping("/firstName/{firstName}")
	public List<Student> findStudentByFirstName(@PathVariable String firstName){
		return studentRepository.findByFirstName(firstName);
	}
	
	
	@GetMapping("/lastName/{lastName}")
	public List<Student> findStudentByLastName(@PathVariable String lastName){
		return studentRepository.findByLastNameIgnoreCase(lastName);
	}
	
	
	
	@DeleteMapping("/{id}")
	void deleteStudent(@PathVariable String id) {
		studentRepository.deleteById(id);
	  }
	
	
	// import csv des étudiants
	
	@PostMapping("/import")
	public List<Student> importCsv(@RequestParam("file") MultipartFile file, @RequestParam Long promoId) throws IOException {


	    Promo promo = promoRepository.findById(promoId).orElseThrow( () -> new PromoNotFoundException(promoId)) ;


	    List<Student> students = new ArrayList<>();

	    try (BufferedReader reader = new BufferedReader(
	        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

	        String line = reader.readLine();   // l'en-tête, on la saute
	        int numeroLigne = 1;

	        while ((line = reader.readLine()) != null) {
	            numeroLigne++;
	            // en gros on ignore les lignes vides
	            if (!line.isBlank()) {
	            	// split avec -1 sinon java jette les colonnes vides de la fin, donc "a;b;c;d;" perdrait la 5eme
	            	String[] columns = line.split(";", -1);
	            	// 4 colonnes = l'ancien format "nom;prenom;groupe;prise", 5 = + la colonne pmr, 6 = + la colonne tiers temps
	            	if (columns.length < 4 || columns.length > 6) {
	                    throw new InvalidCsvException("Ligne " + numeroLigne + " : 4 à 6 colonnes attendues, " + columns.length + " trouvées");
	                }
	            	
	            	String lastName = columns[0].trim();
	                String firstName = columns[1].trim();
	                String groupe = columns[2].trim().toUpperCase();
	                
	                // on construit la liste des besoins de l'étudiant : une colonne à "oui" = un équipement en plus
	                List<SeatEquipment> requiredEquipment = new ArrayList<>();
	                if (columns[3].trim().equalsIgnoreCase("oui")) {
	                	requiredEquipment.add(SeatEquipment.POWER_OUTLET);
	                }
	                if (columns.length >= 5 && columns[4].trim().equalsIgnoreCase("oui")) {
	                	requiredEquipment.add(SeatEquipment.PRM);
	                }

	                Group group;
	                try {
	                    group = Group.valueOf(groupe);
	                } catch (IllegalArgumentException e) {
	                    throw new InvalidCsvException("Ligne " + numeroLigne + " : groupe inconnu '" + groupe + "'");
	                }

	                students.add(new Student(firstName, lastName, group, requiredEquipment, promo));
	            }
	            // 2. découper, valider, créer le Student, l'ajouter à la liste
	        }
	    }

	    // 3. enregistrer
	    return studentRepository.saveAll(students);
	}
}
