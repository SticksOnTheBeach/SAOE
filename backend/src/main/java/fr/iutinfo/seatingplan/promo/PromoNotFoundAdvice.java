package fr.iutinfo.seatingplan.promo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class PromoNotFoundAdvice {

  @ExceptionHandler(PromoNotFoundController.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String studentNotFoundHandler(PromoNotFoundController ex) {
    return ex.getMessage();
  }
}
