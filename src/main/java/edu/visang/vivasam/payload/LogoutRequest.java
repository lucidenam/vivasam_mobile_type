package edu.visang.vivasam.payload;

import lombok.Data;

@Data
public class LogoutRequest {
    private String username;

    private String sessionId;

    private String logType;

}
