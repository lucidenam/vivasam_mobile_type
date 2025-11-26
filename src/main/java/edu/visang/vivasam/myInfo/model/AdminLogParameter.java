package edu.visang.vivasam.myInfo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLogParameter {
    private String memberId;
    private String ipAddress;
    private String action;
    private String target;
    private String logState;
}
