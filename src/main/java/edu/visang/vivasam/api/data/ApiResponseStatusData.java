package edu.visang.vivasam.api.data;

public class ApiResponseStatusData {
    private boolean error    ;
    private int code        ;
    private String type     ;
    private String message  ;

    public ApiResponseStatusData(boolean error, int code, String type, String message) {
        this.error = error;
        this.code = code;
        this.type = type;
        this.message = message;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ApiResponseStatusData{" +
                "error=" + error +
                ", code=" + code +
                ", type='" + type + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
