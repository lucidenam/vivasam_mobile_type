package edu.visang.vivasam.common.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class PushAlarms {
    private String memberId;
    private String eventYn;
    private String materialUpdateYn;
    private String qnaAnswerYn;
    private String notiYn;
}
