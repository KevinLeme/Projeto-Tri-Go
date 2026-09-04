package br.com.trigo.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException exception) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        detail.setTitle("Recurso não encontrado");
        return detail;
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream().findFirst().map(e -> e.getField() + ": " + e.getDefaultMessage()).orElse("Dados inválidos");
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
    }
}

