package fr.iutinfo.seatingplan.promo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import fr.iutinfo.seatingplan.student.Exception.StudentNotFoundException;

@RestControllerAdvice
public class PromoNotFoundAdvice {

  @ExceptionHandler(PromoNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String studentNotFoundHandler(PromoNotFoundException ex) {
    return ex.getMessage();
  }
}
