package fr.iutinfo.seatingplan.student;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/students")
public class StudentController {
	private static final int PROMO_NAME_MAX_LENGTH = 50;
	
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
	    	 student.setParticularities(newStudent.getParticularities());
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
		// Format du client : Prénom;Nom;Groupe;Promotion;Particularité 1;Particularité 2 (autant de particularités que de colonnes)
		// La promotion est dans le fichier : on la retrouve par son nom, ou on la crée.
		@PostMapping("/import")
		@Transactional
		public List<Student> importCsv(@RequestParam("file") MultipartFile file) throws IOException {

			String content = decode(file.getBytes());
			String[] lines = content.split("\\R", -1);

			// 1. tout lire et valider avant d'écrire quoi que ce soit en base : une erreur ne laisse rien derrière elle
			List<CsvRow> rows = new ArrayList<>();
			for (int i = 1; i < lines.length; i++) {   // lines[0] = l'en-tête, on la saute
				String line = lines[i];
				if (line.isBlank()) {
					continue;                          // lignes vides ignorées
				}
				int numeroLigne = i + 1;

				// split avec -1 sinon java jette les colonnes vides de la fin ("a;b;c;d;;" perdrait les dernières)
				String[] columns = line.split(";", -1);
				if (columns.length < 4) {
					throw new InvalidCsvException("Ligne " + numeroLigne + " : au moins 4 colonnes attendues (Prénom;Nom;Groupe;Promotion), "
							+ columns.length + " trouvées");
				}

				String firstName = columns[0].trim();
				String lastName = columns[1].trim();
				String group = columns[2].trim().toUpperCase(Locale.ROOT);
				String promoName = columns[3].trim();

				if (firstName.isEmpty() || lastName.isEmpty()) {
					throw new InvalidCsvException("Ligne " + numeroLigne + " : le prénom et le nom sont obligatoires");
				}
				if (group.isEmpty()) {
					throw new InvalidCsvException("Ligne " + numeroLigne + " : le groupe est obligatoire");
				}
				if (promoName.isEmpty() || promoName.length() > PROMO_NAME_MAX_LENGTH) {
					throw new InvalidCsvException("Ligne " + numeroLigne + " : la promotion est obligatoire (" + PROMO_NAME_MAX_LENGTH + " caractères maximum)");
				}

				// les colonnes suivantes sont des particularités ; une cellule vide est ignorée
				List<StudentType> particularities = new ArrayList<>();
				for (int j = 4; j < columns.length; j++) {
					String cell = columns[j].trim();
					if (cell.isEmpty()) {
						continue;
					}
					try {
						particularities.add(StudentType.fromLabel(cell));
					} catch (IllegalArgumentException e) {
						throw new InvalidCsvException("Ligne " + numeroLigne + " : particularité inconnue '" + cell + "'");
					}
				}

				rows.add(new CsvRow(firstName, lastName, group, promoName, particularities));
			}

			if (rows.isEmpty()) {
				throw new InvalidCsvException("Le fichier ne contient aucun étudiant");
			}

			// 2. tout est valide : on retrouve (ou on crée) chaque promotion une seule fois, puis on crée les étudiants
			Map<String, Promo> promos = new HashMap<>();
			List<Student> students = new ArrayList<>();
			for (CsvRow row : rows) {
				Promo promo = promos.computeIfAbsent(row.promoName().toLowerCase(Locale.ROOT),
						key -> promoRepository.findByNameIgnoreCase(row.promoName())
								.orElseGet(() -> promoRepository.save(new Promo(row.promoName()))));
				students.add(new Student(row.firstName(), row.lastName(), row.group(), row.particularities(), promo));
			}

			// 3. enregistrer
			return studentRepository.saveAll(students);
		}
		
		
		// Excel sous Windows enregistre souvent en Windows-1252 : on essaie l'UTF-8 strict, sinon on retombe dessus.
		private static String decode(byte[] bytes) {
			String text;
			try {
				text = StandardCharsets.UTF_8.newDecoder()
						.onMalformedInput(CodingErrorAction.REPORT)
						.onUnmappableCharacter(CodingErrorAction.REPORT)
						.decode(ByteBuffer.wrap(bytes))
						.toString();
			} catch (CharacterCodingException e) {
				text = new String(bytes, Charset.forName("windows-1252"));
			}
			// le BOM que mettent certains éditeurs en début de fichier
			return text.startsWith("﻿") ? text.substring(1) : text;
		}
}