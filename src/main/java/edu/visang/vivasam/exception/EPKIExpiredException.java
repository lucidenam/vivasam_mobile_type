package edu.visang.vivasam.exception;

import org.springframework.security.core.AuthenticationException;

public class EPKIExpiredException extends AuthenticationException {
    public EPKIExpiredException(String msg, Throwable t) {
        super(msg, t);
    }

    public EPKIExpiredException(String msg) {
        super(msg);
    }
}
