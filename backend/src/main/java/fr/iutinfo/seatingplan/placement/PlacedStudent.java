package fr.iutinfo.seatingplan.placement;

import fr.iutinfo.seatingplan.room.Seat;
import fr.iutinfo.seatingplan.student.Student;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

/**
 * Une ligne d'un plan enregistré : "cet étudiant est sur cette place".
 * C'est la version stockée en base d'un SeatAssignment (qui, lui, ne sert qu'à Timefold).
 */
@Entity
public class PlacedStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    protected PlacedStudent() {}

    public PlacedStudent(Student student, Seat seat) {
        this.student = student;
        this.seat = seat;
    }

    public Long getId() { return this.id; }
    public Student getStudent() { return this.student; }
    public Seat getSeat() { return this.seat; }
}
