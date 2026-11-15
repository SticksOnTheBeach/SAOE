package fr.iutinfo.seatingplan.student;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
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
import org.springframework.web.server.ResponseStatusException;

import fr.iutinfo.seatingplan.promo.Promo;
import fr.iutinfo.seatingplan.promo.PromoRepository;
import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;
import fr.iutinfo.seatingplan.student.group.Group;
import fr.iutinfo.seatingplan.student.particularity.Particularity;
import fr.iutinfo.seatingplan.student.particularity.ParticularityRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private static final int PROMO_NAME_MAX_LENGTH = 50;

	private StudentRepository studentRepository;
	private PromoRepository promoRepository;
	private ParticularityRepository particularityRepository;


	StudentController(StudentRepository repository, PromoRepository promoRepository,
					  ParticularityRepository particularityRepository){

		this.studentRepository = repository;
		this.promoRepository = promoRepository;
		this.particularityRepository = particularityRepository;
	}


	@GetMapping()
	public List<Student> all(){
		return studentRepository.findAll();
	}

	@GetMapping("/{id}")
	public Student one(@PathVariable String id) {
		return studentRepository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
	}


	// ce que le front envoie pour modifier un étudiant : les particularités sont désignées par leur id
	public record StudentUpdateRequest(@NotBlank String firstName,
									   @NotBlank String lastName,
									   @NotNull Group groupName,
									   List<String> particularityIds) {}

	// PUT sur un id inconnu : 404 (on ne crée pas d'étudiant par un PUT)
	@PutMapping("/{id}")
	public Student replaceStudent(@Valid @RequestBody StudentUpdateRequest request, @PathVariable String id) {

		Student student = studentRepository.findById(id)
				.orElseThrow(() -> new StudentNotFoundException(id));

		List<String> ids = (request.particularityIds() == null) ? List.of() : request.particularityIds().stream().distinct().toList();
		List<Particularity> particularities = particularityRepository.findAllById(ids);
		if (particularities.size() != ids.size()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une des particularités demandées n'existe pas");
		}

		// un groupe n'existe que dans sa promotion : G4A ne peut pas aller à un étudiant de BUT1
		if (student.getPromo() != null && !request.groupName().belongsTo(student.getPromo().getName())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Le groupe " + request.groupName() + " n'appartient pas à la promotion " + student.getPromo().getName());
		}

		student.setFirstName(request.firstName().trim());
		student.setLastName(request.lastName().trim());
		student.setGroupName(request.groupName());
		student.setParticularities(particularities);
		return studentRepository.save(student);
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


	// une ligne du CSV, déjà lue et validée
	private record CsvRow(String firstName, String lastName, Group group, String promoName, List<Particularity> particularities) {}
	
	// méthod ebaaaaaaad longue mais en gros j'explique dans les commentaires
	// import csv des étudiants
	// Format du client : Prénom;Nom;Groupe;Promotion;Particularité 1;Particularité 2 (autant de particularités que de colonnes)
	// La promotion est dans le fichier : on la retrouve par son nom, ou on la crée.
	// Les particularités sont retrouvées par leur libellé dans la table particularity : en ajouter une ne change pas ce code.
	@PostMapping("/import")
	@Transactional
	public List<Student> importCsv(@RequestParam("file") MultipartFile file) throws IOException {

		String content = decode(file.getBytes());
		String[] lines = content.split("\\R", -1);
		List<Particularity> knownParticularities = particularityRepository.findAll();

		// 1. tout lire et valider avant d'écrire quoi que ce soit en base : une erreur ne laisse rien derrière elle
		List<CsvRow> rows = new ArrayList<>();
		for (int i = 1; i < lines.length; i++) { // lines[0] = l'en-tête, on la saute
			String line = lines[i];
			if (line.isBlank()) {
				continue; // lignes vides ignorées
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
			String groupText = columns[2].trim().toUpperCase(Locale.ROOT);
			String promoName = columns[3].trim();

			if (firstName.isEmpty() || lastName.isEmpty()) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : le prénom et le nom sont obligatoires");
			}
			if (groupText.isEmpty()) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : le groupe est obligatoire");
			}
			if (promoName.isEmpty() || promoName.length() > PROMO_NAME_MAX_LENGTH) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : la promotion est obligatoire (" + PROMO_NAME_MAX_LENGTH + " caractères maximum)");
			}

			// le groupe doit être l'un de ceux de l'enum Group : on impose ce format au client
			Group group;
			try {
				group = Group.valueOf(groupText);
			} catch (IllegalArgumentException e) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : groupe inconnu '" + groupText
						+ "' (groupes acceptés : " + Arrays.toString(Group.values()) + ")");
			}

			// le groupe doit appartenir à la promotion de la ligne (G1A..G3B = BUT1, G4A..G6B = BUT2, G7A..G8B = BUT3)
			if (Group.of(promoName).isEmpty()) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : promotion inconnue '" + promoName
						+ "' (promotions acceptées : " + Group.promoNames() + ")");
			}
			if (!group.belongsTo(promoName)) {
				throw new InvalidCsvException("Ligne " + numeroLigne + " : le groupe " + group + " n'appartient pas à la promotion " + promoName + " (Les groupes de " + promoName + " sont : " + Group.of(promoName) + ")");
			}

			// les colonnes suivantes sont des particularités ; une cellule vide est ignorée
			List<Particularity> particularities = new ArrayList<>();
			for (int j = 4; j < columns.length; j++) {
				String cell = columns[j].trim();
				if (cell.isEmpty()) {
					continue;
				}
				Particularity found = knownParticularities.stream()
						.filter(p -> p.matches(cell))
						.findFirst()
						.orElseThrow(() -> new InvalidCsvException("Ligne " + numeroLigne + " : particularité inconnue '" + cell + "'"));
				particularities.add(found);
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
	// Méthode que j'ai récupéré sur internet par ce que j'ai rien compris
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