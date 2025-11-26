package edu.visang.vivasam.common.utils;

import lombok.Data;
import lombok.ToString;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@ToString
public class UserSendLog implements Serializable {

    public long userSendIdx;
    public String userSendLogIp;
    public String userSendLogType;
    public String userSendLogValue;
    public String userSendLogSendDate;
    public String userSendLogLoginId;

}
