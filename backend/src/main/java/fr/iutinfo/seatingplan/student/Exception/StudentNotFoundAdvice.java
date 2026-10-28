package fr.iutinfo.seatingplan.student.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import fr.iutinfo.seatingplan.student.InvalidCsvException;

@RestControllerAdvice
public class StudentNotFoundAdvice {

  @ExceptionHandler(StudentNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String studentNotFoundHandler(StudentNotFoundException ex) {
    return ex.getMessage();
  }
  
  @ExceptionHandler(InvalidCsvException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String invalidCsvHandler(InvalidCsvException ex) {
      return ex.getMessage();
  }
}
