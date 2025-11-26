package edu.visang.vivasam.payload;

public class ResponseMessage {
    private String code;
    private String message;
    private Exception exception;

    public ResponseMessage(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public Exception getException() {
        return exception;
    }

    public void setException(Exception exception) {
        this.exception = exception;
    }
}
