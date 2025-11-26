package edu.visang.vivasam.exception;

public class VivasamException extends RuntimeException{
    /**
     * Error Code
     */
    private String code;

    /**
     * Error Message
     */
    private String message;

    public VivasamException() {
        super();
    }

    public VivasamException(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(super.getMessage());
        sb.append(":");
        sb.append(this.code);
        return sb.toString();
    }
}
