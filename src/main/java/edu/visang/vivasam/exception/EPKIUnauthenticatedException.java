package edu.visang.vivasam.exception;

import org.springframework.security.core.AuthenticationException;

public class EPKIUnauthenticatedException extends AuthenticationException {
    public EPKIUnauthenticatedException(String msg, Throwable t) {
        super(msg, t);
    }

    public EPKIUnauthenticatedException(String msg) {
        super(msg);
    }
}
