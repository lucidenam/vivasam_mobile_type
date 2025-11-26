package edu.visang.vivasam.myInfo.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class SsoCellphoneUpdateLog {
    
    private Long id;
    private String memberId;
    private String cellphone;
    private String tschoolYn;
    private String ssoYn;

    public SsoCellphoneUpdateLog(String memberId, String cellphone) {
        this.memberId = memberId;
        this.cellphone = cellphone;
    }
    
}
