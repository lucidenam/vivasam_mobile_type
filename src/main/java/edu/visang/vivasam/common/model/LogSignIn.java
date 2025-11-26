package edu.visang.vivasam.common.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class LogSignIn {
    private String logType = null;
    private String userId = null;
    private String sessId = null;
    private String remoteIp = null;
}
