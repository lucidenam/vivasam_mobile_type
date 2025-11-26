package edu.visang.vivasam.common.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class EmailInfo {
    private String vsCode = null;
    private String subject = null;
    private String to = null;
    private String from = null;
    private int htmlFlag = 1;
    private String sendDttm = null;
    private String content = null;
}
