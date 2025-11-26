package edu.visang.vivasam.exception;

import org.springframework.security.core.AuthenticationException;

public class RestingAccountException extends AuthenticationException {
    public RestingAccountException(String msg, Throwable t) {
        super(msg, t);
    }

    public RestingAccountException(String msg) {
        super(msg);
    }
}
