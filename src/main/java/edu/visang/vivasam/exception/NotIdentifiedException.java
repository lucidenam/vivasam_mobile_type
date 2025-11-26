package edu.visang.vivasam.exception;

import org.springframework.security.core.AuthenticationException;

public class NotIdentifiedException extends AuthenticationException {
    public NotIdentifiedException(String msg, Throwable t) {
        super(msg, t);
    }

    public NotIdentifiedException(String msg) {
        super(msg);
    }
}
